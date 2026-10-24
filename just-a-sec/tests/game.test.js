import test from 'node:test';
import assert from 'node:assert/strict';
import {TimeGame} from '../src/game.js';
const round=(target=8)=>{let time=100;const game=new TimeGame({random:()=>((target-1)+.1)/20,now:()=>time});return {game,set:next=>{time=next;}};};

test('targets include every whole second from 1 through 20 and stay shared across all players',()=>{
  for(let target=1;target<=20;target++){
    const {game,set}=round(target);game.start(['A','B']);assert.equal(game.target,target);
    for(const time of [200,400]){assert.equal(game.ready(),true);assert.equal(game.press(1),true);set(time);assert.equal(game.release(1),true);assert.equal(game.target,target);game.next();}
    assert.equal(game.state,'results');assert.equal(game.results.length,2);
  }
});
test('only 2–6 names are accepted; defaults, limits, literal names and reset are safe',()=>{
  const {game}=round();
  for(const names of [[],['A'],Array(7).fill('A'),['A',null],undefined])assert.throws(()=>game.start(names),TypeError);
  game.start(['  ','<b>Sky</b>',...Array(4).fill('long name '.repeat(10))]);
  assert.equal(game.players[0],'Player 1');assert.equal(game.players[1],'<b>Sky</b>');assert.equal(game.players[5].length,24);
  game.reset();assert.equal(game.state,'setup');assert.equal(game.target,null);assert.equal(game.input,null);assert.deepEqual(game.guesses,[]);
});
test('only matching releases finish a hold; repeats and other inputs cannot steal or duplicate a turn',()=>{
  const {game,set}=round();game.start(['A','B']);assert.equal(game.press(1),false);assert.equal(game.release(1),false);
  game.ready();assert.equal(game.press('pointer:1'),true);assert.equal(game.press('pointer:2'),false);set(2345.6);
  assert.equal(game.release('pointer:2'),false);assert.equal(game.state,'holding');assert.equal(game.release('pointer:1'),true);
  assert.equal(game.guesses[0].elapsed,2246);assert.equal(game.release('pointer:1'),false);assert.equal(game.guesses.length,1);
});
test('timing starts on press, not on readiness, and stays hidden through every handoff',()=>{
  const {game,set}=round();game.start(['A','B']);game.ready();set(80000);game.press('key:Space');set(88123.4);game.release('key:Space');
  assert.equal(game.guesses[0].elapsed,8123);assert.deepEqual(game.results,[]);assert.deepEqual(game.winners,[]);
  assert.equal(game.state,'locked');game.next();assert.equal(game.state,'handoff');assert.equal(game.turn,1);assert.deepEqual(game.results,[]);
});
test('cancellation discards the hold and allows a fresh attempt without consuming a player',()=>{
  const {game,set}=round();game.start(['A','B']);game.ready();game.press(1);set(3000);assert.equal(game.cancel(),true);
  assert.equal(game.state,'ready');assert.equal(game.turn,0);assert.deepEqual(game.guesses,[]);assert.equal(game.release(1),false);
  game.press(2);set(11000);game.release(2);assert.equal(game.guesses[0].elapsed,8000);assert.equal(game.cancel(),false);
});
test('all six players complete once; smallest absolute error wins and ties keep player order',()=>{
  const {game,set}=round();game.start(['A','B','C','D','E','F']);let now=100;
  for(const duration of [6000,7900,8100,9000,8200,12000]){
    assert.equal(game.next(),false);game.ready();game.press(1);now+=duration;set(now);game.release(1);game.next();
  }
  assert.equal(game.state,'results');assert.deepEqual(game.winners.map(r=>r.name),['B','C']);
  assert.deepEqual(game.results.map(r=>r.error),[100,100,200,1000,2000,4000]);assert.equal(game.ready(),false);
  game.start(['Again','Next']);assert.equal(game.state,'handoff');assert.equal(game.turn,0);assert.deepEqual(game.guesses,[]);
});
test('an immediate release is a valid zero-duration guess; a long hold has no artificial cutoff',()=>{
  const {game,set}=round(1);game.start(['A','B']);game.ready();game.press(1);game.release(1);assert.equal(game.guesses[0].elapsed,0);game.next();
  game.ready();game.press(1);set(90100);assert.equal(game.state,'holding');game.release(1);assert.equal(game.guesses[1].elapsed,90000);
  game.next();assert.deepEqual(game.winners.map(r=>r.name),['A']);
});
