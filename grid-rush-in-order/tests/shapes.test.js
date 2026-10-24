import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderedGame, GRID_SIZES } from '../src/game.js';
import { SHAPE_PALETTE, tileShape } from '../src/shapes.js';
import { readLeaderboard, saveLeaderboard, addResult } from '../src/leaderboard.js';

const expectedShapes = ['circle', 'ellipse', 'equilateral-triangle', 'right-triangle', 'isosceles-triangle',
  'square', 'rectangle', 'rhombus', 'trapezoid', 'parallelogram', 'pentagon', 'hexagon', 'octagon',
  'heart', 'star', 'crescent', 'arrow', 'cross'];
function seededRandom() {
  let seed = 1977;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('shape rounds can select all 18 requested shapes, with four distinct groups and varied keys', () => {
  assert.deepEqual(SHAPE_PALETTE.map(shape => shape.id), expectedShapes);
  const seen = new Set(), orders = new Set(), random = seededRandom();
  for (let round = 0; round < 200; round++) {
    const game = new OrderedGame({ mode: 'shapes', random });
    assert.equal(game.shapeOrder.length, 4);
    assert.equal(new Set(game.shapeOrder.map(shape => shape.id)).size, 4);
    const counts = game.shapeOrder.map(shape => game.tiles.filter(value => tileShape(value).id === shape.id).length);
    assert.ok(counts.every(count => count === 2 || count === 3));
    for (const shape of game.shapeOrder) seen.add(shape.id);
    orders.add(game.shapeOrder.map(shape => shape.id).join(','));
  }
  assert.deepEqual([...seen].sort(), [...expectedShapes].sort());
  assert.ok(orders.size > 100);
});

test('every grid clears shapes by the displayed group order, ignores duplicates and freezes exact time', () => {
  for (const size of GRID_SIZES) {
    let now = 100;
    const game = new OrderedGame({ mode: 'shapes', size, order: 'descending', random: () => 0, now: () => now });
    const preview = game.shapeOrder;
    assert.equal(game.order, 'ascending');
    assert.equal(game.recordKey, `shapes-${size}`);
    assert.equal(new Set(game.tiles).size, size ** 2);
    assert.equal(game.click(0), false);
    const copy = game.shapeOrder; copy.reverse();
    assert.deepEqual(game.shapeOrder, preview);
    game.start();
    assert.deepEqual(game.shapeOrder, preview, 'starting shuffles cells but preserves the previewed key');
    now += 40;
    assert.equal(game.click(game.tiles.findIndex(value => tileShape(value).id === preview[1].id)), false);
    assert.equal(game.progress, 0);
    for (const shape of preview) {
      const indices = game.tiles.flatMap((value, index) => tileShape(value).id === shape.id ? [index] : []).reverse();
      for (const index of indices) {
        assert.equal(tileShape(game.next).id, shape.id);
        now += 25;
        assert.equal(game.click(index), true);
        assert.equal(game.click(index), false);
      }
    }
    assert.equal(game.state, 'completed');
    assert.equal(game.next, null);
    assert.equal(game.progress, size ** 2);
    assert.equal(game.elapsed, 40 + size ** 2 * 25);
    now += 10000;
    assert.equal(game.elapsed, 40 + size ** 2 * 25);
    game.reset();
    assert.equal(game.progress, 0);assert.equal(game.elapsed, 0);assert.equal(game.state, 'idle');
    game.reset({ mode: 'colors' });
    assert.deepEqual(game.shapeOrder, []);assert.equal(game.colorOrder.length, 4);
    game.reset({ mode: 'numbers' });
    assert.deepEqual(game.colorOrder, []);assert.equal(game.next, '1');
  }
});

test('shape leaderboards are independent by grid size and preserve existing and legacy scores', () => {
  const date = '2026-10-24T08:00:00.000Z';
  const legacy = { 'numbers-3': [{ time: 123.456, date }], 'colors-3': [{ time: 987.654, date }],
    alphanumeric: [{ time: 62000, date }] };
  let records = readLeaderboard({ getItem: () => JSON.stringify(legacy) }).records;
  for (const size of GRID_SIZES) {
    for (const time of [4000.123, 2000, 3000, 1000, 9000]) records = addResult(records, `shapes-${size}`, time, date).records;
    assert.deepEqual(records[`shapes-${size}`].map(record => record.time), [1000, 2000, 3000]);
    assert.equal(records[`shapes-${size}-descending`], undefined);
  }
  let saved;
  const storage = { setItem: (_, value) => { saved = value; }, getItem: () => saved };
  assert.equal(saveLeaderboard(storage, records), true);
  assert.deepEqual(readLeaderboard(storage).records, records);
  for (const [key, values] of Object.entries(legacy)) assert.deepEqual(records[key], values);
});
