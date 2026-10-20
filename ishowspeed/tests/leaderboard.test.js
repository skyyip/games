import test from 'node:test';
import assert from 'node:assert/strict';
import { addResult, readLeaderboard, saveLeaderboard, STORAGE_KEY } from '../src/leaderboard.js';

const date = '2026-10-20T08:00:00.000Z';

test('each grid keeps its fastest three full-precision records and ranks new results', () => {
  let records = readLeaderboard(null).records;
  const first = addResult(records, 3, 2345.678901, date);
  assert.equal(first.personalBest, true);
  assert.equal(first.rank, 1);
  records = first.records;
  for (const time of [3000, 1000, 2000]) records = addResult(records, 3, time, date).records;
  assert.deepEqual(records[3].map(record => record.time), [1000, 2000, 2345.678901]);
  const slower = addResult(records, 3, 9000, date);
  assert.equal(slower.rank, null);
  assert.equal(slower.personalBest, false);
  assert.deepEqual(slower.records[3], records[3]);
  const tied = addResult(records, 3, 1000, date);
  assert.equal(tied.personalBest, false);
  assert.equal(tied.rank, 2);
  const otherGrid = addResult(records, 6, 12345.6789, date);
  assert.equal(otherGrid.records[6][0].time, 12345.6789);
  assert.deepEqual(otherGrid.records[3], records[3]);
});

test('corrupted, malformed, and unavailable storage are handled safely', () => {
  for (const value of ['{broken', 'null', '[]', '42', '"text"']) {
    const loaded = readLeaderboard({ getItem: () => value });
    assert.deepEqual(loaded.records, { 3: [], 4: [], 5: [], 6: [] });
  }
  const loaded = readLeaderboard({ getItem: () => JSON.stringify({
    3: [null, { time: -1, date }, { time: '123', date }, { time: 100, date: 'bad' },
      { time: 500, date }, { time: 200, date }, { time: 400, date }, { time: 300, date }],
    4: { time: 10, date },
    7: [{ time: 1, date }],
  }) });
  assert.deepEqual(loaded.records[3].map(record => record.time), [200, 300, 400]);
  assert.deepEqual(loaded.records[4], []);
  assert.equal(loaded.records[7], undefined);
  const denied = {
    getItem() { throw new Error('Storage denied'); },
    setItem() { throw new Error('Quota exceeded'); },
  };
  assert.equal(readLeaderboard(denied).available, false);
  assert.equal(saveLeaderboard(denied, loaded.records), false);
  assert.equal(saveLeaderboard(null, loaded.records), false);
  assert.throws(() => addResult(loaded.records, 7, 100, date), RangeError);
  assert.throws(() => addResult(loaded.records, 3, Infinity, date), RangeError);
  assert.throws(() => addResult(loaded.records, 3, 10, 'bad date'), RangeError);
});

test('records survive saving and reading from browser storage', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const records = addResult(readLeaderboard(storage).records, 4, 3456.7890123, date).records;
  assert.equal(saveLeaderboard(storage, records), true);
  assert.ok(values.has(STORAGE_KEY));
  const reloaded = readLeaderboard(storage);
  assert.equal(reloaded.available, true);
  assert.deepEqual(reloaded.records[4], [{ time: 3456.7890123, date }]);
});
