import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderedGame } from '../src/game.js';

test('a shuffled numeric round accepts only the next number and stops at the final contact', () => {
  let now = 100;
  const game = new OrderedGame({ now: () => now, random: () => 0 });
  assert.equal(game.state, 'idle');
  assert.equal(game.elapsed, 0);
  assert.equal(game.next, '1');
  assert.equal(game.click(0), false);
  game.start();
  assert.deepEqual(game.tiles, ['2', '3', '4', '5', '6', '7', '8', '9', '1']);
  assert.equal(game.click(0), false);
  assert.equal(game.progress, 0);
  now = 1100;
  assert.equal(game.elapsed, 1000);
  assert.equal(game.click(8), true);
  assert.equal(game.next, '2');
  assert.equal(game.click(8), false);
  assert.equal(game.progress, 1);
  for (const label of ['2', '3', '4', '5', '6', '7', '8']) {
    assert.equal(game.click(game.tiles.indexOf(label)), true);
  }
  now = 1334.56789;
  assert.equal(game.click(game.tiles.indexOf('9')), true);
  assert.equal(game.state, 'completed');
  assert.equal(game.next, null);
  assert.equal(game.elapsed, 1234.56789);
  now = 10000;
  assert.equal(game.elapsed, 1234.56789);
  assert.equal(game.click(0), false);
});

test('all 26 letters play alphabetically in lowercase, uppercase, and mixed-case modes', () => {
  for (const mode of ['lowercase', 'uppercase', 'mixed']) {
    const game = new OrderedGame({ mode, size: 3, random: () => 0 });
    assert.equal(game.mode, mode);
    assert.equal(game.size, 6);
    assert.equal(game.total, 26);
    assert.equal(game.tiles.length, 36);
    assert.equal(game.tiles.filter(value => value === null).length, 10);
    const labels = game.tiles.filter(value => value !== null);
    assert.deepEqual(labels.map(value => value.toLowerCase()).sort(), [...'abcdefghijklmnopqrstuvwxyz']);
    if (mode === 'lowercase') assert.equal(labels.join(''), 'abcdefghijklmnopqrstuvwxyz');
    if (mode === 'uppercase') assert.equal(labels.join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (mode === 'mixed') {
      assert.ok(labels.some(value => /[A-Z]/.test(value)));
      assert.ok(labels.some(value => /[a-z]/.test(value)));
    }
    game.start();
    assert.equal(game.click(game.tiles.indexOf(null)), false);
    const wrong = game.tiles.findIndex(value => value?.toLowerCase() === 'z');
    assert.equal(game.click(wrong), false);
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      assert.equal(game.next.toLowerCase(), letter);
      const index = game.tiles.findIndex(value => value?.toLowerCase() === letter);
      assert.equal(game.click(index), true);
      assert.equal(game.click(index), false);
    }
    assert.equal(game.state, 'completed');
    assert.equal(game.progress, 26);
  }
});

test('every numeric size, reset, invalid input, and mode switch keep state predictable', () => {
  let now = 10;
  const game = new OrderedGame({ now: () => now });
  for (const size of [3, 4, 5, 6]) {
    game.reset({ size });
    assert.equal(game.recordKey, `numbers-${size}`);
    assert.equal(game.tiles.length, size ** 2);
    game.start();
    assert.equal(game.start(), false);
    for (const index of [-1, 36, 0.5, NaN]) assert.equal(game.click(index), false);
    for (let value = 1; value <= size ** 2; value += 1) {
      assert.equal(game.click(game.tiles.indexOf(String(value))), true);
    }
    assert.equal(game.state, 'completed');
  }
  game.reset({ mode: 'mixed' });
  assert.equal(game.recordKey, 'mixed');
  game.start();
  now = 200;
  assert.equal(game.elapsed, 190);
  game.click(game.tiles.indexOf(game.next));
  game.reset({ mode: 'numbers', size: 4 });
  assert.equal(game.elapsed, 0);
  assert.equal(game.progress, 0);
  assert.equal(game.next, '1');
  assert.equal(game.state, 'idle');
  assert.throws(() => game.reset({ size: 7 }), RangeError);
  assert.throws(() => game.reset({ mode: 'unknown' }), RangeError);
  assert.equal(game.mode, 'numbers');
  assert.equal(game.size, 4);
  const tiles = game.tiles;
  tiles[0] = 'changed';
  assert.equal(game.tiles[0], '1');
});
