import { MODES,MAX_SCORE } from './game.js';

export const STORAGE_KEY = 'pikmin-fling.records.v4';
export const LEGACY_STORAGE_KEY = 'pikmin-fling.records.v3';

const emptyRecords = () => Object.fromEntries(MODES.map(mode => [mode, []]));
const validRecord = (record, mode) => record !== null && typeof record === 'object' &&
  typeof record.date === 'string' && Number.isFinite(Date.parse(record.date)) &&
  (mode === 'timed' ? Number.isInteger(record.score) && record.score >= 0 && record.score <= MAX_SCORE :
    typeof record.time === 'number' && Number.isFinite(record.time) && record.time >= 0);
const compare = mode => mode === 'timed' ? (a, b) => b.score - a.score : (a, b) => a.time - b.time;

export function readLeaderboard(storage) {
  const records = emptyRecords();
  let raw,legacy=false;
  try {
    raw = storage?.getItem(STORAGE_KEY);
    if(raw==null){raw=storage?.getItem(LEGACY_STORAGE_KEY)??storage?.getItem('pikmin-fling.records.v2');legacy=raw!=null;}
  } catch {
    return { records, available: false };
  }
  try {
    const parsed = JSON.parse(raw ?? 'null');
    for (const mode of MODES) {
      // Preserve old 20/30-second scores; only completion times migrate to 35-second rules.
      if(legacy&&mode==='timed')continue;
      if (!Array.isArray(parsed?.[mode])) continue;
      records[mode] = parsed[mode].filter(record => validRecord(record, mode))
        .map(record => mode === 'timed' ? { score: record.score, date: record.date } : { time: record.time, date: record.date })
        .sort(compare(mode)).slice(0, 3);
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

export function addResult(records, mode, value, date = new Date().toISOString()) {
  const result = mode === 'timed' ? { score: value, date } : { time: value, date };
  if (!MODES.includes(mode) || !validRecord(result, mode)) {
    throw new RangeError('Invalid leaderboard result');
  }
  const previous = records[mode] ?? [];
  const topThree = [...previous, result].sort(compare(mode)).slice(0, 3);
  const index = topThree.indexOf(result);
  return {
    records: { ...records, [mode]: topThree },
    rank: index === -1 ? null : index + 1,
    personalBest: previous.length === 0 || compare(mode)(result, previous[0]) < 0,
  };
}
