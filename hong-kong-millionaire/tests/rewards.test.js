import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWallet,walletBalance,walletAction,drawnCard,CULTURE_CARDS,FOIL_CARDS,unlockedPrefixes,weekendKey,isWeekend} from '../src/economy.js';
import {newSession,sessionQid,sessionQuestion,sessionAct,sessionFinish,sessionReviewReady,ROOM_POOLS,roomWinner,ROOM_INTERVAL,roomFeeShare,roomCanFinish,roomCode,roomEntry} from '../src/session-engine.js';
import {hkDay,dayEnd} from '../src/game.js';
const NOW=Date.UTC(2026,10,14,4),DAY=hkDay(NOW);
test('purchases spend an available balance without reducing career prize totals',()=>{
 const profile={total:1000000},old=emptyWallet('p',0),next=walletAction(profile,old,{type:'buy',id:'frame-rwb'},DAY);
 assert.equal(profile.total,1000000);assert.equal(next.spent,20000);assert.equal(walletBalance(profile,next),980000);assert.deepEqual(old.owned,[]);
 assert.throws(()=>walletAction(profile,next,{type:'buy',id:'frame-rwb'},DAY),/already-owned/);
 assert.throws(()=>walletAction({total:0},old,{type:'gold'},DAY),/insufficient-balance/);
});
test('draws are replay-stable and every gold draw is a foil',()=>{
 const profile={total:1000000};let wallet=emptyWallet('p',1001);const foils=new Set();
 for(let i=0;i<6;i++){const expected=drawnCard(wallet,true);assert.equal(drawnCard({...wallet},true),expected);wallet=walletAction(profile,wallet,{type:'gold'},DAY);foils.add(wallet.item);assert(CULTURE_CARDS.find(c=>c.id===wallet.item).foil);}
 assert.equal(foils.size,FOIL_CARDS.length);assert.equal(wallet.draws,6);assert.equal(wallet.spent,300000);
});
test('normal draw distribution and set prefixes do not grant answer advantages',()=>{
 let wallet=emptyWallet('p',0),foils=0;for(let i=0;i<126;i++){wallet=walletAction({total:1000000},wallet,{type:'draw'},DAY);if(CULTURE_CARDS.find(c=>c.id===wallet.item).foil)foils++;}
 assert.equal(foils,6);assert.equal(unlockedPrefixes(wallet).length,3);
 const fresh=emptyWallet('p',0);assert.throws(()=>walletAction({total:1000000},fresh,{type:'equip',slot:'prefix',id:'snacks'},DAY),/not-owned/);
 assert.throws(()=>walletAction({total:1000000},fresh,{type:'equip',slot:'theme',id:'theme-cafe'},DAY),/not-owned/);
});
test('a weekend pass covers Saturday and Sunday, with no weekday play permission',()=>{
 assert(isWeekend(DAY));assert(isWeekend(DAY+1));assert(!isWeekend(DAY+2));assert.equal(weekendKey(DAY),weekendKey(DAY+1));assert.equal(weekendKey(DAY-1),DAY);
});
test('all private topic pools support ten distinct synchronized questions',()=>{
 for(const topic of Object.keys(ROOM_POOLS)){const run=newSession({id:'r',uid:'p',kind:'room',seed:19,topic,room:'r'},NOW,NOW);assert.equal(new Set(Array.from({length:10},(_,index)=>sessionQid(run,index))).size,10);}
 let run=newSession({id:'r',uid:'p',kind:'room',seed:19,topic:'sport',room:'r'},NOW,NOW);
 run=sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+500);
 assert.throws(()=>sessionAct(run,{type:'next'},NOW+1000),/room-wait/);
 run=sessionAct(run,{type:'next'},NOW+ROOM_INTERVAL);assert.equal(run.questionAt,NOW+ROOM_INTERVAL);assert.equal(run.index,1);
});
test('removed paid mode and ticket cannot be started or purchased',()=>{
 assert.throws(()=>newSession({id:'removed',uid:'p',kind:'assisted',seed:DAY},NOW),/invalid-session/);
 assert.throws(()=>walletAction({total:1000000},emptyWallet('p',0),{type:'swap'},DAY),/invalid-item/);
});
test('room entry bounds, eight-character codes and fair shared fee',()=>{
 for(const n of [2,3,4])assert.equal(roomFeeShare(n)*n,30000);
 assert.throws(()=>roomFeeShare(5),/room-size/);
 assert.equal(roomEntry(1000),1000);assert.equal(roomEntry(500000),500000);
 for(const n of [0,999,500001,1000.5])assert.throws(()=>roomEntry(n),/invalid-entry/);
 assert.match(roomCode(),/^[A-HJ-NP-Z2-9]{8}$/);
});
test('all submitted rooms can settle immediately; disconnected rooms retain a grace period',()=>{
 const room={status:'playing',startedAt:NOW,players:['a','b'],scores:{a:{finished:true},b:{finished:false}}};
 assert(!roomCanFinish(room,NOW+1000));room.scores.b.finished=true;assert(roomCanFinish(room,NOW+1000));
 room.scores.b.finished=false;assert(!roomCanFinish(room,NOW+304999));assert(roomCanFinish(room,NOW+305000));
});
test('room explanations wait for the shared deadline or all submissions, including early departure',()=>{
 const room={id:'r',status:'playing',players:['a','b'],scores:{a:{finished:true},b:{finished:false}}};
 let run=newSession({id:'r',uid:'a',kind:'room',seed:19,room:'r'},NOW,NOW);
 run=sessionFinish(sessionAct(run,{type:'walk'},NOW+1000),NOW+1000);
 assert(!sessionReviewReady(run,room,NOW+24999));assert(sessionReviewReady(run,room,NOW+25000));
 room.scores.b.finished=true;assert(sessionReviewReady(run,room,NOW+1000));
 assert(!sessionReviewReady(run,{...room,id:'another'},NOW+1000));
 assert(!sessionReviewReady({...run,phase:'reveal'},room,NOW+25000));
 assert(sessionReviewReady({...run,kind:'weekend'},null,NOW+1000));
});
test('weekend ticket use cannot be reset by repurchasing the same weekend',()=>{
 const w=walletAction({total:1000000},emptyWallet('p',0),{type:'pass'},DAY);assert.equal(w.passUses,0);
 w.passUses=3;assert.throws(()=>walletAction({total:1000000},w,{type:'pass'},DAY),/already-owned/);
 const next=walletAction({total:1000000},w,{type:'pass'},DAY+7);assert.equal(next.passUses,0);assert.equal(next.pass,DAY+7);
});
test('a wrong extra-mode result cannot be upgraded after midnight',()=>{
 let run=newSession({id:'w',uid:'p',kind:'weekend',seed:19},NOW);
 for(let i=0;i<6;i++){run=sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+1000);run=sessionAct(run,{type:'next'},NOW+1100);}
 run=sessionAct(run,{type:'answer',choice:(sessionQuestion(run).answer+1)%4},NOW+1200);
 const done=sessionAct(run,{type:'finish'},dayEnd(DAY)+1);assert.equal(done.reason,'wrong');assert.equal(done.payout,8000);
});
test('room prize ties use score, answer time, then fixed join order',()=>{
 const room={players:['a','b','c']},sessions={a:{phase:'finished',correct:8,timeMs:10000},b:{phase:'finished',correct:9,timeMs:20000},c:{phase:'finished',correct:9,timeMs:15000}};
 assert.equal(roomWinner(room,sessions),'c');sessions.b.timeMs=15000;assert.equal(roomWinner(room,sessions),'b');sessions.b.phase='playing';assert.equal(roomWinner(room,sessions),'c');
});
test('comic icon outlines exceed the requested 2.5:1 against their plaques',async()=>{
 const {ICON_INK,ICON_PAPER}=await import('../src/hk-icons.js');
 const luminance=hex=>{const rgb=hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
 assert((luminance(ICON_PAPER)+.05)/(luminance(ICON_INK)+.05)>=2.5);
});
