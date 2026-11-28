// Real local Firestore Rules: clients cannot mint tickets, cards, or the set reward.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';import * as sdk from 'firebase/firestore';
import {emptyWallet,walletAction,drawnLegend,LEGEND_CARDS,STANDARD_CARDS,legendTickets} from '../src/economy.js';import {shop,purchaseStatus,wallet} from '../src/features-cloud.js';import {marketAction} from '../src/market-cloud.js';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8097')throw Error('Local demo emulator required');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});let checks=0;
const ok=async p=>{const v=await assertSucceeds(p);checks++;return v;},no=async p=>{await assertFails(p);checks++;},client=uid=>({...sdk,db:env.authenticatedContext(uid).firestore()}),ref=(c,uid)=>sdk.doc(c.db,'hkm_wallets',uid);
async function seed(uid,{stamp=1001,games=0,cards={},legacy=false}={}){await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore(),time=sdk.Timestamp.fromMillis(stamp),w={...emptyWallet(uid,time),cards};if(legacy)delete w.legendDraws;await sdk.setDoc(sdk.doc(db,'hkm_players',uid),{uid,displayName:'典藏街坊',total:1000000000,bestPrize:0,games,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null,lastSettledDay:null,createdAt:time,updatedAt:time});await sdk.setDoc(sdk.doc(db,'hkm_wallets',uid),w);});return client(uid);}
async function forge(c,uid,mutate,kind='legend'){const w=(await sdk.getDoc(ref(c,uid))).data(),id=crypto.randomUUID(),next=walletAction({games:1e6,total:1e9},w,{type:kind,requestId:id});mutate(next,w);const time=sdk.serverTimestamp(),b=sdk.writeBatch(c.db);b.set(ref(c,uid),{...next,updatedAt:time});b.set(sdk.doc(c.db,'hkm_wallets',uid,'receipts',id),{uid,op:kind,item:next.item,cost:next.spent-w.spent,revision:next.revision,createdAt:time});return b.commit();}
try{
 await env.clearFirestore();
 for(const stamp of [0,1001,Date.UTC(2026,10,29)]){
  const uid='cycle-'+stamp,c=await seed(uid,{stamp,games:40,cards:Object.fromEntries(STANDARD_CARDS.map(card=>[card.id,1])),legacy:true}),seen=new Set();
  for(let i=0;i<20;i++){const before=(await wallet(c,uid)).wallet,id=crypto.randomUUID(),action={type:'legend',requestId:id},result=await ok(shop(c,uid,action));assert.equal(result.outcome,drawnLegend(before));assert.equal(result.wallet.legendDraws,i+1);assert.equal(result.wallet.spent,0);assert.equal(result.wallet.draws,0);assert.equal(result.wallet.normalDraws,0);seen.add(result.outcome);checks+=5;
   if(i===0){const again=await ok(shop(c,uid,action));assert.deepEqual(again.wallet,result.wallet);const recovered=await ok(purchaseStatus(c,uid,action));assert(recovered.confirmed);assert.equal(recovered.outcome,result.outcome);checks+=3;}
  }
  assert.equal(seen.size,20);assert.equal(legendTickets({games:40},(await wallet(c,uid)).wallet).available,0);checks+=2;
  await assert.rejects(shop(c,uid,{type:'legend',requestId:crypto.randomUUID()}),/legend-ticket-required/);checks++;
  const themed=await ok(shop(c,uid,{type:'equip',slot:'theme',id:'theme-legend',requestId:crypto.randomUUID()}));assert.equal(themed.wallet.theme,'theme-legend');checks++;
  const titled=await ok(shop(c,uid,{type:'equip',slot:'prefix',id:'legend',requestId:crypto.randomUUID()}));assert.equal(titled.wallet.prefix,'legend');checks++;
 }
 console.log('cycles and set rewards passed');
 const duplicateCards=Object.fromEntries(STANDARD_CARDS.slice(0,14).map(card=>[card.id,100]));duplicateCards[STANDARD_CARDS[14].id]=0;duplicateCards.unknown=100;Object.assign(duplicateCards,Object.fromEntries(LEGEND_CARDS.map(c=>[c.id,100])));
 const poor=await seed('no-ticket',{cards:duplicateCards,games:4});await no(forge(poor,'no-ticket',()=>{}));
 // Reaching either independently verified milestone grants a ticket.
 for(const [uid,cards,games]of [['cards-ticket',Object.fromEntries(STANDARD_CARDS.slice(0,15).map(card=>[card.id,1])),0],['games-ticket',{},5]]){const c=await seed(uid,{cards,games});await ok(shop(c,uid,{type:'legend',requestId:crypto.randomUUID()}));await no(forge(c,uid,()=>{}));}
 console.log('milestones passed');
 const uid='forged',c=await seed(uid,{games:100});
 for(const mutate of [(w,o)=>w.legendDraws++,w=>w.legendDraws=0,w=>delete w.legendDraws,(w,o)=>{const id=LEGEND_CARDS.find(c=>c.id!==w.item).id;w.cards={...o.cards,[id]:1};w.item=id;},w=>w.cards[w.item]++,w=>w.spent=1,w=>w.normalDraws++,w=>w.draws++,w=>w.bonus++,w=>w.createdAt=sdk.Timestamp.fromMillis(999),w=>w.theme='theme-legend',w=>w.prefix='legend',w=>w.cards[STANDARD_CARDS[0].id]=1])await no(forge(c,uid,mutate));
 await no(forge(c,uid,(w,o)=>{const id=LEGEND_CARDS[0].id;w.cards={...o.cards,[id]:1};w.item=id;},'draw'));
 console.log('forgery passed');
 const partial=await seed('partial',{cards:Object.fromEntries(LEGEND_CARDS.slice(0,19).map(c=>[c.id,1]))});
 for(const slot of ['theme','prefix']){const time=sdk.serverTimestamp(),old=(await sdk.getDoc(ref(partial,'partial'))).data(),id=crypto.randomUUID(),b=sdk.writeBatch(partial.db);b.set(ref(partial,'partial'),{...old,[slot]:slot==='theme'?'theme-legend':'legend',revision:1,op:'equip',item:slot,receipt:id,updatedAt:time});b.set(sdk.doc(partial.db,'hkm_wallets','partial','receipts',id),{uid:'partial',op:'equip',item:slot,cost:0,revision:1,createdAt:time});await no(b.commit());}
 await no(sdk.setDoc(sdk.doc(partial.db,'hkm_styles','partial'),{uid:'partial',frame:'none',theme:'theme-legend',prefix:'',updatedAt:sdk.serverTimestamp()}));
 // Two devices with a single ticket cannot both receive a card.
 console.log('locked cosmetics passed');
 const concurrent=await seed('concurrent',{games:5}),other=client('concurrent'),results=await Promise.allSettled([shop(concurrent,'concurrent',{type:'legend',requestId:crypto.randomUUID()}),shop(other,'concurrent',{type:'legend',requestId:crypto.randomUUID()})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await wallet(concurrent,'concurrent')).wallet.legendDraws,1);checks+=2;
 // Repeating the same receipt concurrently returns one result, not two cards.
 console.log('one-ticket concurrency passed');
 const replay=await seed('replay',{games:5}),requestId=crypto.randomUUID(),same=await Promise.allSettled([shop(replay,'replay',{type:'legend',requestId}),shop(client('replay'),'replay',{type:'legend',requestId})]);assert(same.some(r=>r.status==='fulfilled'));const recovered=await ok(purchaseStatus(replay,'replay',{type:'legend',requestId}));assert(recovered.confirmed);for(const result of same.filter(r=>r.status==='fulfilled'))assert.equal(result.value.outcome,recovered.outcome);assert.equal((await wallet(replay,'replay')).wallet.legendDraws,1);checks+=3;
 // Last-copy retention and atomic fee settlement also cover hidden cards.
 console.log('same-receipt concurrency passed');
 const hidden=LEGEND_CARDS[0].id,seller=await seed('seller',{cards:{[hidden]:2}}),buyer=await seed('buyer');const listed=await ok(marketAction(seller,'seller',{type:'list',cardId:hidden,price:101,requestId:crypto.randomUUID()}));
 await assert.rejects(marketAction(seller,'seller',{type:'list',cardId:hidden,price:101,requestId:crypto.randomUUID()}));checks++;
 await ok(marketAction(buyer,'buyer',{type:'buy',listingId:listed.listingId,price:101,requestId:crypto.randomUUID()}));const sw=(await wallet(seller,'seller')).wallet,bw=(await wallet(buyer,'buyer')).wallet;assert.equal(sw.cards[hidden],1);assert.equal(bw.cards[hidden],1);assert.equal(sw.bonus,95);assert.equal(bw.spent,101);checks+=4;
 const fresh=await seed('create');await env.withSecurityRulesDisabled(ctx=>sdk.deleteDoc(sdk.doc(ctx.firestore(),'hkm_wallets','create')));await no(sdk.setDoc(ref(fresh,'create'),{...emptyWallet('create',sdk.serverTimestamp()),legendDraws:1}));
 console.log('Hidden collection Firestore: '+checks+' checks passed; milestones, legacy, 20-card cycles, replay/recovery, concurrent devices, forged counters/cards/rewards, and market settlement.');
}finally{await env.cleanup();}
