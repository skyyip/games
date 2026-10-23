import test from 'node:test';
import assert from 'node:assert/strict';
import { FlingGame } from '../src/game.js';

test('a round ends at the final arrival, never at launch, and each Pikmin is counted once', () => {
  let now=1000;
  const game=new FlingGame({count:20,now:()=>now});
  assert.equal(game.launch(0),false);
  assert.equal(game.elapsed,0);
  assert.equal(game.start(),true);
  assert.equal(game.start(),false);
  now=1500;
  for(let id=0;id<20;id++) {
    assert.equal(game.launch(id),true);
    assert.equal(game.launch(id),false);
  }
  assert.equal(game.state,'playing');
  assert.equal(game.remaining,20);
  now=1800;
  for(let id=0;id<19;id++)assert.equal(game.arrive(id),true);
  assert.equal(game.arrive(0),false);
  assert.equal(game.progress,19);
  assert.equal(game.elapsed,800);
  now=1934.56789;
  assert.equal(game.arrive(19),true);
  assert.equal(game.state,'completed');
  assert.equal(game.remaining,0);
  now=9000;
  assert.equal(game.elapsed,934.56789);
  assert.equal(game.arrive(19),false);
});

test('all three counts reset the clock and units, and invalid or stale arrivals do not count', () => {
  let now=0;
  const game=new FlingGame({now:()=>now});
  for(const count of [20,30,40]) {
    game.reset(count);assert.equal(game.count,count);assert.equal(game.progress,0);
    assert.equal(game.elapsed,0);assert.equal(game.state,'idle');
    now+=100;game.start();now+=123.456;
    for(const id of [-1,count,NaN,1.5,'0']) {
      assert.equal(game.launch(id),false);assert.equal(game.arrive(id),false);
    }
    assert.equal(game.arrive(0),false);
    assert.equal(game.launch(0),true);assert.equal(game.progress,0);
    game.reset(count);now+=1000;
    assert.equal(game.arrive(0),false);assert.equal(game.elapsed,0);
    game.start();assert.equal(game.arrive(0),false);assert.equal(game.remaining,count);
  }
  assert.throws(()=>game.reset(21),RangeError);
});
