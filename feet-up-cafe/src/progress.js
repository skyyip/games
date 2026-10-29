import {shiftBonus} from './shift.js';
export const KEY = 'playground.feet-up-cafe.v1';
export const GEAR = [
  { id: 'classic', slot: 'mop', price: 0, icon: '🧹' }, { id: 'beam', slot: 'mop', price: 80, icon: '✨' }, { id: 'meteor', slot: 'mop', price: 180, icon: '☄️' },
  { id: 'floral', slot: 'apron', price: 0, icon: '🌼' }, { id: 'dragon', slot: 'apron', price: 120, icon: '🐉' }, { id: 'armour', slot: 'apron', price: 240, icon: '🛡️' },
  { id: 'bun-mop', slot:'mop',price:260,icon:'🥐' }, {id:'milk-apron',slot:'apron',price:180,icon:'🧋'}, {id:'cloud-shoes',slot:'shoes',price:180,icon:'☁️'},
  { id: 'sneakers', slot: 'shoes', price: 0, icon: '👟' }, { id: 'slippers', slot: 'shoes', price: 60, icon: '🩴' }, { id: 'heels', slot: 'shoes', price: 100, icon: '👠' }, { id: 'toes', slot: 'shoes', price: 150, icon: '🧦' },
];
export function fresh() { return { version: 1, coins: 0, owned: ['classic', 'floral', 'sneakers'], equipped: { mop: 'classic', apron: 'floral', shoes: 'sneakers' }, records: {} }; }
export function load(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(KEY)), p = fresh();
    if (!raw || raw.version !== 1) return p;
    p.coins = Number.isFinite(raw.coins) ? Math.max(0, Math.floor(raw.coins)) : 0;
    p.owned = [...new Set([...p.owned, ...(Array.isArray(raw.owned) ? raw.owned.filter(id => GEAR.some(g => g.id === id)) : [])])];
    for (const slot of ['mop', 'apron', 'shoes']) if (p.owned.includes(raw.equipped?.[slot]) && GEAR.some(g => g.slot === slot && g.id === raw.equipped[slot])) p.equipped[slot] = raw.equipped[slot];
    if (raw.records && typeof raw.records === 'object') for (const [key, list] of Object.entries(raw.records)) {
      if (!/^(sister|diner|versus)-(60|90)-[1-3]$/.test(key) || !Array.isArray(list)) continue;
      p.records[key] = list.filter(r => Number.isFinite(r.score) && r.score >= 0 && Number.isFinite(r.at) && r.at >= 0 && r.at <= 8.64e15).map(r => ({ score: Math.floor(r.score), at: r.at })).sort((a,b) => b.score-a.score).slice(0,3);
    }
    return p;
  } catch { return fresh(); }
}
export function save(storage, p) { try { storage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; } }
export const recordKey = g => `${g.mode}-${g.duration}-${g.mode === 'versus' ? g.diners.length : 1}`;
export function reward(g) {
  return Math.max(1, Math.floor(g.score / 25 * (g.mode === 'sister' ? g.tips / 100 : 1)) + (g.mode === 'diner' && g.winner === 'diners' ? 15 : 0)) + shiftBonus(g);
}
export function settle(p, g, at = Date.now()) {
  if (g.status !== 'finished') return p;
  const key = recordKey(g), coins = reward(g);
  return { ...p, coins: p.coins + coins, records: { ...p.records, [key]: [...(p.records[key] || []), { score: Math.round(g.score), at }].sort((a,b) => b.score-a.score || a.at-b.at).slice(0,3) } };
}
export function purchase(p, id) {
  const item = GEAR.find(g => g.id === id); if (!item) return p;
  if (p.owned.includes(id)) return { ...p, equipped: { ...p.equipped, [item.slot]: id } };
  if (p.coins < item.price) return p;
  return { ...p, coins: p.coins-item.price, owned: [...p.owned,id], equipped: { ...p.equipped, [item.slot]: id } };
}
