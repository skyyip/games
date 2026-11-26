import test from 'node:test';
import assert from 'node:assert/strict';
import {LOCAL_QUESTIONS} from '../src/local-questions.js';
import {QUESTIONS} from '../src/questions.js';
import {newRun,questionId,questionFor,act} from '../src/game.js';
import {newSession,sessionQid} from '../src/session-engine.js';
import {questionView,visualModes} from '../src/question-view.js';
const DAY=20783,ids=new Set(LOCAL_QUESTIONS.map(q=>q.id));
test('sixty local scenarios append unique, sourced, mobile-sized questions with balanced answer positions',()=>{
 assert.equal(LOCAL_QUESTIONS.length,60);assert.deepEqual(QUESTIONS.slice(-60),LOCAL_QUESTIONS);
 assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,QUESTIONS.length);
 assert.deepEqual([1,2,3].map(t=>LOCAL_QUESTIONS.filter(q=>q.tier===t).length),[20,37,3]);
 assert.deepEqual([0,1,2,3].map(a=>LOCAL_QUESTIONS.filter(q=>q.answer===a).length),[15,15,15,15]);
 for(const [i,q]of LOCAL_QUESTIONS.entries()){
  assert.equal(q.id,'l'+String(i+1).padStart(2,'0'));assert(Object.isFrozen(q)&&Object.isFrozen(q.options));
  assert(q.question.length>8&&q.question.length<=80,q.id);assert(q.options.every(o=>o.length>=2&&o.length<=40),q.id);
  assert(q.explanation.length>=35&&q.explanation.length<=160,q.id);assert(q.hint&&q.review&&q.source.label);
  assert.equal(new URL(q.source.url).protocol,'https:');assert.equal(questionView(q).question,q.question);
  assert.deepEqual(visualModes(q),[q.textOnly?'text':'original']);
 }
});
test('every added question is reachable in the daily plan and its semantic answer grades correctly',()=>{
 const found=new Map();
 for(let day=DAY;day<DAY+160;day++)for(let index=0;index<15;index++){
  const id=questionId(day,index);if(ids.has(id)&&!found.has(id))found.set(id,{day,index});
 }
 assert.equal(found.size,60);
 for(const q of LOCAL_QUESTIONS){
  const {day,index}=found.get(q.id),now=day*86400000+3600000;
  const run={...newRun(day,now),index,correct:index};assert.equal(questionFor(run).id,q.id);
  assert.equal(act(run,{type:'answer',choice:q.answer},now+1000).outcome,'correct',q.id);
  assert.equal(act(run,{type:'answer',choice:(q.answer+1)%4},now+1000).outcome,'wrong',q.id);
 }
});
test('new local knowledge reaches weekend, retry and comprehensive neighbour rooms through their actual pools',()=>{
 for(const kind of ['weekend','retry','room']){
  const found=new Set();
  for(let seed=1;seed<=500;seed++){
   const run=newSession({id:'coverage',uid:'test',kind,seed},(DAY+seed%160)*86400000);
   for(let index=0;index<run.count;index++){const id=sessionQid(run,index);if(ids.has(id))found.add(id)}
  }
  assert.equal(found.size,60,kind);
 }
});
test('recipes, slang, folklore and current routing retain explicit scope instead of making universal claims',()=>{
 const byId=Object.fromEntries(LOCAL_QUESTIONS.map(q=>[q.id,q]));
 assert.match(byId.l02.explanation,/不代表一定含魚翅/);
 assert.match(byId.l08.explanation,/不等於無糖/);
 assert.match(byId.l15.explanation,/不考即時船期/);
 assert.match(byId.l18.question,/2026年11月/);
 assert.match(byId.l32.explanation,/不是醫療保證/);
 assert.match(byId.l48.explanation,/定義可能不同/);
 assert.match(byId.l57.question,/西貢/);
});
