import {packState,unpackState,inventory,takeGift,receiveGift,hkDay,playerName,GIFT_LIMIT} from './player-state.js';
import {createPlayerHandle} from './player-handle.js';
export function createPlayerAPI({sdk:s,db,uid,currentUser=()=>({uid}),now=()=>Date.now(),newHandle=createPlayerHandle}){
 const doc=(kind,id)=>s.doc(db,'bbl_'+kind,id),own=()=>doc('saves',uid),stamp=()=>s.serverTimestamp();
 function check(){if(currentUser()?.uid!==uid)throw Error('identity-changed');}
 function social(){check();if(currentUser()?.isAnonymous)throw Error('registered-account-required');}
 const decode=d=>d.exists()?{state:unpackState(d.data().payload),revision:d.data().revision,name:d.data().name??''}:null;
 function saved(state,name,revision,operation='save',giftId=''){return {version:1,name:playerName(name),payload:packState(state),inventory:inventory(state),revision,operation,giftId,updatedAt:stamp()};}
 const get=ref=>(s.getDocFromServer??s.getDoc)(ref);
 async function list(kind,field,value,max=40){const q=s.query(s.collection(db,'bbl_'+kind),s.where(field,'==',value),s.orderBy('updatedAt','desc'),s.limit(max)),rows=await (s.getDocsFromServer??s.getDocs)(q);return rows.docs.map(d=>({id:d.id,...d.data()}));}
 async function mutateSave(tx,ref,expected){const d=await tx.get(ref);if(!d.exists()||d.data().revision!==expected)throw Error('save-conflict');return decode(d);}
 const api={
 async load(){check();const value=decode(await get(own()));check();return value;},
 async save(state,name,revision){check();let next;await s.runTransaction(db,async tx=>{const ref=own(),old=await tx.get(ref);if((old.exists()?old.data().revision:0)!==revision)throw Error('save-conflict');next=saved(state,name,revision+1);tx.set(ref,next);});check();return {state:unpackState(next.payload),name:next.name,revision:next.revision};},
 async card(){social();const d=await get(doc('cards',uid));return d.exists()?{uid,...d.data()}:null;},
 async publish(name){
  social();name=playerName(name);if(!name)throw Error('invalid-profile');
  for(let attempt=0;attempt<12;attempt++){
   try{
    await s.runTransaction(db,async tx=>{
     social();const ref=doc('cards',uid),old=await tx.get(ref),handle=old.exists()?old.data().handle:newHandle();
     if(!/^[a-z][a-z0-9_]{2,15}$/.test(handle))throw Error('handle-unavailable');
     const h=doc('handles',handle),taken=await tx.get(h);
     if(taken.exists()&&taken.data().uid!==uid)throw Error(old.exists()?'handle-unavailable':'handle-collision');
     if(!taken.exists())tx.set(h,{uid});
     tx.set(ref,{uid,handle,name,updatedAt:stamp()});
    });
    return api.card();
   }catch(e){if(e.message!=='handle-collision')throw e;}
  }
  throw Error('handle-unavailable');
 },
 async find(handle){social();handle=String(handle).trim().toLowerCase();if(!/^[a-z][a-z0-9_]{2,15}$/.test(handle))throw Error('invalid-profile');const h=await get(doc('handles',handle));if(!h.exists())throw Error('not-found');const d=await get(doc('cards',h.data().uid));if(!d.exists())throw Error('not-found');return {uid:d.id,...d.data()};},
 async friends(){social();const [outgoing,incoming]=await Promise.all([list('friends','from',uid),list('friends','to',uid)]);return [...new Map([...outgoing,...incoming].map(x=>[x.id,x])).values()];},
 async request(to){
  social();if(!to?.uid||to.uid===uid)throw Error('invalid-friend');const id=uid+'__'+to.uid;
  await s.runTransaction(db,async tx=>{
   const ref=doc('friends',id),reverse=doc('friends',to.uid+'__'+uid);
   const [a,b,fromCard,toCard]=await Promise.all([tx.get(ref),tx.get(reverse),tx.get(doc('cards',uid)),tx.get(doc('cards',to.uid))]);
   if(!fromCard.exists())throw Error('profile-required');if(!toCard.exists())throw Error('not-found');
   if([a,b].some(d=>d.exists()&&['pending','accepted'].includes(d.data().status)))throw Error('already-requested');
   if(a.exists()&&now()-(a.data().updatedAt?.toMillis?.()??0)<86400000)throw Error('friend-cooldown');
   tx.set(ref,{from:uid,to:to.uid,fromName:fromCard.data().name,toName:toCard.data().name,status:'pending',createdAt:stamp(),updatedAt:stamp()});
  });
 },
 async respond(id,status){
  social();if(!['accepted','rejected','removed'].includes(status))throw Error('invalid-friend');
  let result;await s.runTransaction(db,async tx=>{const ref=doc('friends',id),d=await tx.get(ref);if(!d.exists()||![d.data().from,d.data().to].includes(uid)||status!=='removed'&&d.data().to!==uid)throw Error('forbidden');if(d.data().status!==(status==='removed'?'accepted':'pending'))throw Error('friend-unavailable');tx.update(ref,{status,updatedAt:stamp()});result={id,...d.data(),status};});check();return {friend:result};
 },
 async gifts(){social();const [outgoing,incoming]=await Promise.all([list('gifts','sender',uid,50),list('gifts','receiver',uid,50)]);return {outgoing,incoming};},
 watchNotifications(callback,onError){social();if(typeof s.onSnapshot!=='function')return ()=>{};const counts=[0,0],watch=(kind,field,index,status)=>s.onSnapshot(s.query(s.collection(db,'bbl_'+kind),s.where(field,'==',uid),s.orderBy('updatedAt','desc'),s.limit(40)),snap=>{if(currentUser()?.uid!==uid)return;counts[index]=snap.docs.filter(d=>d.data().status===status).length;callback(counts[0]+counts[1]);},onError);const a=watch('friends','to',0,'pending'),b=watch('gifts','receiver',1,'pending');return ()=>{a();b();};},
 async quota(){social();const d=await get(doc('limits',uid));return d.exists()&&d.data().day===hkDay(now())?d.data().sent:0;},
 async send(friendId,token,expected){social();const giftRef=s.doc(s.collection(db,'bbl_gifts'));let result;await s.runTransaction(db,async tx=>{const [old,friend,counter]=await Promise.all([tx.get(own()),tx.get(doc('friends',friendId)),tx.get(doc('limits',uid))]);if(!old.exists()||old.data().revision!==expected)throw Error('save-conflict');const f=friend.exists()?friend.data():null;if(!f||f.status!=='accepted'||![f.from,f.to].includes(uid))throw Error('friend-required');const day=hkDay(now()),used=counter.exists()&&counter.data().day===day?counter.data().sent:0;if(used>=GIFT_LIMIT)throw Error('gift-limit');const current=decode(old),taken=takeGift(current.state,token,now()),receiver=f.from===uid?f.to:f.from,gift={sender:uid,receiver,friendId,senderName:uid===f.from?f.fromName:f.toName,receiverName:uid===f.from?f.toName:f.fromName,...taken.item,status:'pending',createdAt:stamp(),updatedAt:stamp()};tx.set(giftRef,gift);tx.set(doc('limits',uid),{day,sent:used+1,lastGift:giftRef.id,updatedAt:stamp()});tx.set(own(),saved(taken.state,current.name,current.revision+1,'send',giftRef.id));result={state:taken.state,name:current.name,revision:current.revision+1,giftId:giftRef.id};});check();return result;},
 async claim(id,expected){return changeGift(id,expected,'claimed');},
 async cancel(id,expected){return changeGift(id,expected,'return');},
 async reject(id){social();await s.runTransaction(db,async tx=>{const ref=doc('gifts',id),d=await tx.get(ref);if(!d.exists()||d.data().receiver!==uid||d.data().status!=='pending')throw Error('gift-unavailable');tx.update(ref,{status:'rejected',updatedAt:stamp()});});}
 };
 async function changeGift(id,expected,action){social();let result;await s.runTransaction(db,async tx=>{const ref=doc('gifts',id),[giftDoc,old]=await Promise.all([tx.get(ref),tx.get(own())]);if(!giftDoc.exists())throw Error('gift-unavailable');if(!old.exists()||old.data().revision!==expected)throw Error('save-conflict');const gift=giftDoc.data(),claim=action==='claimed';if(claim&&(gift.receiver!==uid||gift.status!=='pending')||!claim&&(gift.sender!==uid||!['pending','rejected'].includes(gift.status)))throw Error('gift-unavailable');if(claim&&now()-(gift.createdAt?.toMillis?.()??now())>=7*86400000)throw Error('gift-expired');const current=decode(old),next=receiveGift(current.state,gift,now());tx.set(own(),saved(next,current.name,current.revision+1,claim?'claim':'return',id));tx.update(ref,{status:claim?'claimed':gift.status==='rejected'?'returned':'cancelled',updatedAt:stamp()});result={state:next,name:current.name,revision:current.revision+1};});check();return result;}
 return api;
}
export async function firebasePlayerAPI(){const {dataClient}=await import('./player-cloud.js'),c=await dataClient(),uid=c.auth.session.currentUser?.uid;if(!uid)throw Error('signin');return createPlayerAPI({sdk:c.sdk,db:c.db,uid,currentUser:()=>c.auth.session.currentUser});}
