import test from 'node:test';
import assert from 'node:assert/strict';
import { LineGame } from '../src/game.js';
import { SHAPES } from '../src/geometry.js';

test('players share the target and closest length wins, regardless of where the segment starts', () => {
  const game = new LineGame(() => 0.36);
  assert.equal(game.state,'setup');
  game.start(['Alice','Bob']);
  assert.equal(game.target,37);
  assert.equal(game.state,'handoff');
  assert.equal(game.beginTurn(),true);
  assert.equal(game.submit(0.1,0.5),true);
  assert.equal(game.state,'handoff');
  assert.equal(game.submit(0.2,0.57),false);
  assert.equal(game.guesses.length,1);
  game.beginTurn();
  assert.equal(game.target,37);
  game.submit(0.2,0.57);
  assert.equal(game.state,'results');
  assert.equal(game.results[0].name,'Bob');
  assert.ok(game.results[0].error<1e-9);
  assert.deepEqual(game.winners.map(result=>result.name),['Bob']);
});

test('targets include 1% and 100%, reverse selections work, and equal errors share the win', () => {
  for (const [random,target] of [[0,1],[0.999999,100]]) {
    const game = new LineGame(()=>random);game.start(['A','B']);assert.equal(game.target,target);
  }
  const game = new LineGame(()=>0.36);game.start(['A','B']);
  game.beginTurn();game.submit(0.1,0.5); // 40%, three points too long
  assert.deepEqual(game.results,[],'guesses are not revealed during another player’s turn');
  game.beginTurn();game.submit(0.65,0.31); // 34%, three points too short
  assert.deepEqual(game.winners.map(result=>result.name),['A','B']);
  assert.deepEqual(game.results.map(result=>result.name),['A','B']);
  assert.ok(Math.abs(game.results[1].percent-34)<1e-9);
});

test('invalid and repeated submissions cannot consume turns; reset and six-player rounds are safe', () => {
  const game = new LineGame(()=>0.49);
  assert.equal(game.beginTurn(),false);assert.equal(game.submit(0,1),false);
  assert.throws(()=>game.start(['Only one']));
  assert.throws(()=>game.start(Array(7).fill('Too many')));
  game.start(['  ','<img src=x>','C','D','E','F']);
  assert.equal(game.players[0],'Player 1');assert.equal(game.players[1],'<img src=x>');
  game.beginTurn();
  for (const [a,b] of [[0,0],[-.1,.5],[0,1.1],[NaN,.5],[0,Infinity]]) assert.equal(game.submit(a,b),false);
  assert.equal(game.turn,0);
  for(let i=0;i<6;i++){
    if(i)game.beginTurn();
    assert.equal(game.submit(0,.1+i*.1),true);
    assert.equal(game.submit(0,.8),false);
  }
  assert.equal(game.results.length,6);assert.equal(game.winners[0].name,'E');
  game.reset();assert.equal(game.state,'setup');assert.equal(game.target,null);assert.deepEqual(game.guesses,[]);
  game.start(['Again','Next']);assert.equal(game.target,50);assert.equal(game.guesses.length,0);
});

test('one random shape is shared for the whole round and a new round generates a new line', () => {
  const game=new LineGame(()=>.36);game.start(['A','B']);
  assert.equal(game.line.kind,SHAPES[Math.floor(.36*SHAPES.length)]);const line=game.line;
  game.beginTurn();game.submit(.2,.5);assert.equal(game.line,line);
  game.beginTurn();game.submit(.1,.7);assert.equal(game.line,line);
  game.start(['A','B']);assert.notEqual(game.line,line);
  game.reset();assert.equal(game.line,null);
});

test('closed shapes score the chosen arc and allow the whole outline without consuming invalid turns', () => {
  let draw=0;
  const game=new LineGame(()=>draw++===0?.19:(SHAPES.indexOf('circle')+.1)/SHAPES.length); // Target 20%, circle.
  game.start(['A','B']);assert.equal(game.line.kind,'circle');
  game.beginTurn();assert.equal(game.submit(0,1,true),false);
  assert.equal(game.submit(.1,.9,true),true);
  assert.ok(Math.abs(game.guesses[0].percent-20)<1e-9);
  assert.equal(game.guesses[0].otherSide,true);
  assert.equal(game.submit(.1,.9,true),false);
  game.beginTurn();assert.equal(game.submit(.4,.4,true),true);
  assert.equal(game.guesses[1].percent,100);
  assert.equal(game.winners[0].name,'A');
});
