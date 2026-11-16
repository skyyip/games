import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import * as sdk from 'firebase/firestore';
import * as feature from '../src/features-cloud.js';
import {emptyWallet,isWeekend} from '../src/economy.js';
import {newSession,sessionQuestion} from '../src/session-engine.js';
import {hkDay} from '../src/game.js';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('demo emulator required');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
let checks=0;
const context=uid=>({...sdk,db:env.authenticatedContext(uid).firestore()});
const ref=(c,...p)=>sdk.doc(c.db,...p);
async function seed(uid,total=1000000){await env.withSecurityRulesDisabled(async ctx=>{const stamp=sdk.Timestamp.now();await sdk.setDoc(sdk.doc(ctx.firestore(),'hkm_players',uid),{uid,displayName:'街坊'+uid,total,bestPrize:1000000,games:1,titles:['ordinary','neighbour','expert','peak','millionaire'],unlocked:[],wrong:[],favourites:[],activeDay:null,activeKind:'daily',lastSettledDay:null,createdAt:stamp,updatedAt:stamp});});return context(uid);}
const ok=async p=>{const r=await assertSucceeds(p);checks++;return r;},no=async p=>{await assertFails(p);checks++;};
try{
 await env.clearFirestore();
 const c=await seed('collector');let result=await ok(feature.wallet(c,'collector'));assert.equal(result.balance,1000000);
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector'),{bonus:999999,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector'),{cards:{'tram-foil':100},updatedAt:sdk.serverTimestamp()}));
 const requestId=crypto.randomUUID();result=await ok(feature.shop(c,'collector',{type:'gold',requestId}));assert(result.outcome.endsWith('-foil'));assert.equal(result.balance,950000);const revision=result.wallet.revision;
 result=await ok(feature.shop(c,'collector',{type:'gold',requestId}));assert.equal(result.wallet.revision,revision);assert.equal(result.balance,950000);checks+=3;
 await assert.rejects(feature.shop(c,'collector',{type:'equip',slot:'frame',id:'frame-gold',requestId:crypto.randomUUID()}));checks++;
 result=await ok(feature.shop(c,'collector',{type:'buy',id:'frame-rwb',requestId:crypto.randomUUID()}));assert.equal(result.balance,930000);
 result=await ok(feature.shop(c,'collector',{type:'equip',slot:'frame',id:'frame-rwb',requestId:crypto.randomUUID()}));assert.equal(result.wallet.frame,'frame-rwb');
 const styles=await ok(feature.publicStyles(c,['collector']));assert.equal(styles.collector.frame,'frame-rwb');checks++;
 await no(sdk.updateDoc(ref(c,'hkm_styles','collector'),{frame:'frame-gold',updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_players','collector'),{total:9999999,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(c,'hkm_wallets','collector','receipts',requestId),{cost:0}));
 const other=context('other');await no(sdk.getDoc(ref(other,'hkm_wallets','collector')));
 await assert.rejects(feature.shop(c,'collector',{type:'swap',requestId:crypto.randomUUID()}),/invalid-item/);checks++;
 await no(sdk.setDoc(ref(c,'hkm_assisted_results','removed'),{uid:'collector'}));
 const practice=await seed('practice');await ok(feature.wallet(practice,'practice'));const practiceId='weekend_'+crypto.randomUUID();
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore(),stamp=sdk.Timestamp.now(),r=newSession({id:practiceId,uid:'practice',kind:'weekend',seed:hkDay()},Date.now());await sdk.setDoc(sdk.doc(db,'hkm_players','practice','sessions',practiceId),{...r,phase:'reveal',index:14,correct:15,outcome:'correct',choice:0,answerAt:stamp,startedAt:stamp,questionAt:stamp,updatedAt:stamp});await sdk.updateDoc(sdk.doc(db,'hkm_wallets','practice'),{activeSession:practiceId,activeKind:'weekend',passUses:3,practiceDay:hkDay(),practiceEarned:99500});});
 const practiceRun=await ok(feature.settleSession(practice,'practice',{id:practiceId,kind:'weekend',room:''}));assert.equal(practiceRun.credit,500);assert.equal((await feature.wallet(practice,'practice')).wallet.practiceEarned,100000);checks+=2;
 await no(sdk.updateDoc(ref(practice,'hkm_wallets','practice'),{practiceEarned:0,passUses:0,updatedAt:sdk.serverTimestamp()}));
 await no(sdk.updateDoc(ref(practice,'hkm_wallets','practice'),{passUses:0,revision:5,op:'pass',updatedAt:sdk.serverTimestamp()}));
 for(const count of [2,3,4]){
  const people=await Promise.all(Array.from({length:count},(_,i)=>seed('table'+count+'p'+i))),uids=Array.from({length:count},(_,i)=>'table'+count+'p'+i),entryFee=50000;
  const id=await ok(feature.createRoom(people[0],uids[0],{topic:'sport',entryFee}));assert.match(id,/^[A-HJ-NP-Z2-9]{8}$/);checks++;
  await ok(feature.createRoom(people[0],uids[0],{topic:'sport',entryFee,code:id}));assert.equal((await feature.wallet(people[0],uids[0])).balance,935000);checks++;
  for(let i=1;i<count;i++){await ok(feature.joinRoom(people[i],uids[i],id));await ok(feature.joinRoom(people[i],uids[i],id));assert.equal((await feature.wallet(people[i],uids[i])).balance,935000);checks++;}
  await no(sdk.updateDoc(ref(people[0],'hkm_rooms',id),{entryFee:1000,updatedAt:sdk.serverTimestamp()}));
  if(count===4){const fifth=await seed('fifth');await assert.rejects(feature.joinRoom(fifth,'fifth',id),/room-full/);checks++;}
  await ok(feature.startRoom(people[0],uids[0],id));
  const runs=await Promise.all(people.map((person,i)=>ok(feature.startSession(person,uids[i],{kind:'room',room:id}))));
  assert.equal(new Set(runs.map(r=>r.questionAt)).size,1);checks++;
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
 // Nanosecond precision survives the half-second room interval.
 const clockHost=await seed('clockHost'),clockGuest=await seed('clockGuest'),clockId=await ok(feature.createRoom(clockHost,'clockHost',{entryFee:1000}));
 await ok(feature.joinRoom(clockGuest,'clockGuest',clockId));await ok(feature.startRoom(clockHost,'clockHost',clockId));
 let clockRun=await ok(feature.startSession(clockHost,'clockHost',{kind:'room',room:clockId}));clockRun=await ok(feature.moveSession(clockHost,'clockHost',clockRun,{type:'answer',choice:sessionQuestion(clockRun).answer}));
 await env.withSecurityRulesDisabled(async ctx=>{const stamp=new sdk.Timestamp(Math.floor(Date.now()/1000)-30,123456000);await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',clockId),{startedAt:stamp});await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_rooms',clockId,'sessions','clockHost'),{questionAt:stamp});});
 clockRun=await ok(feature.moveSession(clockHost,'clockHost',clockRun,{type:'next'}));const raw=(await sdk.getDoc(ref(clockHost,'hkm_rooms',clockId,'sessions','clockHost'))).data();assert.equal(raw.questionAt.nanoseconds,623456000);assert.equal(clockRun.index,1);checks+=2;
 await no(sdk.updateDoc(ref(clockGuest,'hkm_rooms',clockId),{feeShare:0,updatedAt:sdk.serverTimestamp()}));
 const legacy=await seed('legacy');await ok(feature.wallet(legacy,'legacy'));
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.setDoc(sdk.doc(ctx.firestore(),'hkm_rooms','old-room'),{status:'playing',players:['legacy'],createdAt:sdk.Timestamp.now()});await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_wallets','legacy'),{activeKind:'room',activeRoom:'old-room',activeSession:'old-room'});});
 assert.equal(await ok(feature.activeSession(legacy,'legacy')),null);assert.equal((await ok(feature.myRooms(legacy,'legacy'))).length,0);assert.equal((await feature.wallet(legacy,'legacy')).balance,1000000);checks++;
 await no(sdk.updateDoc(ref(clockHost,'hkm_wallets','clockHost'),{activeSession:'',activeKind:'',activeRoom:'',op:'retire-extra',item:clockId,revision:(await feature.wallet(clockHost,'clockHost')).wallet.revision+1,updatedAt:sdk.serverTimestamp()}));
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.updateDoc(sdk.doc(ctx.firestore(),'hkm_players','legacy'),{activeDay:hkDay(),activeKind:'retired'});});
 await ok(sdk.updateDoc(ref(legacy,'hkm_players','legacy'),{activeDay:null,activeKind:'daily',lastSettledDay:hkDay(),updatedAt:sdk.serverTimestamp()}));
 assert.equal((await feature.wallet(legacy,'legacy')).profile.lastSettledDay,hkDay());checks++;
 console.log('Rewards Firestore: '+checks+' checks passed: fair 2/3/4-player escrow, immediate settlement, refunds, protected quotas and precise shared clock.');
}finally{await env.cleanup();}
