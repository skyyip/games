import test from 'node:test';
import assert from 'node:assert/strict';
import {CITY_CULTURE_QUESTIONS} from '../src/city-culture-questions.js';
import {LOCAL_DISCOVERY_QUESTIONS} from '../src/local-discovery-questions.js';
import {QUESTIONS} from '../src/questions.js';
import {newRun,questionId,questionFor,act,QUESTION_PLANS,BANK_VERSION} from '../src/game.js';
import {newSession,sessionQid} from '../src/session-engine.js';
const bank=[...CITY_CULTURE_QUESTIONS,...LOCAL_DISCOVERY_QUESTIONS],ids=new Set(bank.map(q=>q.id)),DAY=20783,horizon=Math.max(...QUESTION_PLANS[BANK_VERSION].map(p=>p.ids.length));
test('120 additional culture records have distinct topics, balanced difficulty and answer positions',()=>{
 assert.equal(bank.length,120);assert.deepEqual(QUESTIONS.filter(q=>/^[kt]\d{2}$/.test(q.id)),bank);
 assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,QUESTIONS.length);
 for(const [prefix,records]of [['k',CITY_CULTURE_QUESTIONS],['t',LOCAL_DISCOVERY_QUESTIONS]]){
  assert.equal(records.length,60);assert.deepEqual([1,2,3].map(t=>records.filter(q=>q.tier===t).length),[20,20,20]);assert.deepEqual([0,1,2,3].map(a=>records.filter(q=>q.answer===a).length),[15,15,15,15]);
  for(const [i,q]of records.entries()){assert.equal(q.id,prefix+String(i+1).padStart(2,'0'));assert(Object.isFrozen(q)&&Object.isFrozen(q.options));assert(q.question.length<=90,q.id);assert(q.options.every(o=>o.length<=45),q.id);assert.equal(new Set(q.options).size,4);assert(q.explanation&&q.hint&&q.review&&q.source.label);assert.equal(new URL(q.source.url).protocol,'https:');assert(q.textOnly);}
 }
});
test('all 120 additions reach daily stages and grade both correct and incorrect choices',()=>{
 const found=new Map();for(let day=DAY;day<DAY+horizon;day++)for(let index=0;index<15;index++){const id=questionId(day,index);if(ids.has(id)&&!found.has(id))found.set(id,{day,index});}assert.equal(found.size,120);
 for(const q of bank){const {day,index}=found.get(q.id),now=day*86400000+3600000,run={...newRun(day,now),index,correct:index};assert.equal(questionFor(run).id,q.id);assert.equal(q.tier,Math.floor(index/5)+1);assert.equal(act(run,{type:'answer',choice:q.answer},now+1000).outcome,'correct');assert.equal(act(run,{type:'answer',choice:(q.answer+1)%4},now+1000).outcome,'wrong');}
});
test('weekend, retry and comprehensive neighbour rooms reach all new questions without repetitions',()=>{
 for(const kind of ['weekend','retry','room']){const found=new Set();for(let offset=0;offset<5;offset++)for(let seed=0;seed<horizon;seed++){const run=newSession({id:'coverage',uid:'test',kind,seed},(DAY+offset)*86400000),seen=new Set();for(let i=0;i<run.count;i++){const id=sessionQid(run,i);assert(!seen.has(id));seen.add(id);if(ids.has(id))found.add(id);}}assert.equal(found.size,120,kind);}
});
