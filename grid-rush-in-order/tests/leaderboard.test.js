import test from 'node:test';
import assert from 'node:assert/strict';
import { addResult, readLeaderboard, saveLeaderboard, STORAGE_KEY } from '../src/leaderboard.js';

const empty = () => Object.fromEntries(['numbers-3', 'numbers-4', 'numbers-5', 'numbers-6', 'lowercase', 'uppercase', 'mixed'].map(key => [key, []]));

const date = '2026-10-20T08:00:00.000Z';

test('each mode and numeric grid keeps its fastest three full-precision records and ranks new results', () => {
  let records = readLeaderboard(null).records;
  const first = addResult(records, 'numbers-3', 2345.678901, date);
  assert.equal(first.personalBest, true);
  assert.equal(first.rank, 1);
  records = first.records;
  for (const time of [3000, 1000, 2000]) records = addResult(records, 'numbers-3', time, date).records;
  assert.deepEqual(records['numbers-3'].map(record => record.time), [1000, 2000, 2345.678901]);
  const slower = addResult(records, 'numbers-3', 9000, date);
  assert.equal(slower.rank, null);
  assert.equal(slower.personalBest, false);
  assert.deepEqual(slower.records['numbers-3'], records['numbers-3']);
  const tied = addResult(records, 'numbers-3', 1000, date);
  assert.equal(tied.personalBest, false);
  assert.equal(tied.rank, 2);
  const otherGrid = addResult(records, 'mixed', 12345.6789, date);
  assert.equal(otherGrid.records.mixed[0].time, 12345.6789);
  assert.deepEqual(otherGrid.records['numbers-3'], records['numbers-3']);
});

test('corrupted, malformed, and unavailable storage are handled safely', () => {
  for (const value of ['{broken', 'null', '[]', '42', '"text"']) {
    const loaded = readLeaderboard({ getItem: () => value });
    assert.deepEqual(loaded.records, empty());
  }
  const loaded = readLeaderboard({ getItem: () => JSON.stringify({
    'numbers-3': [null, { time: -1, date }, { time: '123', date }, { time: 100, date: 'bad' },
      { time: 500, date }, { time: 200, date }, { time: 400, date }, { time: 300, date }],
    'numbers-4': { time: 10, date },
    7: [{ time: 1, date }],
  }) });
  assert.deepEqual(loaded.records['numbers-3'].map(record => record.time), [200, 300, 400]);
  assert.deepEqual(loaded.records['numbers-4'], []);
  assert.equal(loaded.records[7], undefined);
  const denied = {
    getItem() { throw new Error('Storage denied'); },
    setItem() { throw new Error('Quota exceeded'); },
  };
  assert.equal(readLeaderboard(denied).available, false);
  assert.equal(saveLeaderboard(denied, loaded.records), false);
  assert.equal(saveLeaderboard(null, loaded.records), false);
  assert.throws(() => addResult(loaded.records, 7, 100, date), RangeError);
  assert.throws(() => addResult(loaded.records, 'numbers-3', Infinity, date), RangeError);
  assert.throws(() => addResult(loaded.records, 'numbers-3', 10, 'bad date'), RangeError);
});

test('records survive saving and reading from browser storage', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const records = addResult(readLeaderboard(storage).records, 'numbers-4', 3456.7890123, date).records;
  assert.equal(saveLeaderboard(storage, records), true);
  assert.ok(values.has(STORAGE_KEY));
  const reloaded = readLeaderboard(storage);
  assert.equal(reloaded.available, true);
  assert.deepEqual(reloaded.records['numbers-4'], [{ time: 3456.7890123, date }]);
});
