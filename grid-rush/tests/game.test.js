import test from 'node:test';
import assert from 'node:assert/strict';
import { GridGame } from '../src/game.js';

test('a round counts unique tiles and freezes time on the final click', () => {
  let now = 100;
  const game = new GridGame({ now: () => now });
  assert.equal(game.state, 'idle');
  assert.equal(game.elapsed, 0);
  assert.equal(game.click(0), false);

  game.start();
  now = 1100;
  assert.equal(game.elapsed, 1000);
  assert.equal(game.click(0), true);
  assert.equal(game.click(0), false);
  assert.equal(game.progress, 1);

  now = 1334.56789;
  for (let index = 1; index < 9; index += 1) game.click(index);
  assert.equal(game.state, 'completed');
  assert.equal(game.elapsed, 1234.56789);
  now = 10000;
  assert.equal(game.elapsed, 1234.56789);
  assert.equal(game.click(0), false);
});

test('all four sizes can restart and reset the timer, progress, and clicked tiles', () => {
  let now = 50;
  const game = new GridGame({ now: () => now });
  for (const size of [3, 4, 5, 6]) {
    game.reset(size);
    assert.equal(game.size, size);
    assert.equal(game.total, size === 3 ? 9 : size === 4 ? 16 : size === 5 ? 25 : 36);
    assert.equal(game.elapsed, 0);
    assert.equal(game.progress, 0);
    assert.equal(game.state, 'idle');
    game.start();
    now += 100;
    assert.equal(game.start(), false);
    assert.equal(game.click(-1), false);
    assert.equal(game.click(game.total), false);
    assert.equal(game.click(0.5), false);
    for (let index = 0; index < game.total; index += 1) game.click(index);
    assert.equal(game.state, 'completed');
    assert.equal(game.elapsed, 100);
  }
  game.reset();
  game.start();
  game.click(0);
  game.reset();
  assert.equal(game.elapsed, 0);
  assert.equal(game.progress, 0);
  assert.equal(game.state, 'idle');
  assert.throws(() => game.reset(7), RangeError);
  assert.equal(game.size, 6);
});
