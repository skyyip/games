import test from 'node:test';
import assert from 'node:assert/strict';
import {NEIGHBOURHOOD_QUESTIONS as bank} from '../src/neighbourhood-questions.js';
import {QUESTIONS} from '../src/questions.js';
import {newRun,questionId,questionFor,act} from '../src/game.js';
import {newSession,sessionQid} from '../src/session-engine.js';
const DAY=20783,ids=new Set(bank.map(q=>q.id));
test('60 new neighbourhood records preserve distinct topics, sources and balanced progression',()=>{
 assert.equal(bank.length,60);assert.deepEqual(QUESTIONS.filter(q=>q.id.startsWith('n')),bank);
 assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,QUESTIONS.length);
 assert.deepEqual([1,2,3].map(t=>bank.filter(q=>q.tier===t).length),[20,20,20]);
 assert.deepEqual([0,1,2,3].map(a=>bank.filter(q=>q.answer===a).length),[15,15,15,15]);
 for(const [i,q]of bank.entries()){
  assert.equal(q.id,'n'+String(i+1).padStart(2,'0'));assert(Object.isFrozen(q)&&Object.isFrozen(q.options));
  assert(q.question.length<=90);assert(q.options.every(o=>o.length<=45));assert.equal(new Set(q.options).size,4);
  assert(q.explanation&&q.hint&&q.review&&q.source.label);assert.equal(new URL(q.source.url).protocol,'https:');
 }
});
test('all additions are reachable, retain their difficulty stage and grade both correct and wrong answers',()=>{
 const found=new Map();for(let day=DAY;day<DAY+346;day++)for(let index=0;index<15;index++){const id=questionId(day,index);if(ids.has(id)&&!found.has(id))found.set(id,{day,index});}
 assert.equal(found.size,60);
 for(const q of bank){const {day,index}=found.get(q.id),now=day*86400000+3600000,run={...newRun(day,now),index,correct:index};assert.equal(questionFor(run).id,q.id);assert.equal(q.tier,Math.floor(index/5)+1);assert.equal(act(run,{type:'answer',choice:q.answer},now+1000).outcome,'correct');assert.equal(act(run,{type:'answer',choice:(q.answer+1)%4},now+1000).outcome,'wrong');}
});
test('the new bank is drawn by weekend, retry and comprehensive room sessions without repeats',()=>{
 for(const kind of ['weekend','retry','room']){const found=new Set();for(let offset=0;offset<5;offset++)for(let seed=0;seed<346;seed++){const run=newSession({id:'coverage',uid:'test',kind,seed},(DAY+offset)*86400000),seen=new Set();for(let i=0;i<run.count;i++){const id=sessionQid(run,i);assert(!seen.has(id));seen.add(id);if(ids.has(id))found.add(id);}}assert.equal(found.size,60,kind);}
});
test('nearby historical dates and similar traditions remain correctly scoped',()=>{
 const byId=Object.fromEntries(bank.map(q=>[q.id,q]));
 assert.equal(byId.n29.options[byId.n29.answer],'1846年');assert.equal(byId.n30.options[byId.n30.answer],'1915年');
 assert.equal(byId.n59.options[byId.n59.answer],'1911年');assert.match(byId.n59.explanation,/1912年開課/);
 assert.match(byId.n40.question,/大坑/);assert.match(byId.n37.explanation,/另選日子/);
 assert.match(byId.n23.explanation,/不應誤當為孫中山故居/);assert.match(byId.n51.explanation,/不代表影片從此不能再重映/);
});
