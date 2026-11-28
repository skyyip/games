import {cardById} from './economy.js';
import {parseMarketAction,sameMarketAction,marketResult} from './market-policy.js';
const listingRef=(c,id)=>c.doc(c.db,'hkm_market_listings',id),walletRef=(c,uid)=>c.doc(c.db,'hkm_wallets',uid),receiptRef=(c,uid,id)=>c.doc(c.db,'hkm_wallets',uid,'marketReceipts',id);
const numeric=l=>({...l,createdAt:l.createdAt?.toMillis?.()??l.createdAt,updatedAt:l.updatedAt?.toMillis?.()??l.updatedAt});
export async function marketStatus(c,uid,input){
 const action=parseMarketAction(input),snap=await c.getDocFromServer(receiptRef(c,uid,action.requestId));
 if(!snap.exists())return {confirmed:false};const receipt=snap.data();if(receipt.uid!==uid||!sameMarketAction(receipt.action,action))throw Error('market-request-mismatch');
 return {confirmed:true,result:receipt.result};
}
export async function marketListings(c,uid,{mine=false,after=null}={}){
 const filters=[...(mine?[c.where('sellerUid','==',uid)]:[]),c.where('status','==','active'),c.orderBy('createdAt','desc')];
 if(after){parseMarketAction({type:'cancel',requestId:after,listingId:after});const cursor=await c.getDocFromServer(listingRef(c,after));if(!cursor.exists())throw Error('market-listing-missing');filters.push(c.startAfter(cursor));}
 const rows=await c.getDocsFromServer(c.query(c.collection(c.db,'hkm_market_listings'),...filters,c.limit(24)));
 return {items:rows.docs.map(d=>numeric({id:d.id,...d.data()})).filter(l=>mine||l.sellerUid!==uid),cursor:rows.size===24?rows.docs.at(-1).id:null};
}
export async function marketAction(c,uid,input){
 const action=parseMarketAction(input),id=action.type==='list'?action.requestId:action.listingId,ref=listingRef(c,id),own=walletRef(c,uid),receipt=receiptRef(c,uid,action.requestId);
 let revision=null;
 for(let attempt=0;attempt<3;attempt++)try{return await c.runTransaction(c.db,async t=>{
  const saved=await t.get(receipt);if(saved.exists()){if(!sameMarketAction(saved.data().action,action))throw Error('market-request-mismatch');return {...saved.data().result,replayed:true};}
  const [profileSnap,walletSnap,listingSnap]=await Promise.all([t.get(c.doc(c.db,'hkm_players',uid)),t.get(own),t.get(ref)]);
  if(!profileSnap.exists()||!walletSnap.exists())throw Error('market-wallet-not-ready');
  const w=walletSnap.data(),stamp=c.serverTimestamp();revision=w.revision;let listing,result,patch={revision:w.revision+1,op:'market-'+action.type,item:id,receipt:action.requestId,updatedAt:stamp};
  if(action.type==='list'){
   if(!cardById(action.cardId))throw Error('invalid-market-card');if(listingSnap.exists())throw Error('market-request-mismatch');
   const n=w.cards[action.cardId]??0;if(!Number.isSafeInteger(n)||n<2)throw Error('market-duplicate-required');
   listing={sellerUid:uid,sellerName:profileSnap.data().displayName,cardId:action.cardId,price:action.price,status:'active',createdAt:stamp,updatedAt:stamp};
   patch.cards={...w.cards,[action.cardId]:n-1};result=marketResult(action,listing);t.set(ref,listing);
  }else{
   if(!listingSnap.exists())throw Error('market-listing-missing');listing=listingSnap.data();if(listing.status!=='active')throw Error('market-listing-unavailable');
   if(action.type==='cancel'){
    if(listing.sellerUid!==uid)throw Error('market-not-seller');patch.cards={...w.cards,[listing.cardId]:(w.cards[listing.cardId]??0)+1};
    t.update(ref,{status:'cancelled',updatedAt:stamp,cancelledAt:stamp});
   }else{
    if(listing.sellerUid===uid)throw Error('market-own-listing');if(action.price!==listing.price)throw Error('market-price-changed');
    if(profileSnap.data().total+w.bonus-w.spent<listing.price)throw Error('insufficient-balance');
    result=marketResult(action,listing);patch.spent=w.spent+listing.price;patch.cards={...w.cards,[listing.cardId]:(w.cards[listing.cardId]??0)+1};
    // Blind increments preserve the seller's private wallet and concurrent quiz rewards.
    t.update(walletRef(c,listing.sellerUid),{bonus:c.increment(result.proceeds),revision:c.increment(1),op:'market-sale',item:id,updatedAt:stamp});
    t.update(ref,{status:'sold',updatedAt:stamp,soldAt:stamp});
    t.set(c.doc(c.db,'hkm_market_trades',id),{listingId:id,buyerUid:uid,sellerUid:listing.sellerUid,cardId:listing.cardId,price:listing.price,fee:result.fee,proceeds:result.proceeds,requestId:action.requestId,createdAt:stamp});
   }
   result??=marketResult(action,listing);
  }
  t.update(own,patch);t.set(receipt,{uid,action,result,createdAt:stamp});return {...result,replayed:false};
 });}catch(error){
  // A racing commit may be reported as a rule rejection before the SDK retries.
  // Confirm the original receipt first; never replace its request ID.
  let checked;try{checked=await marketStatus(c,uid,action);}catch{}
  if(checked?.confirmed)return {...checked.result,replayed:true};
  if(error.code==='permission-denied'&&checked?.confirmed===false){
   const [latest,offer]=await Promise.all([c.getDocFromServer(own),c.getDocFromServer(ref)]);
   if(action.type!=='list'&&(!offer.exists()||offer.data().status!=='active'))throw Error('market-listing-unavailable');
   if(action.type==='list'&&latest.exists()&&(latest.data().cards[action.cardId]??0)<2)throw Error('market-duplicate-required');
   if(attempt<2&&latest.exists()&&latest.data().revision!==revision)continue;
  }
  throw error;
 }
}
