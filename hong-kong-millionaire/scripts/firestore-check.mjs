// Actual production transition payloads, executed only against a demo Firestore Emulator.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,writeBatch,serverTimestamp,Timestamp,collection,getDocs,query,limit} from 'firebase/firestore';
import {newRun,act,questionFor,hkDay,spent,nextProfile,livesLeft} from '../src/game.js';
import {normalizeRun,transitionPatch} from '../src/cloud-transition.js';
import {COLLECTIONS as C} from '../src/schema.js';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Run with firebase emulators:exec; no production access.');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const other=env.authenticatedContext('other').firestore(),anon=env.unauthenticatedContext().firestore();
let checks=0;
async function begin(uid){
 const db=env.authenticatedContext(uid).firestore(),day=hkDay(),pRef=doc(db,C.players,uid),rRef=doc(db,C.players,uid,'runs',String(day)),stamp=serverTimestamp();
 await assertSucceeds(setDoc(pRef,{uid,displayName:'規則測試街坊',total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null,lastSettledDay:null,createdAt:stamp,updatedAt:stamp}));checks++;
 const run=newRun(day,Date.now(),uid),batch=writeBatch(db);batch.set(rRef,{...run,startedAt:stamp,questionAt:stamp,updatedAt:stamp});batch.update(pRef,{activeDay:day,updatedAt:stamp});await assertSucceeds(batch.commit());checks++;
 return {uid,db,day,pRef,rRef};
}
async function raw(a){return (await getDoc(a.rRef)).data();}
async function move(a,action){const before=await raw(a),patch=transitionPatch(before,action,Date.now(),serverTimestamp);if(patch)await assertSucceeds(updateDoc(a.rRef,patch));checks++;return normalizeRun(await raw(a));}
async function settle(a){
 const run=normalizeRun(await raw(a)),profile=(await getDoc(a.pRef)).data(),done=act(run,{type:'finish'},Date.now()),p=nextProfile(profile,done),stamp=serverTimestamp();
 const seasonRef=doc(a.db,C.seasons,a.uid+'_'+run.season),previous=(await getDoc(seasonRef)).data()??{total:0,bestPrize:0,games:0};
 const batch=writeBatch(a.db);
 batch.update(a.rRef,{phase:'finished',timeMs:done.timeMs,payout:done.payout,reason:done.reason,endedAt:stamp,updatedAt:stamp});
 batch.update(a.pRef,{total:p.total,bestPrize:p.bestPrize,games:p.games,titles:p.titles,unlocked:p.unlocked,wrong:p.wrong,activeDay:null,lastSettledDay:a.day,updatedAt:stamp});
 batch.set(doc(a.db,C.results,a.uid+'_'+a.day),{uid:a.uid,day:a.day,displayName:profile.displayName,prize:done.payout,timeMs:done.timeMs,lifelinesLeft:livesLeft(done),correct:done.correct,reason:done.reason,completedAt:stamp});
 batch.set(doc(a.db,C.rankings,a.uid),{uid:a.uid,displayName:profile.displayName,total:p.total,bestPrize:p.bestPrize,games:p.games,updatedAt:stamp});
 batch.set(seasonRef,{uid:a.uid,season:run.season,displayName:profile.displayName,total:previous.total+done.payout,bestPrize:Math.max(previous.bestPrize,done.payout),games:previous.games+1,updatedAt:stamp});
 await assertSucceeds(batch.commit());checks++;return done;
}
try{
 await env.clearFirestore();const a=await begin('rules-player');
 await assertFails(getDoc(doc(other,C.players,a.uid)));await assertFails(getDoc(doc(anon,C.players,a.uid)));await assertFails(updateDoc(a.pRef,{total:1000000,updatedAt:serverTimestamp()}));checks+=3;
 await assertFails(updateDoc(a.rRef,{index:14,correct:14,updatedAt:serverTimestamp()}));await assertFails(updateDoc(a.pRef,{activeDay:null,updatedAt:serverTimestamp()}));checks+=2;
 const initial=await raw(a),old=normalizeRun(initial),good=transitionPatch(initial,{type:'answer',choice:questionFor(old).answer},Date.now(),serverTimestamp);
 for(const patch of [
  {...good,correct:15},
  {...good,uid:'other'},
  {...good,questionAt:serverTimestamp()},
  {...good,payout:1000000},
  {...good,'answers.0':{...good['answers.0'],qid:'forged'}},
  {...good,'answers.0':{...good['answers.0'],startedAt:Timestamp.fromMillis(0)}},
  {...good,answerAt:Timestamp.fromMillis(0)},
 ]){await assertFails(updateDoc(a.rRef,patch));checks++;}
 for(const kind of ['half','phone','audience'])await move(a,{type:'life',kind});
 assert.equal((await raw(a)).questionAt.isEqual(initial.questionAt),true);checks++;
 await assertFails(updateDoc(a.rRef,{halfFor:-1,updatedAt:serverTimestamp()}));checks++;
 console.log('Rules regression: submitting the first correct answer with the production payload.');
 let run=await move(a,{type:'answer',choice:questionFor(old).answer});assert.equal(run.correct,1);assert.equal(run.phase,'reveal');checks++;
 await assertFails(updateDoc(a.rRef,good));checks++;
 for(let i=1;i<15;i++){run=await move(a,{type:'next'});run=await move(a,{type:'answer',choice:questionFor(run).answer});assert.equal(run.correct,i+1);checks++;}
 await assertFails(setDoc(doc(a.db,C.results,a.uid+'_'+a.day),{uid:a.uid,day:a.day,displayName:'偽造',prize:1000000,timeMs:0,lifelinesLeft:3,correct:15,reason:'complete',completedAt:serverTimestamp()}));checks++;
 console.log('Rules regression: atomic run/profile/daily/ranking/season settlement.');
 const won=await settle(a);assert.equal(won.payout,1000000);assert.equal((await getDoc(a.pRef)).data().total,1000000);checks++;
 await assertFails(updateDoc(a.pRef,{total:2000000,games:2,updatedAt:serverTimestamp()}));await assertFails(updateDoc(a.rRef,{phase:'playing',updatedAt:serverTimestamp()}));checks+=2;
 await assertSucceeds(getDocs(query(collection(anon,C.results),limit(20))));await assertFails(getDocs(collection(anon,C.results)));checks+=2;
 // Both first-answer failure and voluntary exit must use the same protected transition and settlement.
 for(const type of ['wrong','walk','timeout']){
  const b=await begin('rules-'+type);
  if(type==='timeout')await env.withSecurityRulesDisabled(async context=>{await updateDoc(doc(context.firestore(),C.players,b.uid,'runs',String(b.day)),{questionAt:Timestamp.fromMillis(Date.now()-26000),startedAt:Timestamp.fromMillis(Date.now()-27000)});});
  const r=normalizeRun(await raw(b));await move(b,type==='wrong'?{type:'answer',choice:(questionFor(r).answer+1)%4}:{type});
  const done=await settle(b);assert.equal(done.reason,type);assert.equal(done.payout,0);assert.equal((await getDoc(b.pRef)).data().games,1);checks+=3;
 }
 // Release-specific collections are not part of the game schema.
 await assertFails(getDoc(doc(a.db,'hkm_v4_players',a.uid)));checks++;
 console.log(JSON.stringify({checks,project:'demo-hk-millionaire',rules:'compiled and executed by Firestore Emulator',payload:'production transitionPatch',bank:won.bankVersion}));
}finally{await env.cleanup();}
