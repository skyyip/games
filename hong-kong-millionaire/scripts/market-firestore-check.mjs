// Real Spark-compatible Firestore transactions and rules, including hostile batches.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import {marketAction,marketStatus,marketListings} from '../src/market-cloud.js';
import {marketResult} from '../src/market-policy.js';
import {emptyWallet,CULTURE_CARDS,walletBalance} from '../src/economy.js';
import {shop} from '../src/features-cloud.js';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8097')throw Error('Use the local demo emulator only.');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const client=uid=>({...sdk,db:env.authenticatedContext(uid).firestore()}),ref=(c,...p)=>sdk.doc(c.db,...p),listing=(c,id)=>ref(c,'hkm_market_listings',id),wallet=(c,id)=>ref(c,'hkm_wallets',id);
const action=(type,extra)=>({type,requestId:crypto.randomUUID(),...extra});let checks=0;
const ok=async p=>{const value=await assertSucceeds(p);checks++;return value;},no=async p=>{await assertFails(p);checks++;};
async function seed(uid,total=10000,cards={}){await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore(),stamp=sdk.Timestamp.fromMillis(0);await sdk.setDoc(sdk.doc(db,'hkm_players',uid),{uid,displayName:'街坊'+uid,total,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null,lastSettledDay:null,createdAt:stamp,updatedAt:stamp});await sdk.setDoc(sdk.doc(db,'hkm_wallets',uid),emptyWallet(uid,stamp));await sdk.updateDoc(sdk.doc(db,'hkm_wallets',uid),{cards});});return client(uid);}
async function state(c,uid){return {p:(await sdk.getDoc(ref(c,'hkm_players',uid))).data(),w:(await sdk.getDoc(wallet(c,uid))).data()};}
async function forgedBuy(c,uid,id,tweak={}){
 const l=(await sdk.getDoc(listing(c,id))).data(),w=(await sdk.getDoc(wallet(c,uid))).data(),a=action('buy',{listingId:id,price:l.price}),r=marketResult(a,l),stamp=sdk.serverTimestamp(),batch=sdk.writeBatch(c.db);
 const fee=tweak.fee??r.fee,proceeds=tweak.proceeds??r.proceeds;
 if(!tweak.skipBuyer)batch.update(wallet(c,uid),{spent:w.spent+(tweak.paid??l.price),cards:{...w.cards,[l.cardId]:(w.cards[l.cardId]??0)+(tweak.cards??1)},revision:w.revision+1,op:'market-buy',item:id,receipt:a.requestId,updatedAt:stamp});
 if(!tweak.skipSeller)batch.update(wallet(c,l.sellerUid),{bonus:sdk.increment(proceeds),revision:sdk.increment(1),op:'market-sale',item:id,updatedAt:stamp});
 if(!tweak.skipListing)batch.update(listing(c,id),{status:'sold',updatedAt:stamp,soldAt:stamp});
 if(!tweak.skipTrade)batch.set(ref(c,'hkm_market_trades',id),{listingId:id,buyerUid:uid,sellerUid:l.sellerUid,cardId:l.cardId,price:l.price,fee,proceeds,requestId:a.requestId,createdAt:stamp});
 if(!tweak.skipReceipt)batch.set(ref(c,'hkm_wallets',uid,'marketReceipts',a.requestId),{uid,action:a,result:{...r,fee,proceeds},createdAt:stamp});
 return batch.commit();
}
async function forgedList(c,uid,cardId,price=100,name='街坊'+uid){
 const w=(await sdk.getDoc(wallet(c,uid))).data(),a=action('list',{cardId,price}),stamp=sdk.serverTimestamp(),l={sellerUid:uid,sellerName:name,cardId,price,status:'active',createdAt:stamp,updatedAt:stamp},batch=sdk.writeBatch(c.db);
 batch.set(listing(c,a.requestId),l);batch.update(wallet(c,uid),{cards:{...w.cards,[cardId]:(w.cards[cardId]??0)-1},revision:w.revision+1,op:'market-list',item:a.requestId,receipt:a.requestId,updatedAt:stamp});batch.set(ref(c,'hkm_wallets',uid,'marketReceipts',a.requestId),{uid,action:a,result:marketResult(a,l),createdAt:stamp});return batch.commit();
}
try{
 await env.clearFirestore();const transport=Object.fromEntries(CULTURE_CARDS.filter(c=>c.series==='transport').map(c=>[c.id,1])),seller=await seed('seller',1000,{...transport,hotdog:3}),a=await seed('buyer-a'),b=await seed('buyer-b'),poor=await seed('poor',100);
 await env.withSecurityRulesDisabled(ctx=>sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets','seller'),{prefix:'transport'}));const original=await state(seller,'seller'),offer=action('list',{cardId:'hotdog',price:101});
 const listed=await ok(marketAction(seller,'seller',offer));assert.equal(listed.fee,6);assert.equal(listed.proceeds,95);assert.equal((await state(seller,'seller')).w.cards.hotdog,2);checks+=3;
 const rev=(await state(seller,'seller')).w.revision;assert((await ok(marketAction(seller,'seller',offer))).replayed);assert.equal((await state(seller,'seller')).w.revision,rev);checks+=2;
 await assert.rejects(marketAction(seller,'seller',{...offer,price:102}),/market-request-mismatch/);checks++;
 for(const [c,uid,op]of [[a,'buyer-a',action('cancel',{listingId:listed.listingId})],[seller,'seller',action('buy',{listingId:listed.listingId,price:101})],[poor,'poor',action('buy',{listingId:listed.listingId,price:101})],[a,'buyer-a',action('buy',{listingId:listed.listingId,price:102})]]){await assert.rejects(marketAction(c,uid,op));checks++;}
 for(const tweak of [{paid:100},{cards:2},{fee:0,proceeds:101},{fee:1,proceeds:100},{skipBuyer:true},{skipSeller:true},{skipListing:true},{skipTrade:true},{skipReceipt:true}])await no(forgedBuy(a,'buyer-a',listed.listingId,tweak));
 assert.equal((await sdk.getDoc(listing(a,listed.listingId))).data().status,'active');assert.equal((await state(a,'buyer-a')).w.spent,0);assert.equal((await state(seller,'seller')).w.bonus,0);checks+=3;
 await no(sdk.updateDoc(listing(seller,listed.listingId),{price:1,updatedAt:sdk.serverTimestamp()}));await no(forgedList(seller,'seller','hotdog',100,'假的賣家'));
 const last=await seed('last',1000,{hotdog:1}),fake=await seed('fake',1000,{'unknown-card':2});await no(forgedList(last,'last','hotdog'));await no(forgedList(fake,'fake','unknown-card'));
 await no(sdk.updateDoc(wallet(a,'seller'),{bonus:sdk.increment(999),revision:sdk.increment(1),op:'market-sale',item:crypto.randomUUID(),updatedAt:sdk.serverTimestamp()}));
 console.log('Adversarial checks complete: '+checks);
 const buyA=action('buy',{listingId:listed.listingId,price:101}),buyB=action('buy',{listingId:listed.listingId,price:101}),race=await Promise.allSettled([marketAction(a,'buyer-a',buyA),marketAction(b,'buyer-b',buyB)]);
 assert.equal(race.filter(r=>r.status==='fulfilled').length,1);assert.equal(race.filter(r=>r.status==='rejected').length,1);checks+=2;
 const win=race[0].status==='fulfilled'?{c:a,uid:'buyer-a',op:buyA}:{c:b,uid:'buyer-b',op:buyB},lose=win.uid==='buyer-a'?{c:b,uid:'buyer-b'}:{c:a,uid:'buyer-a'};
 assert.equal((await state(win.c,win.uid)).w.cards.hotdog,1);assert.equal((await state(lose.c,lose.uid)).w.cards.hotdog??0,0);const sellerState=await state(seller,'seller');assert.equal(sellerState.w.cards.hotdog,2);assert.equal(sellerState.w.bonus,95);assert.equal(sellerState.w.prefix,'transport');assert.deepEqual(sellerState.p,original.p);checks+=6;
 const balances=[await state(seller,'seller'),await state(a,'buyer-a'),await state(b,'buyer-b')].reduce((n,s)=>n+walletBalance(s.p,s.w),0);assert.equal(balances,21000-6);checks++;
 const beforeRetry=await state(win.c,win.uid);assert((await ok(marketAction(win.c,win.uid,win.op))).replayed);assert.deepEqual(await state(win.c,win.uid),beforeRetry);assert((await marketStatus(win.c,win.uid,win.op)).confirmed);checks+=3;
 await assert.rejects(marketAction(seller,'seller',action('cancel',{listingId:listed.listingId})),/unavailable/);checks++;
 const trade=await ok(sdk.getDoc(ref(win.c,'hkm_market_trades',listed.listingId)));assert.equal(trade.data().buyerUid,win.uid);assert.equal(trade.data().fee,6);await ok(sdk.getDoc(ref(seller,'hkm_market_trades',listed.listingId)));await no(sdk.getDoc(ref(lose.c,'hkm_market_trades',listed.listingId)));await no(sdk.getDoc(wallet(win.c,'seller')));await no(sdk.getDoc(ref(seller,'hkm_wallets',win.uid,'marketReceipts',win.op.requestId)));
 await no(sdk.updateDoc(ref(win.c,'hkm_market_trades',listed.listingId),{fee:0}));await no(sdk.deleteDoc(ref(win.c,'hkm_wallets',win.uid,'marketReceipts',win.op.requestId)));
 console.log('Purchase race and privacy complete: '+checks);
 const offers=[action('list',{cardId:'hotdog',price:20}),action('list',{cardId:'hotdog',price:20})],listedRace=await Promise.allSettled(offers.map(op=>marketAction(seller,'seller',op)));assert.equal(listedRace.filter(r=>r.status==='fulfilled').length,1);assert.equal((await state(seller,'seller')).w.cards.hotdog,1);checks+=2;
 const reserved=listedRace.find(r=>r.status==='fulfilled').value,cancel=action('cancel',{listingId:reserved.listingId});await ok(marketAction(seller,'seller',cancel));const cancelled=await state(seller,'seller');assert.equal(cancelled.w.cards.hotdog,2);await ok(marketAction(seller,'seller',cancel));assert.deepEqual(await state(seller,'seller'),cancelled);checks+=2;
 console.log('Escrow cancellation complete: '+checks);
 const nextOffer=await marketAction(seller,'seller',action('list',{cardId:'hotdog',price:20})),cardTotal=()=>Promise.all([state(seller,'seller'),state(a,'buyer-a'),state(b,'buyer-b')]).then(rows=>rows.reduce((n,s)=>n+(s.w.cards.hotdog??0),0));
 const cancelBuy=await Promise.allSettled([marketAction(seller,'seller',action('cancel',{listingId:nextOffer.listingId})),marketAction(a,'buyer-a',action('buy',{listingId:nextOffer.listingId,price:20}))]);assert.equal(cancelBuy.filter(r=>r.status==='fulfilled').length,1);assert.equal(await cardTotal(),3);checks+=2;
 console.log('Cancellation race complete: '+checks);
 const mix=await seed('mix',1000000,{hotdog:2}),mixed=await Promise.all([marketAction(mix,'mix',action('list',{cardId:'hotdog',price:100})),shop(mix,'mix',{type:'draw',requestId:crypto.randomUUID()})]);assert.equal((await state(mix,'mix')).w.cards.hotdog,2);assert.equal((await state(mix,'mix')).w.draws,1);assert.equal((await state(mix,'mix')).w.spent,10000);checks+=3;
 const sameCancel=action('cancel',{listingId:mixed[0].listingId});const sameCancelled=await Promise.all([marketAction(mix,'mix',sameCancel),marketAction(mix,'mix',sameCancel)]);assert.equal(sameCancelled.filter(r=>r.replayed).length,1);checks++;assert.equal((await state(mix,'mix')).w.cards.hotdog,3);checks++;
 console.log('Concurrent draw complete: '+checks);
 for(const price of [1,21,1000000000]){const u='edge-'+price,c=await seed(u,2000000000,{hotdog:2}),v='pay-'+price,d=await seed(v,2000000000),l=await marketAction(c,u,action('list',{cardId:'hotdog',price})),paid=await ok(marketAction(d,v,action('buy',{listingId:l.listingId,price})));assert.equal(paid.fee,Math.ceil(price/20));assert.equal((await state(c,u)).w.bonus,price-Math.ceil(price/20));checks+=2;}
 const publicDb=env.unauthenticatedContext().firestore(),anon=env.authenticatedContext('anon',{firebase:{sign_in_provider:'anonymous'}}).firestore();await no(sdk.getDoc(sdk.doc(publicDb,'hkm_market_listings',listed.listingId)));await no(sdk.getDoc(sdk.doc(anon,'hkm_market_listings',listed.listingId)));await no(sdk.getDocs(sdk.collection(a.db,'hkm_market_listings')));await no(sdk.getDocs(sdk.query(sdk.collection(a.db,'hkm_market_listings'),sdk.limit(25))));await ok(marketListings(a,'buyer-a'));await ok(marketListings(seller,'seller',{mine:true}));
 console.log('Marketplace Firestore: '+checks+' checks passed; escrow, one remaining card, exact fees, hostile batches, private wallets, idempotency and concurrent buyers/cancellation/draws.');
}catch(error){console.error('Failure after '+checks+' checks',error);throw error;}finally{await env.cleanup();}
