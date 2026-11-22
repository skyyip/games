import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS} from '../src/questions.js';
import {newRun,act,hkDay,questionFor,remaining,QUESTION_MS} from '../src/game.js';
import {visualModes,visualSpec,questionView} from '../src/question-view.js';
import {newSession,sessionAct,sessionQuestion,ROOM_INTERVAL,ROOM_DURATION} from '../src/session-engine.js';

const NOW=Date.UTC(2026,10,22,4);
test('knowledge questions remain identical for all former picture effects',()=>{
 for(const q of QUESTIONS){
  assert.deepEqual(visualModes(q),[q.textOnly?'text':'original'],q.id);
  for(const mode of ['original','text','blurred','partial','mirrored','spotlight']){
   const view=questionView(q,mode);
   assert.equal(view.question,q.textQuestion??q.question,q.id+' '+mode);
   assert.strictEqual(view.options,q.options);assert.equal(view.answer,q.answer);
   assert.equal(visualSpec(q,mode).mode,q.textOnly?'text':'original');
  }
 }
});
test('daily and extra challenges accept answers after 25s and expire at 30s',()=>{
 assert.equal(QUESTION_MS,30000);
 const daily=newRun(hkDay(NOW),NOW);
 assert.equal(remaining(daily,NOW+25000),5000);
 assert.equal(act(daily,{type:'answer',choice:questionFor(daily).answer},NOW+29999).outcome,'correct');
 assert.equal(act(daily,{type:'answer',choice:questionFor(daily).answer},NOW+30000).reason,'timeout');
 for(const kind of ['weekend','retry','room']){
  const run=newSession({id:'test',uid:'player',kind,seed:123},NOW,NOW);
  assert.equal(sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+29999).outcome,'correct');
  assert.equal(sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+30000).outcome,'timeout');
 }
 assert.equal(ROOM_INTERVAL,32500);assert.equal(ROOM_DURATION,325000);
});
