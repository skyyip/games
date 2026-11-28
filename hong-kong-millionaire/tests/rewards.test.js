import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyWallet,walletBalance,walletAction,drawnCard,CULTURE_CARDS,FOIL_CARDS,unlockedPrefixes,weekendKey,isWeekend,DRAW_PRICE,GOLD_PRICE,DRAW_SLOTS,SERIES,WEEKEND_PASS_PRICE,WEEKEND_LIMIT,RETRY_PRICE,retryPrice,retryDiscount} from '../src/economy.js';
import {newSession,sessionQid,sessionQuestion,sessionAct,sessionFinish,sessionReviewReady,ROOM_POOLS,roomWinner,ROOM_INTERVAL,roomFeeShare,roomCanFinish,roomCode,roomEntry} from '../src/session-engine.js';
import {hkDay,dayEnd,questionId} from '../src/game.js';
const NOW=Date.UTC(2026,10,14,4),DAY=hkDay(NOW);
test('normal cultural draws cost 10000 and enforce sufficient balance',()=>{
 assert.equal(DRAW_PRICE,10000);const wallet=emptyWallet('p',0);assert.throws(()=>walletAction({total:9999},wallet,{type:'draw'},DAY),/insufficient-balance/);assert.equal(wallet.spent,0);assert.equal(wallet.draws,0);assert.equal(walletAction({total:10000},wallet,{type:'draw'},DAY).spent,10000);
});
test('purchases spend an available balance without reducing career prize totals',()=>{
 const profile={total:1000000},old=emptyWallet('p',0),next=walletAction(profile,old,{type:'buy',id:'frame-rwb'},DAY);
 assert.equal(profile.total,1000000);assert.equal(next.spent,20000);assert.equal(walletBalance(profile,next),980000);assert.deepEqual(old.owned,[]);
 assert.throws(()=>walletAction(profile,next,{type:'buy',id:'frame-rwb'},DAY),/already-owned/);
 assert.throws(()=>walletAction({total:0},old,{type:'gold'},DAY),/insufficient-balance/);
});
test('draws are replay-stable and every gold draw is a foil',()=>{
 const profile={total:FOIL_CARDS.length*GOLD_PRICE};let wallet=emptyWallet('p',1001);const foils=new Set();
 for(let i=0;i<FOIL_CARDS.length;i++){const expected=drawnCard(wallet,true);assert.equal(drawnCard({...wallet},true),expected);wallet=walletAction(profile,wallet,{type:'gold'},DAY);foils.add(wallet.item);assert(CULTURE_CARDS.find(c=>c.id===wallet.item).foil);}
 assert.equal(foils.size,FOIL_CARDS.length);assert.equal(wallet.draws,FOIL_CARDS.length);assert.equal(wallet.spent,FOIL_CARDS.length*GOLD_PRICE);
});
test('normal draw distribution and set prefixes do not grant answer advantages',()=>{
 let wallet=emptyWallet('p',0),foils=0;for(let i=0;i<DRAW_SLOTS;i++){wallet=walletAction({total:100000000},wallet,{type:'draw'},DAY);if(CULTURE_CARDS.find(c=>c.id===wallet.item).foil)foils++;}
 assert.equal(foils,FOIL_CARDS.length);assert.equal(unlockedPrefixes(wallet).length,SERIES.length);
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
 room.scores.b.finished=false;assert(!roomCanFinish(room,NOW+354999));assert(roomCanFinish(room,NOW+355000));
});
test('room explanations wait for the shared deadline or all submissions, including early departure',()=>{
 const room={id:'r',status:'playing',players:['a','b'],scores:{a:{finished:true},b:{finished:false}}};
 let run=newSession({id:'r',uid:'a',kind:'room',seed:19,room:'r'},NOW,NOW);
 run=sessionFinish(sessionAct(run,{type:'walk'},NOW+1000),NOW+1000);
 assert(!sessionReviewReady(run,room,NOW+29999));assert(sessionReviewReady(run,room,NOW+30000));
 room.scores.b.finished=true;assert(sessionReviewReady(run,room,NOW+1000));
 assert(!sessionReviewReady(run,{...room,id:'another'},NOW+1000));
 assert(!sessionReviewReady({...run,phase:'reveal'},room,NOW+30000));
 assert(sessionReviewReady({...run,kind:'weekend'},null,NOW+1000));
});
test('weekend ticket use cannot be reset by repurchasing the same weekend',()=>{
 const w=walletAction({total:1000000},emptyWallet('p',0),{type:'pass'},DAY);assert.equal(w.passUses,0);
 w.passUses=WEEKEND_LIMIT;assert.throws(()=>walletAction({total:1000000},w,{type:'pass'},DAY),/already-owned/);
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

test('new prices and daily retry purchase preserve existing ticket and profile state',()=>{
 const p={total:1000000},old=emptyWallet('a',0),day=hkDay(NOW);
 assert.equal(walletAction(p,old,{type:'draw'},day).spent,DRAW_PRICE);assert.equal(walletAction(p,old,{type:'gold'},day).spent,GOLD_PRICE);
 assert.equal(walletAction(p,old,{type:'pass'},day).spent,WEEKEND_PASS_PRICE);assert.equal(WEEKEND_LIMIT,5);
 const bought=walletAction(p,old,{type:'retry-ticket'},day);assert.equal(bought.spent,retryPrice(day));assert.equal(bought.retryBoughtDay,day);
 assert.throws(()=>walletAction(p,bought,{type:'retry-ticket'},day),/retry-bought/);assert.equal(walletAction(p,bought,{type:'retry-ticket'},day+1).retryBoughtDay,day+1);
 assert.throws(()=>walletAction({total:retryPrice(day)-1},old,{type:'retry-ticket'},day),/insufficient-balance/);assert.equal(p.total,1000000);
});
test('retry draws fifteen unique questions excluding today’s pure daily bank, across all tiers',()=>{
 for(let day=DAY;day<DAY+365;day++)for(const seed of [0,1,7,999999999]){
  const r=newSession({id:'retry',uid:'p',kind:'retry',seed},day*86400000+1000),daily=new Set(Array.from({length:15},(_,i)=>questionId(day,i))),ids=Array.from({length:15},(_,i)=>sessionQid(r,i));
  assert.equal(new Set(ids).size,15);assert(ids.every(id=>!daily.has(id)));
 }
 let r=newSession({id:'retry',uid:'p',kind:'retry',seed:16},NOW);
 for(let i=0;i<15;i++){r=sessionAct(r,{type:'answer',choice:sessionQuestion(r).answer},NOW+1000+i*100);if(i<14)r=sessionAct(r,{type:'next'},NOW+1050+i*100);}
 assert.equal(sessionFinish(r,NOW+3000).payout,1000000);
});

test('daily offers are shared, bounded and reject stale or forged confirmation prices',()=>{
 const rates=new Set();for(let d=DAY;d<DAY+365;d++){const rate=retryDiscount(d);rates.add(rate);assert(Number.isInteger(rate)&&rate>=5&&rate<=9);assert.equal(retryPrice(d),RETRY_PRICE/10*rate);assert.equal(retryPrice(d),retryPrice(d));}
 assert.equal(rates.size,5);
 const old=emptyWallet('offer',0),profile={total:1000000};
 assert.throws(()=>walletAction(profile,old,{type:'retry-ticket',day:DAY-1,price:retryPrice(DAY-1)},DAY),/quote-expired/);
 assert.throws(()=>walletAction(profile,old,{type:'retry-ticket',day:DAY,price:1},DAY),/quote-expired/);
 assert.equal(walletAction(profile,old,{type:'retry-ticket',day:DAY,price:retryPrice(DAY)},DAY).spent,retryPrice(DAY));
});

test('every card in a series is required for its prefix, including all expansion foils',()=>{
 assert.equal(CULTURE_CARDS.length,160);assert.equal(SERIES.length,8);
 for(const series of SERIES){
  const cards=CULTURE_CARDS.filter(c=>c.series===series.id);assert.equal(cards.length,20);
  const complete={...emptyWallet('p',0),cards:Object.fromEntries(cards.map(c=>[c.id,1]))};
  for(const missing of cards){
   const wallet={...complete,cards:{...complete.cards,[missing.id]:0}};
   assert(!unlockedPrefixes(wallet).some(s=>s.id===series.id),missing.id);
   assert.throws(()=>walletAction({total:0},wallet,{type:'equip',slot:'prefix',id:series.id},DAY),/not-owned/,missing.id);
  }
  assert(unlockedPrefixes(complete).some(s=>s.id===series.id));assert.equal(walletAction({total:0},complete,{type:'equip',slot:'prefix',id:series.id},DAY).prefix,series.id);
  const six={...complete,cards:Object.fromEntries(cards.slice(0,6).map(c=>[c.id,9]))};assert(!unlockedPrefixes(six).some(s=>s.id===series.id));
  assert.equal(walletAction({total:0},{...six,prefix:series.id},{type:'equip',slot:'prefix',id:''},DAY).prefix,'');
 }
});
