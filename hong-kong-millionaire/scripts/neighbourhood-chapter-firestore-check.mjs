// Exercise the generated answer tables for every new question, only in the demo emulator.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,updateDoc,serverTimestamp,Timestamp} from 'firebase/firestore';
import {NEIGHBOURHOOD_CHAPTER_QUESTIONS as bank} from '../src/neighbourhood-chapter-questions.js';
import {QUESTION_PLANS,BANK_VERSION} from '../src/game.js';
import {newSession,sessionQid,sessionQuestion,sessionAct} from '../src/session-engine.js';
if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Demo Firestore Emulator required; no production access.');
const env=await initializeTestEnvironment({projectId:'demo-hk-millionaire',firestore:{rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const wanted=new Set(bank.map(q=>q.id)),fixtures=new Map(),horizon=Math.max(...QUESTION_PLANS[BANK_VERSION].map(p=>p.ids.length));
for(let seed=0;seed<horizon;seed++){
 const run=newSession({id:'coverage',uid:'chapter',kind:'weekend',seed});
 for(let index=0;index<14;index++){const id=sessionQid(run,index);if(wanted.has(id)&&!fixtures.has(id))fixtures.set(id,{seed,index});}
}
assert.equal(fixtures.size,120);let checks=0;
try{
 for(const q of bank){
  const {seed,index}=fixtures.get(q.id),uid='chapter-'+q.id,id='weekend_'+crypto.randomUUID(),now=Date.now();
  let run=newSession({id,uid,kind:'weekend',seed},now-15000);
  // Seed a valid answered prefix; creation, quotas and settlement are covered by the main suite.
  for(let i=0;i<index;i++){run=sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},now-14000+i*100);run=sessionAct(run,{type:'next'},now-13950+i*100);}
  run={...run,questionAt:now,updatedAt:now};assert.equal(sessionQuestion(run).id,q.id);
  const stamp=Timestamp.fromMillis(now),stored={...run,startedAt:Timestamp.fromMillis(run.startedAt),questionAt:stamp,updatedAt:stamp,answers:Object.fromEntries(Object.entries(run.answers).map(([key,a])=>[key,{...a,startedAt:Timestamp.fromMillis(a.startedAt),answeredAt:Timestamp.fromMillis(a.answeredAt)}]))};
  await env.withSecurityRulesDisabled(async context=>{await setDoc(doc(context.firestore(),'hkm_players',uid,'sessions',id),stored);});
  const target=doc(env.authenticatedContext(uid).firestore(),'hkm_players',uid,'sessions',id);
  const patch=choice=>{
   const next=sessionAct(run,{type:'answer',choice},now+1);
   return {phase:next.phase,correct:next.correct,choice:next.choice,outcome:next.outcome,seen:next.seen,answerAt:serverTimestamp(),updatedAt:serverTimestamp(),['answers.'+index]:{...next.answers[index],startedAt:stamp,answeredAt:serverTimestamp()}};
  };
  const wrong=patch((q.answer+1)%4);
  await assertFails(updateDoc(target,{...wrong,correct:run.correct+1,outcome:'correct',['answers.'+index]:{...wrong['answers.'+index],outcome:'correct'}}));checks++;
  await assertSucceeds(updateDoc(target,patch(q.answer)));checks++;
  await env.withSecurityRulesDisabled(async context=>{await setDoc(doc(context.firestore(),'hkm_players',uid,'sessions',id),stored);});
  await assertSucceeds(updateDoc(target,wrong));checks++;
 }
 console.log(JSON.stringify({checks,newQuestions:bank.length,correctAccepted:true,forgedCorrectRejected:true,wrongGradedCorrectly:true,project:'demo-hk-millionaire'}));
}finally{await env.cleanup();}
