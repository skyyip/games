import { SHAPE_PALETTE, tileShape } from './shapes.js';

export const GRID_SIZES = Object.freeze([3, 4, 5, 6]);
export const GAME_MODES = Object.freeze(['numbers', 'number-range', 'lowercase', 'uppercase', 'mixed', 'alphanumeric', 'colors', 'shapes']);
const groupedMode = mode => mode === 'colors' || mode === 'shapes';
export const SORT_ORDERS = Object.freeze(['ascending', 'descending']);
const BASE_RECORD_KEYS = [...GRID_SIZES.map(size => `numbers-${size}`), 'lowercase', 'uppercase', 'mixed', 'alphanumeric-26',
  ...GRID_SIZES.map(size => `number-range-${size}`)];
export const RECORD_KEYS = Object.freeze([
  ...BASE_RECORD_KEYS, ...BASE_RECORD_KEYS.map(key => `${key}-descending`),
  ...GRID_SIZES.map(size => `colors-${size}`),
  ...GRID_SIZES.map(size => `shapes-${size}`),
  // Retain old 62-symbol scores without comparing them to the new 26-position rounds.
  'alphanumeric', 'alphanumeric-descending',
]);
export const COLOR_PALETTE = Object.freeze([
  { id: 'red', name: 'Red', hex: '#b83c39' },
  { id: 'blue', name: 'Blue', hex: '#265fb0' },
  { id: 'gold', name: 'Gold', hex: '#f5d65b', ink: '#182316' },
  { id: 'green', name: 'Green', hex: '#287446' },
  { id: 'violet', name: 'Violet', hex: '#713fc2' },
  { id: 'pink', name: 'Pink', hex: '#a52c75' },
  { id: 'teal', name: 'Teal', hex: '#58c4c2', ink: '#182316' },
  { id: 'orange', name: 'Orange', hex: '#a94718' },
].map(color => Object.freeze(color)));
// Choose a reviewed combination, then randomise its order. Similar shades never
// share a round; lighter colours also add a useful difference in brightness.
const COLOR_SETS = [
  ['blue', 'gold', 'red', 'teal'],
  ['violet', 'gold', 'orange', 'green'],
  ['blue', 'gold', 'pink', 'green'],
];

export function tileColor(value) {
  if (typeof value !== 'string' || !value.startsWith('color:')) return null;
  return COLOR_PALETTE.find(color => color.id === value.split(':')[1]) ?? null;
}

function sequenceFor(mode, size, random, groups) {
  if (mode === 'numbers') {
    return Array.from({ length: size ** 2 }, (_, index) => String(index + 1));
  }
  if (mode === 'number-range') {
    const available = Array.from({ length: 1999 }, (_, index) => index - 999);
    // Remove each sampled value so duplicates cannot occur, even with repeated random draws.
    const numbers = Array.from({ length: size ** 2 }, () => available.splice(Math.floor(random() * available.length), 1)[0]);
    return numbers.sort((a, b) => a - b).map(String);
  }
  if (groupedMode(mode)) {
    return groups.flatMap((entry, rank) => {
      const group = [];
      for (let index = rank; index < size ** 2; index += groups.length) group.push(`${mode === 'colors' ? 'color' : 'shape'}:${entry.id}:${index}`);
      return group;
    });
  }
  const letters = [...'abcdefghijklmnopqrstuvwxyz'];
  if (mode === 'alphanumeric') {
    const forms = letters.map(() => Math.floor(random() * 3));
    // Every round includes numbers and both letter cases, even with an unlucky draw.
    if ([0, 1, 2].some(form => !forms.includes(form))) forms.splice(0, 3, 0, 1, 2);
    return letters.map((letter, index) => forms[index] === 0 ? String(index + 1) : forms[index] === 1 ? letter : letter.toUpperCase());
  }
  if (mode === 'lowercase') return letters;
  if (mode === 'uppercase') return letters.map(letter => letter.toUpperCase());
  const mixed = letters.map(letter => random() < 0.5 ? letter.toUpperCase() : letter);
  // Every mixed round includes both cases, including deterministic test runs.
  if (mixed.every(letter => letter === letter.toUpperCase())) mixed[1] = 'b';
  if (mixed.every(letter => letter === letter.toLowerCase())) mixed[0] = 'A';
  return mixed;
}

function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export class OrderedGame {
  #size = 3;
  #mode = 'numbers';
  #order = 'ascending';
  #state = 'idle';
  #progress = 0;
  #sequence = [];
  #tiles = [];
  #colorOrder = [];
  #shapeOrder = [];
  #clicked = new Set();
  #startedAt = 0;
  #finishedTime = 0;
  #now;
  #random;

  constructor({ size = 3, mode = 'numbers', order = 'ascending', now = () => performance.now(), random = Math.random } = {}) {
    this.#now = now;
    this.#random = random;
    this.reset({ size, mode, order });
  }

  get size() { return this.#size; }
  get mode() { return this.#mode; }
  get order() { return this.#order; }
  get colorOrder() { return [...this.#colorOrder]; }
  get shapeOrder() { return [...this.#shapeOrder]; }
  get recordKey() {
    const key = this.#mode === 'alphanumeric' ? 'alphanumeric-26' : ['numbers', 'number-range', 'colors', 'shapes'].includes(this.#mode) ? `${this.#mode}-${this.#size}` : this.#mode;
    return this.#order === 'descending' ? `${key}-descending` : key;
  }
  get total() { return this.#sequence.length; }
  get state() { return this.#state; }
  get progress() { return this.#progress; }
  get next() {
    if (groupedMode(this.#mode)) return this.#sequence.find(value => !this.#clicked.has(value)) ?? null;
    return this.#sequence[this.#progress] ?? null;
  }
  get tiles() { return [...this.#tiles]; }
  get elapsed() {
    return this.#state === 'playing' ? this.#now() - this.#startedAt : this.#finishedTime;
  }

  reset({ size = this.#size, mode = this.#mode, order = this.#order } = {}) {
    if (!GRID_SIZES.includes(size)) throw new RangeError('Unsupported grid size');
    if (!GAME_MODES.includes(mode)) throw new RangeError('Unsupported game mode');
    if (!SORT_ORDERS.includes(order)) throw new RangeError('Unsupported sort order');
    this.#mode = mode;
    this.#order = groupedMode(mode) ? 'ascending' : order;
    this.#size = ['numbers', 'number-range', 'colors', 'shapes'].includes(mode) ? size : 6;
    this.#state = 'idle';
    this.#progress = 0;
    this.#clicked.clear();
    this.#colorOrder = [];
    this.#shapeOrder = [];
    if (mode === 'colors') {
      const palette = COLOR_SETS[Math.floor(this.#random() * COLOR_SETS.length)];
      this.#colorOrder = shuffled(palette.map(id => COLOR_PALETTE.find(color => color.id === id)), this.#random);
    }
    if (mode === 'shapes') this.#shapeOrder = shuffled(SHAPE_PALETTE, this.#random).slice(0, 4);
    this.#sequence = sequenceFor(mode, this.#size, this.#random, mode === 'shapes' ? this.#shapeOrder : this.#colorOrder);
    if (this.#order === 'descending') this.#sequence.reverse();
    this.#tiles = [...this.#sequence, ...Array(this.#size ** 2 - this.total).fill(null)];
    this.#startedAt = 0;
    this.#finishedTime = 0;
  }

  start() {
    if (this.#state !== 'idle') return false;
    this.#startedAt = this.#now();
    this.#state = 'playing';
    this.#tiles = shuffled(this.#tiles, this.#random);
    return true;
  }

  click(index) {
    if (this.#state !== 'playing' || !Number.isInteger(index) || index < 0 ||
        index >= this.#tiles.length) return false;
    const value = this.#tiles[index];
    if (value === null || this.#clicked.has(value)) return false;
    const groupFor = this.#mode === 'shapes' ? tileShape : tileColor;
    const correct = groupedMode(this.#mode) ? groupFor(value).id === groupFor(this.next).id : value === this.next;
    if (!correct) return false;
    this.#clicked.add(value);
    this.#progress += 1;
    if (this.progress === this.total) {
      this.#finishedTime = this.#now() - this.#startedAt;
      this.#state = 'completed';
    }
    return true;
  }
}
