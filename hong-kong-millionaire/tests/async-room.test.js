import test from 'node:test';
import assert from 'node:assert/strict';
import {newSession,sessionAct,sessionQuestion,sessionQid,sessionRemaining,sessionTerminal,sessionFinish,sessionReviewReady,roomCanFinish,roomDeadline,ROOM_ASYNC_WINDOW} from '../src/session-engine.js';
const NOW=Date.UTC(2026,10,22,4);
const room={id:'AB23CD45',mode:'async',status:'playing',startedAt:NOW,players:['a','b'],scores:{a:{finished:false},b:{finished:false}}};
const start=(uid,at)=>newSession({id:room.id,room:room.id,uid,kind:'room',seed:19,roomMode:'async',deadlineAt:roomDeadline(room)},at,NOW);
test('players start the same questions hours apart with independent 25-second clocks',()=>{
 let a=start('a',NOW),b=start('b',NOW+6*3600000);
 assert.equal(a.questionAt,NOW);assert.equal(b.questionAt,NOW+6*3600000);
 assert.deepEqual(Array.from({length:10},(_,i)=>sessionQid(a,i)),Array.from({length:10},(_,i)=>sessionQid(b,i)));
 assert.equal(sessionRemaining(b,b.questionAt+1000),24000);
 a=sessionAct(a,{type:'answer',choice:sessionQuestion(a).answer},NOW+500);
 a=sessionAct(a,{type:'next'},NOW+800);assert.equal(a.questionAt,NOW+800);
 assert.equal(sessionAct(b,{type:'timeout'},b.questionAt+25000).outcome,'timeout');
 assert.equal(b.index,0);
});
test('a room settles at exactly 24 hours or immediately after all submissions',()=>{
 assert.equal(roomDeadline(room),NOW+ROOM_ASYNC_WINDOW);
 assert(!roomCanFinish(room,NOW+305000));assert(!roomCanFinish(room,roomDeadline(room)-1));
 assert(roomCanFinish(room,roomDeadline(room)));
 assert(roomCanFinish({...room,scores:{a:{finished:true},b:{finished:true}}},NOW+1000));
});
test('the room deadline caps a late question and ends a recovered run without restarting it',()=>{
 const deadline=roomDeadline(room);let r=start('a',deadline-5000);
 assert.equal(sessionRemaining(r,deadline-1),1);
 r=sessionAct(r,{type:'answer',choice:sessionQuestion(r).answer},deadline);
 assert.equal(r.outcome,'timeout');assert.equal(r.correct,0);assert(sessionTerminal(r,deadline));
 assert.equal(sessionAct(r,{type:'next'},deadline+1).phase,'finished');
});
test('finishing early does not unlock explanations while another player can still answer',()=>{
 const run=sessionFinish(sessionAct(start('a',NOW),{type:'walk'},NOW+500),NOW+500);
 assert(!sessionReviewReady(run,room,NOW+60000));
 assert(!sessionReviewReady(run,room,roomDeadline(room)+1));
 assert(sessionReviewReady(run,{...room,status:'finished'},NOW+60000));
 assert(sessionReviewReady(run,{...room,scores:{a:{finished:true},b:{finished:true}}},NOW+60000));
});
