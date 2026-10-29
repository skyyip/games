// Pure simulation: seconds and a fixed 600 × 700 room, independent of frame rate.
export const W = 600, H = 700;
export const TYPES = ['phone', 'sneaker', 'ol', 'uncle'];
export const POINTS = { phone: 25, sneaker: 80, ol: 55, uncle: 45 };
export const SEATS = [
  { x: 142, y: 200 }, { x: 458, y: 200 },
  { x: 142, y: 370 }, { x: 458, y: 370 },
  { x: 142, y: 540 }, { x: 458, y: 540 },
];
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// Test the full travelled segment so fast swipes cannot jump over a shoe or dirty patch.
const sweepDistance = (p, from, to) => {
  const dx=to.x-from.x,dy=to.y-from.y,length2=dx*dx+dy*dy;
  const f=length2?clamp(((p.x-from.x)*dx+(p.y-from.y)*dy)/length2,0,1):0;
  return Math.hypot(p.x-from.x-dx*f,p.y-from.y-dy*f);
};
export function createGame(options = {}, random = Math.random) {
  const mode = ['sister', 'diner', 'versus'].includes(options.mode) ? options.mode : 'sister';
  const count = mode === 'versus' ? clamp(Math.round(options.players || 1), 1, 3) : 1;
  const duration = options.duration === 90 ? 90 : 60;
  const g = {
    mode, duration, remaining: duration, time: 0, status: 'playing', random,
    score: 0, combo: 0, bestCombo: 0, lastHit: -9, perfects: 0, pokes: 0,
    rage: 0, tips: 100, cleanCount: 0, shoutReady: 0, shoutText: '', shoutUntil: 0,
    event: null, nextEvent: options.events === false ? Infinity : 16,
    mop: { x: 300, y: 610, tx: 300, ty: 610, moving: false, pending: false },
    sister: { x: 300, y: 650 }, effects: [], serial: 0, sound: [],
    cycloneUntil: 0, soapUntil: 0, soap: null,
    npcs: SEATS.map((p, i) => ({ ...p, type: TYPES[i % 4], raisedUntil: 0, reactsAt: Infinity, hits: 0, cooldown: 0, flash: 0, perfect: false })),
    diners: Array.from({ length: count }, (_, i) => ({ id: i, wet: 0, stamina: 0, crampUntil: 0, invulnerable: 0, forcedLiftUntil: 0, left: false, right: false, block: false, flash: 0, dodges: 0 })),
    attack: null, nextAttack: 2, attackCount: 0,
    food: 0, drink: 0, eatReady: 0, qteUntil: 0, bites: 0,
    winner: null, endReason: '',
  };
  g.npcs.push(...SEATS.map((p,i) => ({ ...p, x:p.x+(i%2?-65:65), y:p.y+15, type:TYPES[(i+1)%4], guest:true, raisedUntil:0, reactsAt:Infinity, hits:0, cooldown:0, flash:0, perfect:false })));
  g.cells = [];
  for (let y = 112; y < 665; y += 28) for (let x = 34; x < 580; x += 28) {
    // No dirt hidden under tables or against the walls.
    if (!SEATS.some(p => Math.abs(p.x - x) < 77 && Math.abs(p.y - 22 - y) < 45)) g.cells.push({ x, y, clean: false });
  }
  return g;
}
export function activeNPCs(g) { return g.npcs.filter(n => !n.guest || g.event?.kind === 'rush'); }
export function emit(g, kind, x, y, value = 0) {
  g.effects.push({ id: ++g.serial, kind, x, y, value, born: g.time, life: kind === 'soap' ? 3 : 1.1 });
  if (g.effects.length > 48) g.effects.shift();
}
function sound(g, type) { if (g.sound.length < 8) g.sound.push(type); }
export function moveMop(g, x, y, active = true) {
  if (g.status !== 'playing' || g.mode === 'diner') return;
  g.mop.tx = clamp(x, 27, W - 27); g.mop.ty = clamp(y, 115, H - 30); g.mop.moving = active; g.mop.pending = active;
}
export function shout(g, roar = false) {
  if (g.status !== 'playing' || g.mode === 'diner' || g.time < g.shoutReady) return false;
  g.shoutReady = g.time + (roar ? 5 : 3);
  g.shoutText = roar ? 'roar' : 'shout'; g.shoutUntil = g.time + 1.25;
  for (const n of activeNPCs(g)) {
    if (n.type === 'uncle' || n.type === 'ol' && !roar) continue;
    const delay = ({ phone: 1.1, sneaker: .44, ol: .78 })[n.type];
    n.reactsAt = g.time + delay; n.raisedUntil = n.reactsAt + 1.6;if(roar)n.guardUntil=n.reactsAt;
  }
  emit(g, 'shout', g.sister.x, g.sister.y - 65); sound(g, roar ? 'roar' : 'shout');
  return true;
}
function addScore(g, value, x, y, perfect = false) {
  g.combo = g.time - g.lastHit <= 1.5 ? g.combo + 1 : 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo); g.lastHit = g.time;
  const points = Math.round(value * (1 + Math.min(g.combo - 1, 10) * .05));
  g.score += points; emit(g, perfect ? 'perfect' : 'points', x, y, points);
  sound(g, perfect ? 'perfect' : 'poke');
}
export function hitNPC(g, n, bypass = false) {
  if (g.time < n.cooldown) return false;
  const slipping = g.time < (n.slipUntil || 0);
  if (!bypass && !slipping && g.time >= n.reactsAt && g.time < n.raisedUntil) return false;
  if (!bypass && !slipping && n.type === 'ol' && g.time >= (n.guardUntil || 0)) {
    n.cooldown = g.time + .65; emit(g, 'guard', n.x, n.y + 48); sound(g, 'block'); return false;
  }
  n.cooldown = g.time + .7; n.flash = g.time + .45; n.hits++;
  const perfect = !bypass && n.reactsAt !== Infinity && n.reactsAt - g.time > 0 && n.reactsAt - g.time <= .24;
  n.perfect = perfect;
  if (perfect) g.perfects++;
  const isUncle = n.type === 'uncle' && n.hits % 3 !== 0;
  addScore(g, isUncle ? 8 : POINTS[n.type] * (perfect ? 2 : 1), n.x, n.y + 65, perfect);
  g.pokes++; g.rage = Math.min(100, g.rage + (perfect ? 23 : 11));
  if (n.reactsAt === Infinity && !bypass) g.tips = Math.max(0, g.tips - 3);
  if (!isUncle) { n.raisedUntil = g.time + 1.4; n.reactsAt = g.time; }
  if (isUncle) emit(g, 'uncle', n.x, n.y + 30, n.hits % 3);
  return true;
}
export function feet(g, index, side, down) {
  const d = g.diners[index];
  if (!d || !['left', 'right', 'block'].includes(side)) return;
  d[side] = down && g.status === 'playing' && d.wet < 3;
}
export function isRaised(g, d, side) {
  return d.wet < 3 && g.time >= d.crampUntil && (d[side] || g.time < d.forcedLiftUntil);
}
export function wetDiner(g, d, x, y) {
  if (d.wet >= 3 || g.time < d.invulnerable) return false;
  d.wet++; d.flash = g.time + .5; d.invulnerable = g.time + 1.3;
  emit(g, 'wet', x, y, d.wet); sound(g, 'splash');
  if (d.wet >= 3) { d.left = d.right = d.block = false; emit(g, 'soaked', x, y); }
  return true;
}
export function superMove(g, kind) {
  if (g.status !== 'playing' || g.mode === 'diner' || g.rage < 100 || !['cyclone', 'soap'].includes(kind)) return false;
  g.rage = 0;
  if (kind === 'cyclone') {
    g.cycloneUntil = g.time + 1.8; emit(g, 'cyclone', g.mop.x, g.mop.y); sound(g, 'super');
    if (g.mode === 'sister') for (const n of activeNPCs(g)) if (distance({ x: n.x, y: n.y + 60 }, g.mop) < 185) hitNPC(g, n, true);
    if (g.mode === 'versus') for (const d of g.diners) {
      const p = dinerSeat(g, d.id);
      if (distance({ x: p.x, y: p.y + 60 }, g.mop) < 185 && (!isRaised(g, d, 'left') || !isRaised(g, d, 'right'))) {
        if (wetDiner(g, d, p.x, p.y + 60)) addScore(g, 70, p.x, p.y);
      }
    }
    cleanAround(g, 185);
  } else {
    g.soapUntil = g.time + 4; g.soap = { x: g.mop.x, y: g.mop.y };
    emit(g, 'soap', g.mop.x, g.mop.y); sound(g, 'super');
    for (const n of activeNPCs(g)) if (distance({ x: n.x, y: n.y + 60 }, g.mop) < 140) { n.reactsAt = g.time + 4; n.raisedUntil = 0; n.cooldown = g.time + .1;n.slipUntil=g.time+4; }
    if(g.mode==='versus') for(const d of g.diners) { const p=dinerSeat(g,d.id);if(distance({x:p.x,y:p.y+60},g.mop)<140&&(!isRaised(g,d,'left')||!isRaised(g,d,'right'))){if(wetDiner(g,d,p.x,p.y+60)){d.forcedLiftUntil=g.time+.8;addScore(g,40,p.x,p.y);}} }
  }
  return true;
}
export function dinerSeat(g, i) {
  return g.mode === 'diner' ? { x: 300, y: 330 } : [{ x: 142, y: 230 }, { x: 458, y: 230 }, { x: 300, y: 470 }][i];
}
export function eat(g, kind) {
  if (g.status !== 'playing' || g.mode !== 'diner' || !['food', 'drink'].includes(kind) || g.time < g.eatReady || g[kind] >= 100) return false;
  const d = g.diners[0];
  const perfect = g.time <= g.qteUntil && g.qteUntil > 0 && (isRaised(g, d, 'left') || isRaised(g, d, 'right'));
  g[kind] = Math.min(100, g[kind] + (perfect ? 25 : 12.5));
  g.bites++; g.eatReady = g.time + 2.8;
  if (perfect) { d.stamina = Math.max(0, d.stamina - 32); g.qteUntil = 0; g.perfects++; }
  addScore(g, perfect ? 60 : 15, 300, 210, perfect);
  emit(g, kind, 300, 235); sound(g, 'eat');
  return true;
}
function cleanAround(g, radius, from=g.mop) {
  for (const cell of g.cells) if (!cell.clean && sweepDistance(cell, from, g.mop) < radius) {
    cell.clean = true; g.cleanCount++; g.score += 2; g.rage = Math.min(100, g.rage + .5);
  }
}
function end(g, winner, reason) {
  g.status = 'finished'; g.winner = winner; g.endReason = reason;
  releaseAll(g);
}
export function advance(g, seconds) {
  if (g.status !== 'playing' || !Number.isFinite(seconds) || seconds <= 0) return;
  // Substeps preserve contact and timing on low-refresh phones; large gaps never fast-forward a whole round.
  let remaining = Math.min(seconds, .25);
  while (remaining > 1e-8 && g.status === 'playing') { const dt = Math.min(remaining, 1 / 60); tick(g, dt); remaining -= dt; }
}
function tick(g, dt) {
  g.time += dt; g.remaining = Math.max(0, g.duration - g.time);
  g.effects = g.effects.filter(e => g.time - e.born < e.life);
  if (g.time - g.lastHit > 1.5) g.combo = 0;
  if (g.event && g.time > g.event.until) g.event = null;
  if (g.time >= g.nextEvent) {
    g.event = { kind: g.random() < .5 ? 'rain' : 'rush', until: g.time + 10 };
    g.nextEvent = g.time + 22; sound(g, 'event');
  }
  for(const n of g.npcs) if(n.raisedUntil>0&&g.time>=n.raisedUntil&&g.time>=n.reactsAt) {n.raisedUntil=0;n.reactsAt=Infinity;}
  if (g.mode !== 'diner') {
    const m = g.mop, from={x:m.x,y:m.y}, dx = m.tx - m.x, dy = m.ty - m.y, len = Math.hypot(dx, dy);
    // Fast catch-up follows a swipe without teleporting through feet or dirt.
    const speed = Math.min(2600, Math.max(1000, len * 24)) * (g.event?.kind === 'rain' ? 1.2 : 1) * (g.time < g.soapUntil ? 1.25 : 1);
    const travelling = (m.moving || m.pending) && len > 0;
    if (travelling) { const f = Math.min(1, speed * dt / len); m.x += dx * f; m.y += dy * f; if (f === 1) m.pending = false; }
    const follow = 1 - Math.exp(-28 * dt);
    g.sister.x += (m.x - 30 - g.sister.x) * follow;
    g.sister.y += (clamp(m.y + 80, 150, 665) - g.sister.y) * follow;
    if (travelling || g.time < g.cycloneUntil) cleanAround(g, g.time < g.cycloneUntil ? 85 : 34, from);
    if (g.mode === 'sister' && travelling) for (const n of activeNPCs(g)) if (sweepDistance({ x: n.x, y: n.y + 65 }, from, m) < 39) hitNPC(g, n);
    if (g.mode === 'versus') for (const d of g.diners) {
      const p = dinerSeat(g, d.id);
      for (const [side, offset] of [['left', -24], ['right', 24]]) {
        const foot = { x: p.x + offset, y: p.y + 65 };
        if (travelling && sweepDistance(foot, from, m) < 34 && !isRaised(g, d, side)) {
          if (wetDiner(g, d, foot.x, foot.y)) { addScore(g, 55, foot.x, foot.y); g.rage = Math.min(100, g.rage + 25); }
        }
      }
    }
  }
  for (const d of g.diners) {
    if (d.wet >= 3) continue;
    const count = Number(isRaised(g, d, 'left')) + Number(isRaised(g, d, 'right'));
    const load = count ? (count === 2 ? 26 : 13) * (g.event?.kind === 'rain' ? 2 : 1) : -35;
    d.stamina = clamp(d.stamina + load * dt, 0, 100);
    if (d.stamina >= 100 && g.time >= d.crampUntil) {
      d.crampUntil = g.time + 3; d.stamina = 0; d.left = d.right = false;
      const p = dinerSeat(g, d.id); emit(g, 'cramp', p.x, p.y + 35); sound(g, 'cramp');
    }
  }
  if (g.mode === 'diner') updateAttack(g);
  if (g.mode === 'sister' && g.cleanCount === g.cells.length) end(g, 'sister', 'clean');
  else if (g.mode === 'diner' && g.diners[0].wet >= 3) end(g, 'sister', 'soaked');
  else if (g.mode === 'diner' && g.food >= 100 && g.drink >= 100) end(g, 'diners', 'meal');
  else if (g.mode === 'versus' && g.diners.every(d => d.wet >= 3)) end(g, 'sister', 'soaked');
  else if (g.remaining <= 0) end(g, g.mode === 'sister' ? 'sister' : g.mode === 'versus' ? 'diners' : 'sister', 'timeout');
}
function updateAttack(g) {
  const d = g.diners[0];
  if (!g.attack && g.time >= g.nextAttack) {
    const kind = ['left', 'right', 'sweep', 'splash'][Math.floor(g.random() * 4)];
    const telegraph = Math.max(.8, 1.5 - g.time / 180);
    g.attack = { kind, start: g.time, impact: g.time + telegraph, end: g.time + telegraph + (kind === 'sweep' ? 1.4 : .55), hit: false, dodged: false };
    g.attackCount++; sound(g, 'warning');
  }
  const a = g.attack; if (!a) return;
  if (g.time >= a.impact && g.time < a.end) {
    const protectedFeet = a.kind === 'splash' ? d.block : a.kind === 'sweep' ? isRaised(g, d, 'left') && isRaised(g, d, 'right') : isRaised(g, d, a.kind);
    if (!protectedFeet && !a.hit) { a.hit = true; wetDiner(g, d, 300, 415); }
  }
  if (g.time >= a.end) {
    if (!a.hit) { d.dodges++; g.score += 35; g.qteUntil = g.time + 1.8; emit(g, 'dodge', 300, 285); sound(g, 'perfect'); }
    g.attack = null; g.nextAttack = g.time + (g.event?.kind === 'rush' ? .65 : 1.4);
  }
}
export function pause(g) { if (g.status === 'playing') { g.status = 'paused'; releaseAll(g); } }
export function resume(g) { if (g.status === 'paused') g.status = 'playing'; }
export function releaseAll(g) { g.mop.moving = g.mop.pending = false; g.mop.tx = g.mop.x; g.mop.ty = g.mop.y; for (const d of g.diners) d.left = d.right = d.block = false; }
export function cleanPercent(g) { return Math.round(g.cleanCount / g.cells.length * 100); }
