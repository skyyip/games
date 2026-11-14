// Run only inside `firebase emulators:exec --project demo-hk-millionaire --only firestore`.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,updateDoc,writeBatch,serverTimestamp,collection,getDocs,query,limit} from 'firebase/firestore';
import {newRun,act,questionFor,hkDay,spent,nextProfile,livesLeft} from '../src/game.js';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('No emulator: run firebase emulators:exec as documented; never run against production.');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const uid='rules-player',db=env.authenticatedContext(uid).firestore(),other=env.authenticatedContext('other').firestore(),anon=env.unauthenticatedContext().firestore();
const pRef=doc(db,'hkm_players',uid),day=hkDay(),rRef=doc(db,'hkm_players',uid,'runs',String(day));let checks=0;
const num=v=>{const n=v?.toMillis?.()??v;return typeof n==='number'?Math.floor(n):n;};
const normalize=raw=>({...raw,...Object.fromEntries(['startedAt','questionAt','answerAt','endedAt','updatedAt'].map(k=>[k,num(raw[k])])),answers:Object.fromEntries(Object.entries(raw.answers).map(([k,a])=>[k,{...a,startedAt:num(a.startedAt),answeredAt:num(a.answeredAt)}]))});
async function read(){return normalize((await getDoc(rRef)).data());}
try{
 await env.clearFirestore();const stamp=serverTimestamp();
 await assertSucceeds(setDoc(pRef,{uid,displayName:'規則測試街坊',total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null,lastSettledDay:null,createdAt:stamp,updatedAt:stamp}));checks++;
 await assertFails(getDoc(doc(other,'hkm_players',uid)));await assertFails(getDoc(doc(anon,'hkm_players',uid)));await assertFails(updateDoc(pRef,{total:1000000,updatedAt:serverTimestamp()}));checks+=3;
 let run=newRun(day,Date.now(),uid);const start=writeBatch(db);start.set(rRef,{...run,startedAt:serverTimestamp(),questionAt:serverTimestamp(),updatedAt:serverTimestamp()});start.update(pRef,{activeDay:day,updatedAt:serverTimestamp()});await assertSucceeds(start.commit());checks++;
 await assertFails(setDoc(rRef,{...run,startedAt:serverTimestamp(),questionAt:serverTimestamp(),updatedAt:serverTimestamp()}));await assertFails(updateDoc(rRef,{index:14,correct:14,updatedAt:serverTimestamp()}));checks+=2;
 await assertSucceeds(updateDoc(rRef,{halfFor:0,updatedAt:serverTimestamp()}));await assertFails(updateDoc(rRef,{halfFor:-1,updatedAt:serverTimestamp()}));checks+=2;
 for(let i=0;i<15;i++){
  const raw=(await getDoc(rRef)).data();run=normalize(raw);const next=act(run,{type:'answer',choice:questionFor(run).answer},Date.now(),{autoFinish:false});
  await assertSucceeds(updateDoc(rRef,{phase:'reveal',correct:next.correct,answerAt:serverTimestamp(),updatedAt:serverTimestamp(),outcome:next.outcome,choice:next.choice,seen:next.seen,answers:{...raw.answers,[i]:{...next.answers[i],startedAt:raw.questionAt,answeredAt:serverTimestamp()}}}));
  if(i<14){run=await read();await assertSucceeds(updateDoc(rRef,{phase:'playing',index:i+1,timeMs:spent(run),questionAt:serverTimestamp(),answerAt:null,outcome:'',choice:-1,updatedAt:serverTimestamp()}));}
 }checks+=29;
 run=await read();const profile=(await getDoc(pRef)).data(),done=act(run,{type:'finish'},Date.now()),next=nextProfile(profile,done),seasonRef=doc(db,'hkm_seasons',uid+'_'+run.season),resultRef=doc(db,'hkm_results',uid+'_'+day),rankRef=doc(db,'hkm_rankings',uid);
 await assertFails(setDoc(resultRef,{uid,day,displayName:profile.displayName,prize:1000000,timeMs:done.timeMs,lifelinesLeft:2,correct:15,reason:'complete',completedAt:serverTimestamp()}));checks++;
 const batch=writeBatch(db);batch.update(rRef,{phase:'finished',timeMs:done.timeMs,payout:1000000,reason:'complete',endedAt:serverTimestamp(),updatedAt:serverTimestamp()});batch.update(pRef,{total:next.total,bestPrize:next.bestPrize,games:next.games,titles:next.titles,unlocked:next.unlocked,wrong:next.wrong,activeDay:null,lastSettledDay:day,updatedAt:serverTimestamp()});batch.set(resultRef,{uid,day,displayName:profile.displayName,prize:done.payout,timeMs:done.timeMs,lifelinesLeft:livesLeft(done),correct:15,reason:'complete',completedAt:serverTimestamp()});batch.set(rankRef,{uid,displayName:profile.displayName,total:next.total,bestPrize:next.bestPrize,games:next.games,updatedAt:serverTimestamp()});batch.set(seasonRef,{uid,season:run.season,displayName:profile.displayName,total:done.payout,bestPrize:done.payout,games:1,updatedAt:serverTimestamp()});await assertSucceeds(batch.commit());checks++;
 assert.equal((await getDoc(pRef)).data().total,1000000);await assertFails(updateDoc(pRef,{total:2000000,games:2,updatedAt:serverTimestamp()}));await assertFails(updateDoc(resultRef,{prize:2000000}));await assertSucceeds(getDocs(query(collection(anon,'hkm_results'),limit(20))));await assertFails(getDocs(collection(anon,'hkm_results')));checks+=4;
 console.log(JSON.stringify({checks,project:'demo-hk-millionaire',rules:'compiled and executed by Firestore Emulator'}));
}finally{await env.cleanup();}
