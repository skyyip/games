import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {QUESTIONS} from '../src/questions.js';
import {STREET_OBSERVATION_QUESTIONS as bank} from '../src/street-observation-questions.js';
import {visualModes,visualSpec,questionView} from '../src/question-view.js';
import {newRun,questionId,presentation,act,hkDay,questionFor,QUESTION_PLANS,BANK_VERSION} from '../src/game.js';
import {newSession,sessionQuestion,sessionPresentation,sessionAct,ROOM_REVEAL_MS,ROOM_INTERVAL,ROOM_DURATION} from '../src/session-engine.js';
const NOW=Date.UTC(2026,10,16,4),DAY=hkDay(NOW);
test('both supplied drafts map every topic to one new, sourced, reachable question',()=>{
 const source=JSON.parse(readFileSync(new URL('../docs/source-street-60-topics.json',import.meta.url)));
 assert.equal(source.sourceEntries,60);assert.equal(source.topics.filter(q=>q.source===1).length,45);assert.equal(source.topics.filter(q=>q.source===2).length,15);
 assert.equal(bank.length,60);const counts=[0,0,0,0];for(const [i,q]of bank.entries()){
  assert.equal(q.id,source.topics[i].id);assert(QUESTIONS.includes(q));assert(q.review&&q.source.url&&q.explanation&&q.hint);counts[q.answer]++;
  assert.equal(new Set(q.options).size,4);assert(q.question.length<=55,q.id);assert(q.options.every(v=>v.length<=32),q.id);
  const svg=readFileSync(new URL('../assets/'+q.art+'.svg',import.meta.url),'utf8');assert(svg.includes('viewBox="0 0 800 500"'));assert(!/<script|<image|https?:/.test(svg.replace('http://www.w3.org/2000/svg','')));
 }
 assert.deepEqual(counts,[15,15,15,15]);
});
test('all retained street topics remain reachable as complete illustrations or text',()=>{
 const seen=new Set();for(let day=DAY;day<DAY+Math.max(...QUESTION_PLANS[BANK_VERSION].map(p=>p.ids.length));day++)for(let index=0;index<15;index++){
  const id=questionId(day,index);seen.add(id);assert(['original','text'].includes(presentation(day,index).mode));
 }
 for(const q of bank)assert(seen.has(q.id),q.id);
});
test('room answers stay hidden until the 30-second deadline and advance after 2.5-second reveal',()=>{
 assert.equal(ROOM_REVEAL_MS,2500);assert.equal(ROOM_INTERVAL,32500);assert.equal(ROOM_DURATION,325000);
 const run=newSession({id:'room',uid:'a',kind:'room',seed:DAY},NOW,NOW);
 const revealed=sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+1000);
 assert.equal(revealed.phase,'reveal');assert.deepEqual(sessionPresentation(revealed,NOW+29999),sessionPresentation(run,NOW));
 assert.throws(()=>sessionAct(revealed,{type:'next'},NOW+32499),/room-wait/);
 assert.equal(sessionAct(revealed,{type:'next'},NOW+32500).questionAt,NOW+32500);
});
