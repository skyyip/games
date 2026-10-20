import { GRID_SIZES } from './game.js';

export const STORAGE_KEY = 'grid-rush.records.v1';

const emptyRecords = () => Object.fromEntries(GRID_SIZES.map(size => [size, []]));
const validRecord = record => record !== null && typeof record === 'object' &&
  typeof record.time === 'number' && Number.isFinite(record.time) && record.time >= 0 &&
  typeof record.date === 'string' && Number.isFinite(Date.parse(record.date));

export function readLeaderboard(storage) {
  const records = emptyRecords();
  let raw;
  try {
    raw = storage?.getItem(STORAGE_KEY);
  } catch {
    return { records, available: false };
  }
  try {
    const parsed = JSON.parse(raw ?? 'null');
    for (const size of GRID_SIZES) {
      if (!Array.isArray(parsed?.[size])) continue;
      records[size] = parsed[size].filter(validRecord)
        .map(({ time, date }) => ({ time, date }))
        .sort((a, b) => a.time - b.time).slice(0, 3);
    }
  } catch {
    // Invalid JSON is treated as an empty leaderboard, ready for the next game.
  }
  return { records, available: Boolean(storage) };
}

export function saveLeaderboard(storage, records) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function addResult(records, size, time, date = new Date().toISOString()) {
  if (!GRID_SIZES.includes(size) || !validRecord({ time, date })) {
    throw new RangeError('Invalid leaderboard result');
  }
  const previous = records[size];
  const result = { time, date };
  const topThree = [...previous, result].sort((a, b) => a.time - b.time).slice(0, 3);
  const index = topThree.indexOf(result);
  return {
    records: { ...records, [size]: topThree },
    rank: index === -1 ? null : index + 1,
    personalBest: previous.length === 0 || time < previous[0].time,
  };
}
