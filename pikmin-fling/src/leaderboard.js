import { MODES } from './game.js';

export const STORAGE_KEY = 'pikmin-fling.records.v2';

const emptyRecords = () => Object.fromEntries(MODES.map(mode => [mode, []]));
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
    for (const mode of MODES) {
      if (!Array.isArray(parsed?.[mode])) continue;
      records[mode] = parsed[mode].filter(validRecord)
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

export function addResult(records, mode, time, date = new Date().toISOString()) {
  if (!MODES.includes(mode) || !validRecord({ time, date })) {
    throw new RangeError('Invalid leaderboard result');
  }
  const previous = records[mode];
  const result = { time, date };
  const topThree = [...previous, result].sort((a, b) => a.time - b.time).slice(0, 3);
  const index = topThree.indexOf(result);
  return {
    records: { ...records, [mode]: topThree },
    rank: index === -1 ? null : index + 1,
    personalBest: previous.length === 0 || time < previous[0].time,
  };
}
