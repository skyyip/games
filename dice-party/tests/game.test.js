import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateHand,compareKeys,DiceGame,randomDie} from '../src/game.js';
import {ShakeDetector} from '../src/motion.js';
const compare=(a,b)=>compareKeys(evaluateHand(a).key,evaluateHand(b).key);
test('every one of the 7776 five-dice outcomes belongs to the correct poker category',()=>{
  const histogram=Array(9).fill(0);
  for(let i=0;i<7776;i++){let n=i;const dice=Array.from({length:5},()=>{const d=n%6+1;n=Math.floor(n/6);return d;});histogram[evaluateHand(dice).tier]++;}
  assert.deepEqual(histogram,[0,480,3600,1800,1200,240,300,150,6]);
});
test('all eight hand categories follow the confirmed order, with straight between full house and triple',()=>{
  const hands=[[1,2,3,4,6],[2,2,1,4,6],[2,2,4,4,6],[3,3,3,1,6],[1,2,3,4,5],[2,2,2,3,3],[1,1,1,1,2],[1,1,1,1,1]];
  for(let i=0;i<hands.length;i++){assert.equal(evaluateHand(hands[i]).tier,i+1);if(i)assert.equal(compare(hands[i],hands[i-1]),1);}
});
test('user examples compare repeated group size before its face value',()=>{
  assert.equal(compare([6,6,1,2,3],[5,5,2,3,4]),1);assert.equal(compare([5,5,5,1,2],[4,4,4,3,6]),1);assert.equal(compare([3,3,3,3,1],[4,4,4,5,6]),1);
});
test('each matching hand uses its complete ordered tie-break sequence',()=>{
  const pairs=[[[6,6,6,6,6],[5,5,5,5,5]],[[3,3,3,3,6],[3,3,3,3,5]],[[3,3,3,2,2],[2,2,2,6,6]],[[3,3,3,6,6],[3,3,3,5,5]],[[2,3,4,5,6],[1,2,3,4,5]],[[3,3,3,6,2],[3,3,3,5,4]],[[6,6,4,4,1],[6,6,3,3,5]],[[6,6,4,4,3],[6,6,4,4,2]],[[6,6,5,4,1],[6,6,5,3,2]],[[6,5,4,2,1],[6,5,3,2,1]]];
  for(const [a,b] of pairs){assert.equal(compare(a,b),1);assert.equal(compare(b,a),-1);assert.equal(compare(a,[...a].reverse()),0);}
});
test('poker validates five ordinary dice and never invents a wraparound straight',()=>{
  for(const hand of [[],[1,2,3,4],[1,2,3,4,7],[1,2,3,4,NaN]])assert.throws(()=>evaluateHand(hand),RangeError);
  assert.equal(evaluateHand([5,6,1,2,3]).tier,1);
});
test('highest and lowest totals work for every count from one to five',()=>{
  for(const count of [1,2,3,4,5])for(const mode of ['high','low']){
    let now=0,roll=1;const game=new DiceGame({now:()=>now,roll:()=>roll});game.start(['A','B'],{count,mode});
    for(let i=0;i<2;i++){game.ready();game.shake();now+=2000;game.advance();game.next();roll=6;}
    assert.equal(game.state,'results');assert.equal(game.winners[0].name,mode==='high'?'B':'A');assert.ok(game.answers.every(r=>r.dice.length===count));
  }
});
test('a roll resolves once after its animation deadline and repeated shakes cannot replace it',()=>{
  let now=0,calls=0;const game=new DiceGame({now:()=>now,roll:()=>{calls++;return 4;}});game.start(['A','B'],{count:5,mode:'poker'});
  assert.equal(game.shake(),false);game.ready();assert.equal(game.shake(),true);assert.equal(calls,5);assert.equal(game.shake(),false);assert.equal(calls,5);assert.deepEqual(game.answers,[]);
  now=1519;assert.equal(game.advance(),false);now=1520;assert.equal(game.advance(),true);assert.equal(game.advance(),false);assert.equal(game.answers.length,1);assert.equal(game.answers[0].total,20);
});
test('totals and identical poker keys tie without favouring roll order',()=>{
  for(const mode of ['high','low','poker']){let now=0;const game=new DiceGame({now:()=>now,roll:()=>3});game.start(['A','B'],{count:mode==='poker'?5:2,mode});for(let i=0;i<2;i++){game.ready();game.shake();now+=2000;game.advance();game.next();}assert.equal(game.winners.length,2);}
});
test('setup validates counts/modes and resetting cancels a pending result',()=>{
  const game=new DiceGame();for(const options of [{count:0},{count:6},{count:2,mode:'poker'},{mode:'other'}])assert.throws(()=>game.start(['A','B'],options),RangeError);
  assert.throws(()=>game.start(['A']),TypeError);game.start(['A','B']);game.ready();game.shake();game.reset();assert.equal(game.advance(),false);assert.deepEqual(game.answers,[]);
});
test('ordinary random dice always return an integer face',()=>{for(let i=0;i<200;i++)assert.ok([1,2,3,4,5,6].includes(randomDie()));});
test('phone shake needs sustained motion, ignores noise, stale samples and invalid axes',()=>{
  const detector=new ShakeDetector(),e=x=>({acceleration:{x,y:0,z:0}});
  for(let t=0;t<300;t+=30)assert.equal(detector.sample(e(3),t),false);
  assert.equal(detector.sample(e(15),350),false);assert.equal(detector.sample(e(-15),410),true);
  detector.reset();assert.equal(detector.sample(e(15),0),false);assert.equal(detector.sample(e(15),300),false);assert.equal(detector.sample(e(-15),360),true);
  assert.equal(detector.sample({acceleration:{x:NaN,y:0,z:0}},400),false);
});
test('gravity-only devices calibrate rest before detecting a shake',()=>{
  const d=new ShakeDetector(),e=x=>({accelerationIncludingGravity:{x,y:0,z:9.8}});
  assert.equal(d.sample(e(0),0),false);assert.equal(d.sample(e(0),60),false);assert.equal(d.sample(e(16),120),false);assert.equal(d.sample(e(-16),180),true);
});
