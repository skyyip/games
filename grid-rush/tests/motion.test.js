import test from 'node:test';
import assert from 'node:assert/strict';
import { springStep, magneticOffset, resistedDrag, shouldDismiss } from '../src/motion.js';

test('springs arrive and settle at the target across common refresh rates', () => {
  for (const hz of [30,60,120]) {
    let position = 0, velocity = 0, maximum = 0;
    for (let frame = 0; frame < hz * 3; frame++) {
      ({position,velocity} = springStep(position,velocity,1,1/hz));
      maximum = Math.max(maximum,position);
    }
    assert.ok(Math.abs(position-1)<0.001);
    assert.ok(Math.abs(velocity)<0.001);
    assert.ok(maximum>1 && maximum<1.1, 'arrival has a small, bounded rebound');
  }
});

test('magnetic attraction is bounded, symmetric and stronger near the centre', () => {
  assert.deepEqual(magneticOffset(0,0),{x:0,y:0});
  assert.deepEqual(magneticOffset(2,0),{x:0,y:0});
  const near = magneticOffset(0.2,0);
  const far = magneticOffset(0.9,0);
  assert.ok(near.x/0.2 > far.x/0.9);
  assert.equal(magneticOffset(-0.2,0).x,-near.x);
  for (const x of [-1,-0.5,0,0.5,1]) assert.ok(Math.abs(magneticOffset(x,0.5).x)<5);
});

test('drag resistance cushions boundaries and dismissal needs distance or an intentional flick', () => {
  assert.equal(resistedDrag(0,6),0);
  assert.ok(resistedDrag(1000,6)<=6);
  assert.equal(resistedDrag(-12,6),-resistedDrag(12,6));
  assert.equal(shouldDismiss(30,400,1),false);
  assert.equal(shouldDismiss(80,400,0.1),false);
  assert.equal(shouldDismiss(101,400,0.1),true);
  assert.equal(shouldDismiss(50,400,0.8),true);
  assert.equal(shouldDismiss(-150,400,0.8),false);
});
