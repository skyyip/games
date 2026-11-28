import test from 'node:test';
import assert from 'node:assert/strict';
import {NEIGHBOURHOOD_CHAPTER_QUESTIONS as bank} from '../src/neighbourhood-chapter-questions.js';
import {QUESTIONS} from '../src/questions.js';
import {newRun,questionId,questionFor,act,QUESTION_PLANS,BANK_VERSION} from '../src/game.js';
import {newSession,sessionQid,ROOM_POOLS} from '../src/session-engine.js';
const ids=new Set(bank.map(q=>q.id)),DAY=20783,horizon=Math.max(...QUESTION_PLANS[BANK_VERSION].map(p=>p.ids.length));
test('120 neighbourhood chapter questions have distinct IDs, balanced tiers and plausible-size options',()=>{
 assert.equal(bank.length,120);assert.equal(ids.size,120);assert.deepEqual(QUESTIONS.filter(q=>/^(aa|bb|cc)\d{2}$/.test(q.id)),bank);
 assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,1011);assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,1011);
 assert.deepEqual([1,2,3].map(t=>bank.filter(q=>q.tier===t).length),[40,40,40]);assert.deepEqual([0,1,2,3].map(a=>bank.filter(q=>q.answer===a).length),[30,30,30,30]);
 for(const [prefix,records]of [['aa',bank.filter(q=>q.tier===1)],['bb',bank.filter(q=>q.tier===2)],['cc',bank.filter(q=>q.tier===3)]]){
  assert.equal(records.length,40);assert.deepEqual([0,1,2,3].map(a=>records.filter(q=>q.answer===a).length),[10,10,10,10]);
  for(const [i,q]of records.entries()){assert.equal(q.id,prefix+String(i+1).padStart(2,'0'));assert(Object.isFrozen(q)&&Object.isFrozen(q.options));assert(q.question.length<=90,q.id);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.options.every(o=>o.length<=45),q.id);assert(q.explanation&&q.hint&&q.review&&q.source.label);assert.equal(new URL(q.source.url).protocol,'https:');assert(q.textOnly);}
 }
});
test('every addition reaches its daily difficulty stage and grades both answers correctly',()=>{
 const found=new Map();for(let day=DAY;day<DAY+horizon;day++)for(let index=0;index<15;index++){const id=questionId(day,index);if(ids.has(id)&&!found.has(id))found.set(id,{day,index});}assert.equal(found.size,120);
 for(const q of bank){const {day,index}=found.get(q.id),now=day*86400000+3600000,run={...newRun(day,now),index,correct:index};assert.equal(questionFor(run).id,q.id);assert.equal(q.tier,Math.floor(index/5)+1);assert.equal(act(run,{type:'answer',choice:q.answer},now+1000).outcome,'correct');assert.equal(act(run,{type:'answer',choice:(q.answer+1)%4},now+1000).outcome,'wrong');}
});
test('all new questions reach weekend, retry and comprehensive room modes without repeated questions',()=>{
 for(const kind of ['weekend','retry','room']){const found=new Set();for(let offset=0;offset<5;offset++)for(let seed=0;seed<horizon;seed++){const run=newSession({id:'coverage',uid:'p',kind,seed},(DAY+offset)*86400000),seen=new Set();for(let i=0;i<run.count;i++){const id=sessionQid(run,i);assert(!seen.has(id));seen.add(id);if(ids.has(id))found.add(id);}}assert.equal(found.size,120,kind);}
});
test('new specialist-topic questions are reachable in their matching room',()=>{
 for(const topic of ['sport','places']){const expected=ROOM_POOLS[topic].ids.filter(id=>ids.has(id)),seen=new Set();for(let seed=0;seed<ROOM_POOLS[topic].ids.length;seed++){const run=newSession({id:'topic',uid:'p',kind:'room',seed,topic},DAY*86400000);for(let i=0;i<run.count;i++){const id=sessionQid(run,i);if(ids.has(id))seen.add(id);}}assert.deepEqual([...seen].sort(),expected.sort(),topic);}
});
