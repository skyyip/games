import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderedGame, tileColor } from '../src/game.js';

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

test('descending rounds reverse numeric and alphabet order without counting wrong or repeated tiles', () => {
  const game = new OrderedGame({ size: 3, order: 'descending' });
  assert.equal(game.order, 'descending');
  assert.equal(game.recordKey, 'numbers-3-descending');
  assert.equal(game.next, '9');
  game.start();
  assert.equal(game.click(game.tiles.indexOf('1')), false);
  for (const value of ['9', '8', '7', '6', '5', '4', '3', '2', '1']) {
    assert.equal(game.next, value);
    const index = game.tiles.indexOf(value);
    assert.equal(game.click(index), true);
    assert.equal(game.click(index), false);
  }
  assert.equal(game.state, 'completed');
  for (const mode of ['lowercase', 'uppercase', 'mixed']) {
    game.reset({ mode });
    assert.equal(game.order, 'descending');
    assert.equal(game.next.toLowerCase(), 'z');
    game.start();
    for (const letter of 'zyxwvutsrqponmlkjihgfedcba') {
      assert.equal(game.next.toLowerCase(), letter);
      assert.equal(game.click(game.tiles.indexOf(game.next)), true);
    }
    assert.equal(game.state, 'completed');
  }
  assert.throws(() => game.reset({ order: 'invalid' }), RangeError);
  game.reset({ mode: 'numbers', size: 4, order: 'ascending' });
  assert.equal(game.recordKey, 'numbers-4');
  assert.equal(game.next, '1');
});

test('letters and numbers share 26 positions and accept the user example in either direction', () => {
  const sequence = ['1', 'b', '3', '4', 'e', 'F', '7', ...Array.from({ length: 19 }, (_, index) => String(index + 8))];
  for (const order of ['ascending', 'descending']) {
    let draw = 0;
    const game = new OrderedGame({ mode: 'alphanumeric', order,
      random: () => [0.1, 0.5, 0.1, 0.1, 0.5, 0.9, 0.1][draw++] ?? 0.1 });
    assert.equal(game.size, 6);
    assert.equal(game.total, 26);
    assert.equal(game.tiles.length, 36);
    assert.equal(game.tiles.filter(value => value === null).length, 10);
    assert.equal(new Set(game.tiles.filter(value => value !== null)).size, 26);
    assert.equal(game.recordKey, order === 'ascending' ? 'alphanumeric-26' : 'alphanumeric-26-descending');
    const expected = order === 'ascending' ? sequence : [...sequence].reverse();
    assert.deepEqual(game.tiles.filter(value => value !== null), expected);
    game.start();
    assert.equal(game.click(game.tiles.indexOf(expected[1])), false);
    for (const value of expected) {
      assert.equal(game.next, value);
      const index = game.tiles.indexOf(value);
      assert.equal(game.click(index), true);
      assert.equal(game.click(index), false);
    }
    assert.equal(game.state, 'completed');
    draw = 0;
    game.reset();
    assert.equal(game.size, 6);
    assert.equal(game.total, 26);
    assert.equal(game.progress, 0);
    assert.equal(game.elapsed, 0);
    assert.equal(game.next, expected[0]);
    game.reset({ mode: 'numbers', size: 3 });
    assert.equal(game.size, 3);
    assert.equal(game.total, 9);
  }
});

test('every mixed-symbol round contains numbers and both cases, one form per rank from 1 to 26', () => {
  for (const random of [() => 0, () => 0.5, () => 0.99, Math.random]) {
    const game = new OrderedGame({ mode: 'alphanumeric', size: 6, random });
    const labels = game.tiles.filter(value => value !== null);
    assert.ok(labels.some(value => /^\d+$/.test(value)));
    assert.ok(labels.some(value => /^[A-Z]$/.test(value)));
    assert.ok(labels.some(value => /^[a-z]$/.test(value)));
    assert.deepEqual(labels.map(value => /^\d+$/.test(value) ? Number(value) : value.toLowerCase().charCodeAt(0) - 96),
      Array.from({ length: 26 }, (_, index) => index + 1));
    assert.throws(() => game.reset({ size: 8 }), RangeError);
  }
});

test('colour rounds generate a random key and accept each colour group in any tile order, once only', () => {
  let now = 10;
  const game = new OrderedGame({ mode: 'colors', size: 3, random: () => 0, now: () => now });
  const other = new OrderedGame({ mode: 'colors', random: () => 0.99 });
  assert.equal(game.total, 9);
  assert.equal(game.size, 3);
  assert.equal(game.recordKey, 'colors-3');
  assert.equal(game.colorOrder.length, 4);
  assert.equal(new Set(game.colorOrder.map(color => color.id)).size, 4);
  assert.notDeepEqual(game.colorOrder, other.colorOrder);
  game.start();
  const first = game.colorOrder[0].id;
  const wrong = game.tiles.findIndex(value => tileColor(value).id !== first);
  assert.equal(game.click(wrong), false);
  assert.equal(game.progress, 0);
  for (const color of game.colorOrder) {
    const positions = game.tiles.map((value, index) => tileColor(value).id === color.id ? index : -1)
      .filter(index => index !== -1).reverse();
    assert.ok(positions.length > 0);
    for (const index of positions) {
      assert.equal(tileColor(game.next).id, color.id);
      now += 50;
      assert.equal(game.click(index), true);
      assert.equal(game.click(index), false);
    }
  }
  assert.equal(game.state, 'completed');
  assert.equal(game.progress, 9);
  now = 1000;
  assert.equal(game.elapsed, 450);
  game.reset({ size: 6, order: 'descending' });
  assert.equal(game.total, 36);
  assert.equal(game.order, 'ascending');
  assert.equal(game.recordKey, 'colors-6');
  assert.equal(game.progress, 0);
});
