import './victory.js';
import './language.js';
import { springStep, magneticOffset, resistedDrag, shouldDismiss } from './motion.js';

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const running = new Set(), springs = new Set(), animations = new Set();
const feedback = new WeakMap();
let frame = 0, previousTime = 0;

// One clock for the springs that are actually moving. It sleeps when they settle.
function tick(now) {
  const dt = previousTime ? (now - previousTime) / 1000 : 1 / 60;
  previousTime = now;
  for (const spring of running) {
    let moving = false;
    for (const key of Object.keys(spring.value)) {
      const next = springStep(spring.value[key], spring.velocity[key], spring.target[key], dt, spring.physics);
      const settled = Math.abs(next.position - spring.target[key]) < 0.001 && Math.abs(next.velocity) < 0.01;
      spring.value[key] = settled ? spring.target[key] : next.position;
      spring.velocity[key] = settled ? 0 : next.velocity;
      moving ||= !settled;
    }
    spring.draw(spring.value);
    if (!moving) running.delete(spring);
  }
  frame = running.size ? requestAnimationFrame(tick) : 0;
  if (!frame) previousTime = 0;
}

function makeSpring(initial, draw, physics = {}) {
  const spring = {
    initial, draw, physics, value: { ...initial }, target: { ...initial },
    velocity: Object.fromEntries(Object.keys(initial).map(key => [key, 0])),
    set(next, immediate = false) {
      if (!immediate && Object.keys(next).every(key => this.target[key] === next[key])) return;
      Object.assign(this.target, next);
      if (immediate || reducedMotion.matches) {
        Object.assign(this.value, next);
        for (const key of Object.keys(next)) this.velocity[key] = 0;
        this.draw(this.value);
      } else {
        running.add(this);
        if (!frame) frame = requestAnimationFrame(tick);
      }
    },
    reset() {
      running.delete(this);
      this.value = { ...this.initial }; this.target = { ...this.initial };
      for (const key of Object.keys(this.velocity)) this.velocity[key] = 0;
      this.draw(this.value);
    },
  };
  springs.add(spring);
  return spring;
}

function play(target, keyframes, duration) {
  feedback.get(target)?.cancel();
  if (reducedMotion.matches || !target.animate) return;
  const animation = target.animate(keyframes, { duration, easing: 'linear' });
  feedback.set(target, animation);
  animations.add(animation);
  animation.finished.catch(() => {}).finally(() => {
    animations.delete(animation);
    if (feedback.get(target) === animation) feedback.delete(target);
  });
}

const arrival = [];
let position = 0, velocity = 0;
for (let step = 0; step <= 30; step++) {
  if (step) ({ position, velocity } = springStep(position, velocity, 1, 1 / 60));
  arrival.push(step === 30 ? 1 : position);
}

export function wrongFeedback(target) {
  try { navigator.vibrate?.([35, 25, 35]); } catch { /* Haptics are optional. */ }
  if (!target) return;
  target.classList.add('feedback-wrong');
  setTimeout(() => target.classList.remove('feedback-wrong'), 260);
}

export function animateChange(target) {
  if (!target) return;
  play(target, arrival.map(amount => ({ transform: `translateY(${3 * (1 - amount)}px) scale(${0.96 + amount * 0.04})` })), 280);
}

function reveal(target) {
  target.classList.add('motion-reveal');
  play(target, arrival.map(amount => ({ transform: `translateY(${18 * (1 - amount)}px) scale(${0.97 + amount * 0.03})` })), 420);
}

function initControls() {
  for (const control of document.querySelectorAll('.primary-button, .btn, .playground-home')) {
    control.classList.add('motion-control');
    const spring = makeSpring({ x: 0, y: 0, scale: 1 }, state => {
      control.style.setProperty('--motion-x', `${state.x}px`);
      control.style.setProperty('--motion-y', `${state.y}px`);
      control.style.setProperty('--motion-scale', state.scale);
    }, { mass: 0.65, stiffness: 300, damping: 23 });
    let bounds;
    const rest = () => spring.set({ x: 0, y: 0, scale: 1 });
    control.addEventListener('pointerenter', () => { bounds = control.getBoundingClientRect(); });
    control.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse' || control.matches(':disabled')) return;
      bounds ||= control.getBoundingClientRect();
      spring.set(magneticOffset((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    });
    control.addEventListener('pointerdown', event => {
      if (event.button === 0 && !control.matches(':disabled') && !reducedMotion.matches) spring.set({ scale: 0.975 });
    });
    control.addEventListener('pointerleave', rest);
    control.addEventListener('pointercancel', rest);
    document.addEventListener('pointerup', rest);
    window.addEventListener('blur', rest);
  }
}

function initCards() {
  const cards = [...document.querySelectorAll('.grid > .card, .grid > .game-card > .card')];
  if (!cards.length) return;
  const motions = [];
  const suppressed = new WeakSet();
  for (const card of cards) {
    const surface = document.createElement('div');
    surface.className = 'card-surface';
    while (card.firstChild) surface.append(card.firstChild);
    card.append(surface);
    card.classList.add('motion-card');
    card.draggable = false;
    const spring = makeSpring({ x: 0, y: 0, rx: 0, ry: 0, strain: 0, scale: 1, focus: 1 }, state => {
      surface.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotateX(${state.rx}deg) rotateY(${state.ry}deg) scale(${state.scale * state.focus * (1 + state.strain)},${state.scale * state.focus * (1 - state.strain * 0.5)})`;
      surface.style.setProperty('--layer-x', `${state.ry * 2.5}px`);
      surface.style.setProperty('--layer-y', `${-state.rx * 2.5}px`);
      surface.style.setProperty('--bend', `${state.strain * 220}px`);
    }, { mass: 1.3, stiffness: 240, damping: 25 });
    motions.push({ card, spring });
    let bounds, gesture;
    const rest = () => spring.set({ x: 0, y: 0, rx: 0, ry: 0, strain: 0, scale: 1 });
    card.addEventListener('dragstart', event => event.preventDefault());
    card.addEventListener('pointerenter', () => { bounds = card.getBoundingClientRect(); });
    card.addEventListener('pointerdown', event => {
      if (event.button !== 0 || reducedMotion.matches) return;
      suppressed.delete(card);
      bounds = card.getBoundingClientRect();
      spring.set({ scale: 0.985 });
      // Touch keeps native page scrolling and navigation; desktop dragging is decorative.
      if (event.pointerType === 'mouse') gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, time: event.timeStamp, dragging: false };
    });
    card.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      if (gesture?.id === event.pointerId) {
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.dragging && Math.hypot(dx, dy) > 10) {
          gesture.dragging = true; card.setPointerCapture(event.pointerId); suppressed.add(card);
          card.classList.add('is-tugging');
        }
        if (gesture.dragging) {
          event.preventDefault();
          const speed = Math.hypot(event.clientX - gesture.lastX, event.clientY - gesture.lastY) / Math.max(1, event.timeStamp - gesture.time);
          const gap = parseFloat(getComputedStyle(card.closest('.grid')).columnGap) || 10;
          const limit = Math.min(6, (gap - 4) / 2);
          const strain = Math.min(0.012, speed * 0.008) * (Math.abs(dx) >= Math.abs(dy) ? 1 : -1);
          spring.set({ x: resistedDrag(dx, limit), y: resistedDrag(dy, limit), strain, rx: -resistedDrag(dy, 2), ry: resistedDrag(dx, 2) }, true);
          gesture.lastX = event.clientX; gesture.lastY = event.clientY; gesture.time = event.timeStamp;
          return;
        }
      }
      if (!finePointer.matches || event.pointerType !== 'mouse') return;
      bounds ||= card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      const y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
      spring.set({ rx: -y * 2.2, ry: x * 2.2, y: -3 });
    });
    const release = event => {
      if (gesture && event.pointerId !== gesture.id) return;
      gesture = null; card.classList.remove('is-tugging'); rest();
    };
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', event => { suppressed.delete(card); release(event); });
    card.addEventListener('pointerleave', () => { if (!gesture?.dragging) { gesture = null; rest(); } });
    window.addEventListener('blur', () => { gesture = null; suppressed.delete(card); rest(); });
    card.addEventListener('click', event => {
      if (event.detail > 0 && suppressed.has(card)) { event.preventDefault(); suppressed.delete(card); return; }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      for (const other of cards) other.querySelector('.card-surface').style.viewTransitionName = '';
      surface.style.viewTransitionName = 'game-stage';
      try { sessionStorage.setItem('playground.last-game', card.getAttribute('href')); } catch { /* Storage is optional. */ }
    });
    reveal(surface);
  }
  let scrollFrame = 0;
  const centre = () => {
    scrollFrame = 0;
    if (reducedMotion.matches) return;
    // Read the fixed hit areas first, then update the decorative surfaces.
    const distances = motions.map(({card}) => Math.abs(card.getBoundingClientRect().top + card.offsetHeight / 2 - innerHeight / 2));
    motions.forEach(({spring}, index) => spring.set({ focus: 0.992 + Math.max(0, 1 - distances[index] / (innerHeight * 0.7)) * 0.016 }));
  };
  const update = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(centre); };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('pagereveal', () => {
    try {
      const last = sessionStorage.getItem('playground.last-game');
      cards.find(card => card.getAttribute('href') === last)?.querySelector('.card-surface').style.setProperty('view-transition-name', 'game-stage');
    } catch { /* Navigation remains native when storage is blocked. */ }
    update();
  });
  update();
}

function initChoices() {
  for (const group of document.querySelectorAll('.grid-options, .mode-options')) {
    const ink = document.createElement('span');
    ink.className = 'choice-ink'; ink.setAttribute('aria-hidden', 'true');
    ink.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect/></svg>';
    group.append(ink);
    const border = ink.querySelector('rect');
    let positioned = false, radius = 0;
    const spring = makeSpring({ x: 0, y: 0, width: 0, height: 0 }, state => {
      // Counter the outline's scaling so its 2px stroke follows the option's
      // original outer corners, including while the spring stretches it.
      const sx = Math.max(1, state.width) / 100, sy = Math.max(1, state.height) / 100;
      const corner = Math.max(0, radius - 1);
      for (const [attribute, value] of Object.entries({
        x: 1 / sx, y: 1 / sy,
        width: Math.max(0, 100 - 2 / sx), height: Math.max(0, 100 - 2 / sy),
        rx: corner / sx, ry: corner / sy,
      })) border.setAttribute(attribute, value);
      ink.style.transform = `translate(${state.x}px,${state.y}px) scale(${Math.max(0, state.width) / 100},${Math.max(0, state.height) / 100})`;
    }, { mass: 0.7, stiffness: 330, damping: 22 });
    const position = animate => {
      const selected = group.querySelector('input:checked')?.nextElementSibling;
      if (!selected || !group.offsetWidth) return;
      const box = selected.getBoundingClientRect(), parent = group.getBoundingClientRect();
      radius = parseFloat(getComputedStyle(selected).borderTopLeftRadius);
      const target = { x: box.left - parent.left, y: box.top - parent.top, width: box.width, height: box.height };
      if (positioned && animate && !reducedMotion.matches) {
        const dx = Math.abs(target.x - spring.target.x), dy = Math.abs(target.y - spring.target.y);
        spring.velocity[dx >= dy ? 'width' : 'height'] += Math.min(850, Math.max(dx, dy) * 6);
      }
      spring.set(target, !positioned || !animate); positioned = true;
    };
    group.addEventListener('change', () => position(true));
    new ResizeObserver(() => position(false)).observe(group);
    document.fonts.ready.then(() => position(false));
    position(false);
  }
}

function initSheets() {
  for (const dialog of document.querySelectorAll('.install-dialog')) {
    dialog.classList.add('motion-sheet');
    const grip = document.createElement('div'); grip.className = 'sheet-grip';
    grip.innerHTML = '<span aria-hidden="true"></span><button type="button" class="sheet-close" aria-label="Close installation instructions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';
    dialog.prepend(grip);
    grip.querySelector('button').addEventListener('click', () => dialog.close());
    const spring = makeSpring({ y: 0, strain: 0 }, state => {
      dialog.style.setProperty('--sheet-y', `${state.y}px`);
      dialog.style.setProperty('--sheet-strain', state.strain);
    }, { stiffness: 300, damping: 25 });
    let gesture, resetTimer;
    grip.addEventListener('pointerdown', event => {
      if (event.button !== 0 || reducedMotion.matches || event.target.closest('button')) return;
      gesture = { id: event.pointerId, y: event.clientY, lastY: event.clientY, time: event.timeStamp, speed: 0, height: dialog.offsetHeight };
      grip.setPointerCapture(event.pointerId);
    });
    grip.addEventListener('pointermove', event => {
      if (gesture?.id !== event.pointerId) return;
      const distance = Math.max(0, event.clientY - gesture.y);
      gesture.speed = (event.clientY - gesture.lastY) / Math.max(1, event.timeStamp - gesture.time);
      gesture.lastY = event.clientY; gesture.time = event.timeStamp;
      spring.set({ y: distance, strain: Math.min(0.02, distance / 10000) }, true);
    });
    const release = (event, cancelled = false) => {
      if (gesture?.id !== event.pointerId) return;
      const speed = event.timeStamp - gesture.time > 80 ? 0 : gesture.speed;
      const close = !cancelled && shouldDismiss(Math.max(0, event.clientY - gesture.y), gesture.height, speed);
      gesture = null;
      if (close) dialog.close(); else spring.set({ y: 0, strain: 0 });
    };
    grip.addEventListener('pointerup', event => release(event));
    grip.addEventListener('pointercancel', event => release(event, true));
    dialog.addEventListener('close', () => {
      gesture = null; clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { if (!dialog.open) spring.reset(); }, 220);
    });
    new MutationObserver(() => {
      if (dialog.open) { clearTimeout(resetTimer); spring.reset(); }
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }
}

function initFeedback() {
  const observer = new MutationObserver(records => {
    const cleared = new Set();
    for (const record of records) {
      const target = record.target;
      if (record.type === 'attributes' && record.attributeName === 'class' && target.matches('.tile.clicked') && !record.oldValue?.split(' ').includes('clicked')) cleared.add(target);
      if (record.type === 'attributes' && record.attributeName === 'hidden' && !target.hidden && target.matches('.result-overlay, #result.panel, #setup.panel')) reveal(target);
      if (record.type === 'childList' && target.id === 'rows') {
        for (const row of record.addedNodes) if (row.nodeType === 1) animateChange(row);
      }
    }
    for (const tile of cleared) animateChange(tile.querySelector('.tile-number'));
  });
  // Timer and canvas HUD updates do not need to enter the feedback observer.
  for (const target of document.querySelectorAll('#board, #result, #setup')) {
    observer.observe(target, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'hidden'] });
  }
}

// Feedback never postpones a native click, a game input, or a navigation.
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || reducedMotion.matches) return;
  const control = event.target.closest('.primary-button, .btn, .card, .playground-home');
  if (!control || control.matches(':disabled')) return;
  const surface = control.querySelector(':scope > .card-surface') || control;
  const bounds = surface.getBoundingClientRect();
  const ripple = document.createElement('span'); ripple.className = 'interaction-ripple'; ripple.setAttribute('aria-hidden', 'true');
  const diameter = Math.hypot(bounds.width, bounds.height) * 2;
  Object.assign(ripple.style, { width: `${diameter}px`, height: `${diameter}px`, left: `${event.clientX - bounds.left}px`, top: `${event.clientY - bounds.top}px` });
  surface.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  setTimeout(() => ripple.remove(), 650);
});

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  cancelAnimationFrame(frame); frame = 0; previousTime = 0;
  for (const animation of animations) animation.cancel();
  for (const spring of springs) spring.reset();
  running.clear();
});
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(frame); frame = 0; previousTime = 0;
  for (const animation of animations) animation.cancel();
  for (const spring of springs) spring.reset();
});
function init() { initControls(); initCards(); initChoices(); initSheets(); initFeedback(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
