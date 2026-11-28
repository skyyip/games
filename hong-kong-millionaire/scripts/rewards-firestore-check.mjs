import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import * as feature from '../src/features-cloud.js';
import {emptyWallet,isWeekend,WEEKEND_LIMIT,retryPrice,DRAW_PRICE,GOLD_PRICE,walletAction,CULTURE_CARDS,SERIES,NORMAL_CARDS,FOIL_CARDS,GEAR} from '../src/economy.js';
import {newSession,sessionQuestion,ROOM_INTERVAL} from '../src/session-engine.js';
import {hkDay} from '../src/game.js';
import {sessionClock} from '../src/session-clock.js';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('demo emulator required');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
let checks=0;
const context=uid=>({...sdk,db:env.authenticatedContext(uid).firestore()});
const ref=(c,...p)=>sdk.doc(c.db,...p);
async function seed(uid,total=1000000){await env.withSecurityRulesDisabled(async ctx=>{const stamp=sdk.Timestamp.now();await sdk.setDoc(sdk.doc(ctx.firestore(),'hkm_players',uid),{uid,displayName:'街坊'+uid,total,bestPrize:1000000,games:1,titles:['ordinary','neighbour','expert','peak','millionaire'],unlocked:[],wrong:[],favourites:[],activeDay:null,activeKind:'daily',lastSettledDay:null,createdAt:stamp,updatedAt:stamp});});return context(uid);}
const ok=async p=>{const at=new Error().stack;try{const r=await assertSucceeds(p);checks++;return r;}catch(error){console.error('Rules operation failed after '+checks+' checks\n'+at);throw error;}},no=async p=>{await assertFails(p);checks++;};
try{
 await env.clearFirestore();
 // Economic prices and ownership are enforced by the real rules, independently of UI quotes.
 const pricing=await seed('pricing');let priceState=await ok(feature.wallet(pricing,'pricing'));
 const normalReceipt=crypto.randomUUID();priceState=await ok(feature.shop(pricing,'pricing',{type:'draw',requestId:normalReceipt}));
 assert.equal(priceState.balance,1000000-DRAW_PRICE);assert.equal(priceState.profile.total,1000000);checks+=2;
 for(const forgedCost of [5000,20000]){
  const underpaidId=crypto.randomUUID(),underpaid=walletAction(priceState.profile,priceState.wallet,{type:'draw',requestId:underpaidId},hkDay());underpaid.spent=priceState.wallet.spent+forgedCost;
  const underpaidBatch=sdk.writeBatch(pricing.db);underpaidBatch.set(ref(pricing,'hkm_wallets','pricing'),{...underpaid,updatedAt:sdk.serverTimestamp()});underpaidBatch.set(ref(pricing,'hkm_wallets','pricing','receipts',underpaidId),{uid:'pricing',op:'draw',item:underpaid.item,cost:forgedCost,revision:underpaid.revision,createdAt:sdk.serverTimestamp()});await no(underpaidBatch.commit());
 }
 const drawRevision=priceState.wallet.revision;priceState=await ok(feature.shop(pricing,'pricing',{type:'draw',requestId:normalReceipt}));assert.equal(priceState.wallet.revision,drawRevision);checks++;
 for(const [slot,id]of [['frame','frame-bamboo'],['theme','theme-island']]){
  await assert.rejects(feature.shop(pricing,'pricing',{type:'equip',slot,id,requestId:crypto.randomUUID()}),/not-owned/);checks++;
  await ok(feature.shop(pricing,'pricing',{type:'buy',id,requestId:crypto.randomUUID()}));
  priceState=await ok(feature.shop(pricing,'pricing',{type:'equip',slot,id,requestId:crypto.randomUUID()}));assert.equal(priceState.wallet[slot],id);checks++;
 }
 for(const quote of [{day:hkDay()-1,price:retryPrice(hkDay()-1)},{day:hkDay(),price:1}]){await assert.rejects(feature.shop(pricing,'pricing',{type:'retry-ticket',...quote,requestId:crypto.randomUUID()}),/quote-expired/);checks++;}
 // A forged, self-consistent receipt must still fail if it underpays the server's day price.
 priceState=await feature.wallet(pricing,'pricing');const forgedId=crypto.randomUUID(),forged=walletAction(priceState.profile,priceState.wallet,{type:'retry-ticket',requestId:forgedId},hkDay());forged.spent--;
 const forgedBatch=sdk.writeBatch(pricing.db);forgedBatch.update(ref(pricing,'hkm_wallets','pricing'),{...forged,updatedAt:sdk.serverTimestamp()});forgedBatch.set(ref(pricing,'hkm_wallets','pricing','receipts',forgedId),{uid:'pricing',op:forged.op,item:forged.item,cost:retryPrice(hkDay())-1,revision:forged.revision,createdAt:sdk.serverTimestamp()});await no(forgedBatch.commit());
 const validTicket=crypto.randomUUID(),beforeTicket=priceState.balance;priceState=await ok(feature.shop(pricing,'pricing',{type:'retry-ticket',day:hkDay(),price:retryPrice(hkDay()),requestId:validTicket}));assert.equal(priceState.balance,beforeTicket-retryPrice(hkDay()));checks++;
 priceState=await ok(feature.shop(pricing,'pricing',{type:'retry-ticket',day:hkDay()-1,price:1,requestId:validTicket}));assert.equal(priceState.balance,beforeTicket-retryPrice(hkDay()));checks++;
 // Every expansion card is recognised by the independent server draw tables.
 for(const card of CULTURE_CARDS.filter(card=>card.prefixRequired===false)){
  const uid='card-'+card.id,cardsClient=await seed(uid);await ok(feature.wallet(cardsClient,uid));
  const slot=card.foil?NORMAL_CARDS.length*10+FOIL_CARDS.indexOf(card.id):NORMAL_CARDS.indexOf(card.id)*10;
  await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets',uid),{createdAt:sdk.Timestamp.fromMillis(slot)});});
  const drawn=await ok(feature.shop(cardsClient,uid,{type:'draw',requestId:crypto.randomUUID()}));assert.equal(drawn.outcome,card.id);assert.equal(drawn.balance,1000000-DRAW_PRICE);checks+=2;
  if(card.foil){const goldUid='gold-'+card.id,goldClient=await seed(goldUid);await ok(feature.wallet(goldClient,goldUid));await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets',goldUid),{createdAt:sdk.Timestamp.fromMillis(FOIL_CARDS.indexOf(card.id))});});const gold=await ok(feature.shop(goldClient,goldUid,{type:'gold',requestId:crypto.randomUUID()}));assert.equal(gold.outcome,card.id);assert.equal(gold.balance,1000000-GOLD_PRICE);checks+=2;}

 }
 // All twenty cards, including every foil, are required by the independent rules.
 for(const series of SERIES){
  const uid='prefix-'+series.id,client=await seed(uid);await ok(feature.wallet(client,uid));
  const cards=CULTURE_CARDS.filter(card=>card.series===series.id),all=Object.fromEntries(cards.map(card=>[card.id,1]));
  for(const missing of cards){
   await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets',uid),{cards:{...all,[missing.id]:0},prefix:''});});
   await assert.rejects(feature.shop(client,uid,{type:'equip',slot:'prefix',id:series.id,requestId:crypto.randomUUID()}),/not-owned/);checks++;
   const old=(await sdk.getDoc(ref(client,'hkm_wallets',uid))).data(),id=crypto.randomUUID(),batch=sdk.writeBatch(client.db);
   batch.update(ref(client,'hkm_wallets',uid),{prefix:series.id,revision:old.revision+1,op:'equip',item:'prefix',receipt:id,updatedAt:sdk.serverTimestamp()});batch.set(ref(client,'hkm_wallets',uid,'receipts',id),{uid,op:'equip',item:'prefix',cost:0,revision:old.revision+1,createdAt:sdk.serverTimestamp()});await no(batch.commit());
  }
  await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets',uid),{cards:all});});
  const entitled=await ok(feature.shop(client,uid,{type:'equip',slot:'prefix',id:series.id,requestId:crypto.randomUUID()}));assert.equal(entitled.wallet.prefix,series.id);assert.equal(entitled.balance,1000000);checks+=2;
  assert.equal((await ok(feature.wallet(client,uid))).wallet.prefix,series.id);checks++;
  // A previously equipped incomplete sixteen-card prefix is retired once, with assets unchanged.
  const core=Object.fromEntries(cards.slice(0,16).map(card=>[card.id,1]));
  await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await sdk.updateDoc(sdk.doc(db,'hkm_wallets',uid),{cards:core,prefix:series.id});await sdk.setDoc(sdk.doc(db,'hkm_styles',uid),{uid,frame:'none',theme:'default',prefix:series.id,updatedAt:sdk.Timestamp.now()});});
  await no(sdk.setDoc(ref(client,'hkm_styles',uid),{uid,frame:'none',theme:'default',prefix:series.id,updatedAt:sdk.serverTimestamp()}));
  const retired=await ok(feature.wallet(client,uid));assert.equal(retired.wallet.prefix,'');assert.equal(retired.balance,entitled.balance);assert.deepEqual(retired.wallet.cards,core);assert.deepEqual(retired.wallet.owned,entitled.wallet.owned);checks+=4;
  assert.equal((await ok(feature.publicStyles(client,[uid])))[uid].prefix,'');checks++;
  const again=await ok(feature.wallet(client,uid));assert.equal(again.wallet.revision,retired.wallet.revision);assert.equal(again.wallet.receipt,retired.wallet.receipt);checks+=2;
  assert.equal((await ok(sdk.getDoc(ref(client,'hkm_wallets',uid,'receipts',retired.wallet.receipt)))).data().cost,0);checks++;
 }
 // New Hong Kong cosmetics use their published price and require ownership before equip.
 for(const {id,kind:slot} of GEAR.filter(g=>['frame-minibus','frame-dimsum','frame-bauhinia','frame-lion','frame-rooster-bowl','frame-mahjong','frame-bus-stop','frame-flower-window','theme-neon-rain','theme-estate','theme-teahouse','exit-tram','exit-ferry','exit-gondola'].includes(g.id))){
  const uid='new-'+id,client=await seed(uid),initial=await ok(feature.wallet(client,uid)),price=GEAR.find(g=>g.id===id).price;
  await assert.rejects(feature.shop(client,uid,{type:'equip',slot,id,requestId:crypto.randomUUID()}),/not-owned/);checks++;
  const receipt=crypto.randomUUID(),next=walletAction(initial.profile,initial.wallet,{type:'buy',id,requestId:receipt});next.spent--;
  const batch=sdk.writeBatch(client.db);batch.set(ref(client,'hkm_wallets',uid),{...next,updatedAt:sdk.serverTimestamp()});batch.set(ref(client,'hkm_wallets',uid,'receipts',receipt),{uid,op:'buy',item:id,cost:price-1,revision:next.revision,createdAt:sdk.serverTimestamp()});await no(batch.commit());
  await ok(feature.shop(client,uid,{type:'buy',id,requestId:crypto.randomUUID()}));const equipped=await ok(feature.shop(client,uid,{type:'equip',slot,id,requestId:crypto.randomUUID()}));assert.equal(equipped.wallet[slot],id);assert.equal(equipped.balance,1000000-price);assert.equal(equipped.profile.total,1000000);checks+=3;
 }
 // Read-only reconciliation must resolve paid tickets and return original draw results.
 const receiptClient=await seed('receipt-check');await ok(feature.wallet(receiptClient,'receipt-check'));
 const passAction={type:'pass',day:hkDay(),requestId:crypto.randomUUID()};
 assert.equal((await ok(feature.purchaseStatus(receiptClient,'receipt-check',passAction))).confirmed,false);checks++;
 const paidPass=await ok(feature.shop(receiptClient,'receipt-check',passAction));
 for(const action of [passAction,{...passAction,requestId:crypto.randomUUID()}]){
  const verified=await ok(feature.purchaseStatus(receiptClient,'receipt-check',action));assert(verified.confirmed);assert.equal(verified.wallet.spent,paidPass.wallet.spent);checks+=2;
 }
 const drawAction={type:'draw',requestId:crypto.randomUUID()},paidDraw=await ok(feature.shop(receiptClient,'receipt-check',drawAction));
 const drawn=await ok(feature.purchaseStatus(receiptClient,'receipt-check',drawAction));assert(drawn.confirmed);assert.equal(drawn.outcome,paidDraw.outcome);assert.equal(drawn.wallet.draws,paidDraw.wallet.draws);checks+=3;
 await assert.rejects(feature.purchaseStatus(context('receipt-outsider'),'receipt-check',passAction));checks++;
 const c=await seed('collector');let result=await ok(feature.wallet(c,'collector'));assert.equal(result.balance,1000000);
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector'),{bonus:999999,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector'),{cards:{'tram-foil':100},updatedAt:sdk.serverTimestamp()}));
 const requestId=crypto.randomUUID();result=await ok(feature.shop(c,'collector',{type:'gold',requestId}));assert(result.outcome.endsWith('-foil'));assert.equal(result.balance,920000);const revision=result.wallet.revision;
 result=await ok(feature.shop(c,'collector',{type:'gold',requestId}));assert.equal(result.wallet.revision,revision);assert.equal(result.balance,920000);checks+=3;
 await assert.rejects(feature.shop(c,'collector',{type:'equip',slot:'frame',id:'frame-gold',requestId:crypto.randomUUID()}));checks++;
 result=await ok(feature.shop(c,'collector',{type:'buy',id:'frame-rwb',requestId:crypto.randomUUID()}));assert.equal(result.balance,900000);
 result=await ok(feature.shop(c,'collector',{type:'equip',slot:'frame',id:'frame-rwb',requestId:crypto.randomUUID()}));assert.equal(result.wallet.frame,'frame-rwb');
 const styles=await ok(feature.publicStyles(c,['collector']));assert.equal(styles.collector.frame,'frame-rwb');checks++;
 await no(sdk.updateDoc(ref(c,'hkm_styles','collector'),{frame:'frame-gold',updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_players','collector'),{total:9999999,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector','receipts',requestId),{cost:0}));
 const other=context('other');await no(sdk.getDoc(ref(other,'hkm_wallets','collector')));
 await assert.rejects(feature.shop(c,'collector',{type:'swap',requestId:crypto.randomUUID()}),/invalid-item/);checks++;
 await no(sdk.setDoc(ref(c,'hkm_assisted_results','removed'),{uid:'collector'}));
 // An answer can commit while its following settlement fails: retry must finish, not advance.
 for(const outcome of ['wrong','walk']){
  const uid='interrupted-'+outcome,client=await seed(uid);await feature.wallet(client,uid);await feature.shop(client,uid,{type:'retry-ticket',requestId:crypto.randomUUID()});let r=await feature.startSession(client,uid,{kind:'retry'});
  for(let i=0;i<5;i++){r=await feature.moveSession(client,uid,r,{type:'answer',choice:sessionQuestion(r).answer});r=await feature.moveSession(client,uid,r,{type:'next'});}
  let transactions=0;const interrupted={...client,runTransaction:(db,fn)=>{if(++transactions===2)return Promise.reject(Object.assign(Error('unavailable'),{code:'unavailable'}));return sdk.runTransaction(db,fn);}};
  const action=outcome==='walk'?{type:'walk'}:{type:'answer',choice:(sessionQuestion(r).answer+1)%4};
  await assert.rejects(feature.moveSession(interrupted,uid,r,action),error=>error.stage==='settlement'&&error.run?.phase==='reveal'&&error.run.outcome===outcome);checks++;
  const settled=await ok(feature.moveSession(client,uid,r,{type:'next'}));assert.equal(settled.phase,'finished');assert.equal(settled.reason,outcome);assert.equal(settled.payout,8000);const paid=await feature.wallet(client,uid);assert.equal(paid.wallet.activeSession,'');assert.equal(paid.balance,1000000-retryPrice(hkDay())+8000);checks+=5;
  await ok(feature.moveSession(client,uid,r,{type:'next'}));assert.equal((await feature.wallet(client,uid)).wallet.bonus,paid.wallet.bonus);checks++;
 }
 const practice=await seed('practice');await ok(feature.wallet(practice,'practice'));const practiceId='weekend_'+crypto.randomUUID();
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore(),stamp=sdk.Timestamp.now(),r=newSession({id:practiceId,uid:'practice',kind:'weekend',seed:hkDay()},Date.now());await sdk.setDoc(sdk.doc(db,'hkm_players','practice','sessions',practiceId),{...r,phase:'reveal',index:14,correct:15,outcome:'correct',choice:0,answerAt:stamp,startedAt:stamp,questionAt:stamp,updatedAt:stamp});await sdk.updateDoc(sdk.doc(db,'hkm_wallets','practice'),{activeSession:practiceId,activeKind:'weekend',passUses:3,practiceDay:hkDay(),practiceEarned:99500});});
 const practiceRun=await ok(feature.settleSession(practice,'practice',{id:practiceId,kind:'weekend',room:''}));assert.equal(practiceRun.credit,500);assert.equal((await feature.wallet(practice,'practice')).wallet.practiceEarned,100000);checks+=2;
 await no(sdk.updateDoc(ref(practice,'hkm_wallets','practice'),{practiceEarned:0,passUses:0,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(practice,'hkm_wallets','practice'),{passUses:0,revision:5,op:'pass',updatedAt:sdk.serverTimestamp()}));
 // A retry ticket is paid once per Hong Kong day and cannot be replayed across devices.
 const retry=await seed('retry');await ok(feature.wallet(retry,'retry'));
 await assert.rejects(feature.startSession(retry,'retry',{kind:'retry'}),/retry-ticket-required/);checks++;
 const ticketReceipt=crypto.randomUUID();await ok(feature.shop(retry,'retry',{type:'retry-ticket',requestId:ticketReceipt}));
 await ok(feature.shop(retry,'retry',{type:'retry-ticket',requestId:ticketReceipt}));
 assert.equal((await feature.wallet(retry,'retry')).balance,1000000-retryPrice(hkDay()));checks++;
 await assert.rejects(feature.shop(retry,'retry',{type:'retry-ticket',requestId:crypto.randomUUID()}),/retry-bought/);checks++;
 let retryRun=await ok(feature.startSession(retry,'retry',{kind:'retry'}));
 await no(sdk.updateDoc(ref(retry,'hkm_wallets','retry'),{retryUsedDay:-1,revision:(await feature.wallet(retry,'retry')).wallet.revision+1,op:'start-session',updatedAt:sdk.serverTimestamp()}));
 // Extra sessions must also allow a genuine answer after the former 25s cap.
 await env.withSecurityRulesDisabled(async ctx=>{const stamp=sdk.Timestamp.fromMillis(Date.now()-28000);await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_players','retry','sessions',retryRun.id),{questionAt:stamp,startedAt:stamp});});
 for(let i=0;i<15;i++){retryRun=await ok(feature.moveSession(retry,'retry',retryRun,{type:'answer',choice:sessionQuestion(retryRun).answer}));if(i<14)retryRun=await ok(feature.moveSession(retry,'retry',retryRun,{type:'next'}));}
 assert.equal(retryRun.payout,1000000);assert.equal(retryRun.credit,1000000);assert.equal((await feature.wallet(retry,'retry')).balance,2000000-retryPrice(hkDay()));assert.equal((await feature.wallet(retry,'retry')).profile.total,1000000);checks+=4;
 await ok(feature.settleSession(retry,'retry',retryRun));assert.equal((await feature.wallet(retry,'retry')).balance,2000000-retryPrice(hkDay()));checks++;
 await assert.rejects(feature.startSession(retry,'retry',{kind:'retry'}),/retry-ticket-required/);checks++;
 await ok(feature.syncSessionClock(retry,'retry',retryRun)); // Another tab may already have settled during recovery.
 for(const count of [2,3,4]){
  const people=await Promise.all(Array.from({length:count},(_,i)=>seed('table'+count+'p'+i))),uids=Array.from({length:count},(_,i)=>'table'+count+'p'+i),entryFee=50000;
  const id=await ok(feature.createRoom(people[0],uids[0],{topic:'sport',entryFee}));assert.match(id,/^[A-HJ-NP-Z2-9]{8}$/);checks++;
  await ok(feature.createRoom(people[0],uids[0],{topic:'sport',entryFee,code:id}));assert.equal((await feature.wallet(people[0],uids[0])).balance,935000);checks++;
  for(let i=1;i<count;i++){await ok(feature.joinRoom(people[i],uids[i],id));await ok(feature.joinRoom(people[i],uids[i],id));assert.equal((await feature.wallet(people[i],uids[i])).balance,935000);checks++;}
  await no(sdk.updateDoc(ref(people[0],'hkm_rooms',id),{entryFee:1000,updatedAt:sdk.serverTimestamp()}));
  if(count===4){const fifth=await seed('fifth');await assert.rejects(feature.joinRoom(fifth,'fifth',id),/room-full/);checks++;}
  await ok(feature.startRoom(people[0],uids[0],id));
  await no(sdk.updateDoc(ref(people[0],'hkm_rooms',id),{status:'cancelled',updatedAt:sdk.serverTimestamp()}));
  const beforeLaunch=(await sdk.getDoc(ref(people[0],'hkm_rooms',id))).data();
  const runs=await Promise.all(people.map((person,i)=>ok(feature.startSession(person,uids[i],{kind:'room',room:id}))));
  assert(runs.every(r=>r.roomMode==='async'&&r.questionAt>=beforeLaunch.startedAt.toMillis()&&r.deadlineAt===Math.floor(beforeLaunch.startedAt.toMillis())+86400000));checks++;
  const afterLaunch=(await sdk.getDoc(ref(people[0],'hkm_rooms',id))).data();assert(beforeLaunch.updatedAt.isEqual(afterLaunch.updatedAt));assert.deepEqual(afterLaunch.rebates,beforeLaunch.rebates);checks+=2;
  await Promise.all(people.map((person,i)=>ok(feature.claimRoom(person,uids[i],id))));
  for(let i=0;i<count;i++){const w=await feature.wallet(people[i],uids[i]);assert.equal(w.balance,1000000-entryFee-30000/count);checks++;}
  await assert.rejects(feature.finaliseRoom(people[0],uids[0],id),/room-wait/);checks++;
  // Both clients answer concurrently. Peers cannot forge the public scoreboard.
  const hostReveal=await ok(feature.moveSession(people[0],uids[0],runs[0],{type:'answer',choice:sessionQuestion(runs[0]).answer}));
  await no(sdk.updateDoc(ref(people[1],'hkm_rooms',id),{['scores.'+uids[1]]:{correct:10,timeMs:0,finished:true,finishedAt:sdk.serverTimestamp()},updatedAt:sdk.serverTimestamp()}));
  await Promise.all(people.map((person,i)=>ok(feature.moveSession(person,uids[i],i===0?hostReveal:runs[i],{type:'walk'}))));
  const settled=await ok(feature.finaliseRoom(people[1],uids[1],id));assert.equal(settled.winner,uids[0]);assert.equal(settled.pool,count*entryFee);checks+=2;
  await ok(feature.claimRoom(people[0],uids[0],id));await assert.rejects(feature.claimRoom(people[0],uids[0],id),/already-claimed/);checks++;
  const balances=await Promise.all(people.map((person,i)=>feature.wallet(person,uids[i])));assert.equal(balances.reduce((sum,w)=>sum+w.balance,0),count*1000000-30000);checks++;
  assert.equal((await ok(feature.myRooms(people[1],uids[1]))).some(r=>r.id===id),true);checks++;
 }
 const cancelHost=await seed('cancelHost'),cancelGuest=await seed('cancelGuest'),cancel=await ok(feature.createRoom(cancelHost,'cancelHost',{entryFee:1000}));
 await ok(feature.joinRoom(cancelGuest,'cancelGuest',cancel));await ok(feature.cancelRoom(cancelHost,'cancelHost',cancel));
 for(const [person,who]of [[cancelHost,'cancelHost'],[cancelGuest,'cancelGuest']]){await ok(feature.claimRoom(person,who,cancel));assert.equal((await feature.wallet(person,who)).balance,1000000);await assert.rejects(feature.claimRoom(person,who,cancel),/already-claimed/);checks+=2;}
 // A bad device clock must not change room day, start an early timeout, or edit the shared root.
 const skewHost=await seed('skewHost'),skewGuest=await seed('skewGuest'),skewId=await ok(feature.createRoom(skewHost,'skewHost',{entryFee:1000}));
 const nativeNow=Date.now;sessionClock.reset();let skewRun;
 try{Date.now=()=>nativeNow()+26*3600000;await ok(feature.joinRoom(skewGuest,'skewGuest',skewId));await ok(feature.startRoom(skewHost,'skewHost',skewId));skewRun=await ok(feature.startSession(skewGuest,'skewGuest',{kind:'room',room:skewId}));assert.equal(skewRun.day,hkDay(nativeNow()));assert(Math.abs(sessionClock.now()-nativeNow())<2000);checks+=2;
  skewRun=await ok(feature.moveSession(skewGuest,'skewGuest',skewRun,{type:'answer',choice:sessionQuestion(skewRun).answer}));assert.equal(skewRun.outcome,'correct');checks++;
 }finally{Date.now=nativeNow;}
 const rawBefore=(await sdk.getDoc(ref(skewGuest,'hkm_rooms',skewId,'sessions','skewGuest'))).data();
 await ok(feature.syncSessionClock(skewGuest,'skewGuest',{id:skewId,kind:'room',room:skewId}));
 const rawAfter=(await sdk.getDoc(ref(skewGuest,'hkm_rooms',skewId,'sessions','skewGuest'))).data();assert(rawBefore.questionAt.isEqual(rawAfter.questionAt));assert.equal(rawBefore.index,rawAfter.index);assert.equal(rawBefore.correct,rawAfter.correct);checks+=3;
 await no(sdk.updateDoc(ref(skewHost,'hkm_rooms',skewId,'sessions','skewGuest'),{updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(skewGuest,'hkm_rooms',skewId,'sessions','skewGuest'),{questionAt:sdk.serverTimestamp(),updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(skewGuest,'hkm_rooms',skewId,'sessions','skewGuest'),{correct:10,updatedAt:sdk.serverTimestamp()}));
 // New async rounds start when each player requests their next question.
 const clockHost=await seed('clockHost'),clockGuest=await seed('clockGuest'),clockId=await ok(feature.createRoom(clockHost,'clockHost',{entryFee:1000}));
 await ok(feature.joinRoom(clockGuest,'clockGuest',clockId));await ok(feature.startRoom(clockHost,'clockHost',clockId));
 let clockRun=await ok(feature.startSession(clockHost,'clockHost',{kind:'room',room:clockId}));clockRun=await ok(feature.moveSession(clockHost,'clockHost',clockRun,{type:'answer',choice:sessionQuestion(clockRun).answer}));
 await env.withSecurityRulesDisabled(async ctx=>{const stamp=new sdk.Timestamp(Math.floor(Date.now()/1000)-30,123456000);await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',clockId),{startedAt:stamp});await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',clockId,'sessions','clockHost'),{questionAt:stamp});});
 clockRun=await ok(feature.moveSession(clockHost,'clockHost',clockRun,{type:'next'}));const raw=(await sdk.getDoc(ref(clockHost,'hkm_rooms',clockId,'sessions','clockHost'))).data();assert(raw.questionAt.toMillis()>Date.now()-5000);assert.equal(clockRun.index,1);checks+=2;
 await no(sdk.updateDoc(ref(clockGuest,'hkm_rooms',clockId),{feeShare:0,updatedAt:sdk.serverTimestamp()}));
 // Resume a room past its 24-hour deadline without replaying ten timeouts.
 const staleHost=await seed('staleHost'),staleGuest=await seed('staleGuest'),staleId=await ok(feature.createRoom(staleHost,'staleHost',{entryFee:1000}));
 await ok(feature.joinRoom(staleGuest,'staleGuest',staleId));await ok(feature.startRoom(staleHost,'staleHost',staleId));
 const staleRun=await ok(feature.startSession(staleHost,'staleHost',{kind:'room',room:staleId}));
 await env.withSecurityRulesDisabled(async ctx=>{const stamp=sdk.Timestamp.fromMillis(Date.now()-86401000);await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',staleId),{startedAt:stamp});await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',staleId,'sessions','staleHost'),{questionAt:stamp,deadlineAt:sdk.Timestamp.fromMillis(stamp.toMillis()+86400000)});});
 const recovered=await ok(feature.resumeSession(staleHost,'staleHost',staleRun));assert.equal(recovered.phase,'finished');assert.equal(recovered.correct,0);assert.equal((await feature.wallet(staleHost,'staleHost')).wallet.activeSession,'');checks+=3;
 // A late participant starts from their own server time while the shared deadline stays immutable.
 const asyncHost=await seed('asyncHost'),asyncGuest=await seed('asyncGuest'),asyncId=await ok(feature.createRoom(asyncHost,'asyncHost',{entryFee:1000}));
 await ok(feature.joinRoom(asyncGuest,'asyncGuest',asyncId));await ok(feature.startRoom(asyncHost,'asyncHost',asyncId));
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',asyncId),{startedAt:sdk.Timestamp.fromMillis(Date.now()-6*3600000)});});
 let asyncRun=await ok(feature.startSession(asyncGuest,'asyncGuest',{kind:'room',room:asyncId}));
 assert(asyncRun.questionAt>Date.now()-5000);assert(asyncRun.deadlineAt>Date.now()+17*3600000);checks+=2;
 await no(sdk.updateDoc(ref(asyncGuest,'hkm_rooms',asyncId,'sessions','asyncGuest'),{deadlineAt:sdk.Timestamp.fromMillis(Date.now()+48*3600000),updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(asyncHost,'hkm_rooms',asyncId),{mode:'live',updatedAt:sdk.serverTimestamp()}));
 asyncRun=await ok(feature.moveSession(asyncGuest,'asyncGuest',asyncRun,{type:'answer',choice:sessionQuestion(asyncRun).answer}));
 asyncRun=await ok(feature.moveSession(asyncGuest,'asyncGuest',asyncRun,{type:'next'}));assert.equal(asyncRun.index,1);checks++;
 // Expiry blocks fresh starts, new answers and late scoreboard reports, but clears an existing private run.
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore(),expired=sdk.Timestamp.fromMillis(Date.now()-1000);await sdk.updateDoc(sdk.doc(db,'hkm_rooms',asyncId),{startedAt:sdk.Timestamp.fromMillis(expired.toMillis()-86400000)});await sdk.updateDoc(sdk.doc(db,'hkm_rooms',asyncId,'sessions','asyncGuest'),{deadlineAt:expired});});
 await assert.rejects(feature.startSession(asyncHost,'asyncHost',{kind:'room',room:asyncId}));checks++;
 const beforeExpire=(await sdk.getDoc(ref(asyncGuest,'hkm_rooms',asyncId,'sessions','asyncGuest'))).data(),qid=sessionQuestion(asyncRun).id;
 await no(sdk.updateDoc(ref(asyncGuest,'hkm_rooms',asyncId,'sessions','asyncGuest'),{phase:'reveal',correct:beforeExpire.correct+1,answerAt:sdk.serverTimestamp(),updatedAt:sdk.serverTimestamp(),outcome:'correct',choice:sessionQuestion(asyncRun).answer,seen:beforeExpire.seen.concat([qid]),['answers.'+beforeExpire.index]:{qid,choice:sessionQuestion(asyncRun).answer,outcome:'correct',startedAt:beforeExpire.questionAt,answeredAt:sdk.serverTimestamp()}}));
 const expiredRun=await ok(feature.resumeSession(asyncGuest,'asyncGuest',asyncRun));assert.equal(expiredRun.phase,'finished');assert.equal((await feature.getRoom(asyncGuest,'asyncGuest',asyncId)).scores.asyncGuest.finished,false);assert.equal((await feature.wallet(asyncGuest,'asyncGuest')).wallet.activeSession,'');checks+=3;
 const expiredRoom=await ok(feature.finaliseRoom(asyncHost,'asyncHost',asyncId));assert.equal(expiredRoom.status,'cancelled');checks++;
 for(const [person,who]of [[asyncHost,'asyncHost'],[asyncGuest,'asyncGuest']]){await ok(feature.claimRoom(person,who,asyncId));assert.equal((await feature.wallet(person,who)).balance,985000);checks++;}
 const dangling=await seed('dangling');await ok(feature.wallet(dangling,'dangling'));await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets','dangling'),{activeSession:'weekend_missing',activeKind:'weekend'});});
 assert.equal(await ok(feature.activeSession(dangling,'dangling')),null);assert.equal((await feature.wallet(dangling,'dangling')).wallet.activeSession,'');checks++;
 const legacy=await seed('legacy');await ok(feature.wallet(legacy,'legacy'));
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.setDoc(sdk.doc(ctx.firestore(),'hkm_rooms','old-room'),{status:'playing',players:['legacy'],createdAt:sdk.Timestamp.now()});await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets','legacy'),{activeKind:'room',activeRoom:'old-room',activeSession:'old-room'});});
 assert.equal(await ok(feature.activeSession(legacy,'legacy')),null);assert.equal((await ok(feature.myRooms(legacy,'legacy'))).length,0);assert.equal((await feature.wallet(legacy,'legacy')).balance,1000000);checks++;
 await no(sdk.updateDoc(ref(clockHost,'hkm_wallets','clockHost'),{activeSession:'',activeKind:'',activeRoom:'',op:'retire-extra',item:clockId,revision:(await feature.wallet(clockHost,'clockHost')).wallet.revision+1,updatedAt:sdk.serverTimestamp()}));
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_players','legacy'),{activeDay:hkDay(),activeKind:'retired'});});
 await ok(sdk.updateDoc(ref(legacy,'hkm_players','legacy'),{activeDay:null,activeKind:'daily',lastSettledDay:hkDay(),updatedAt:sdk.serverTimestamp()}));
 assert.equal((await feature.wallet(legacy,'legacy')).profile.lastSettledDay,hkDay());checks++;
 console.log('Rewards Firestore: '+checks+' checks passed: fair 2/3/4-player escrow, immediate settlement, refunds, protected quotas and independent async clocks.');
}finally{await env.cleanup();}
