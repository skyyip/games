export const GRID_SIZES = Object.freeze([3, 4, 5, 6]);
export const GAME_MODES = Object.freeze(['numbers', 'lowercase', 'uppercase', 'mixed', 'alphanumeric', 'colors']);
export const SORT_ORDERS = Object.freeze(['ascending', 'descending']);
const BASE_RECORD_KEYS = [...GRID_SIZES.map(size => `numbers-${size}`), 'lowercase', 'uppercase', 'mixed', 'alphanumeric'];
export const RECORD_KEYS = Object.freeze([
  ...BASE_RECORD_KEYS, ...BASE_RECORD_KEYS.map(key => `${key}-descending`),
  ...GRID_SIZES.map(size => `colors-${size}`),
]);
export const COLOR_PALETTE = Object.freeze([
  { id: 'red', name: 'Red', hex: '#b83c39' },
  { id: 'blue', name: 'Blue', hex: '#265fb0' },
  { id: 'gold', name: 'Gold', hex: '#8a5a00' },
  { id: 'green', name: 'Green', hex: '#287446' },
  { id: 'violet', name: 'Violet', hex: '#713fc2' },
  { id: 'pink', name: 'Pink', hex: '#a52c75' },
  { id: 'teal', name: 'Teal', hex: '#087576' },
  { id: 'orange', name: 'Orange', hex: '#a94718' },
].map(color => Object.freeze(color)));

export function tileColor(value) {
  if (typeof value !== 'string' || !value.startsWith('color:')) return null;
  return COLOR_PALETTE.find(color => color.id === value.split(':')[1]) ?? null;
}

function sequenceFor(mode, size, random, colors) {
  if (mode === 'numbers') {
    return Array.from({ length: size ** 2 }, (_, index) => String(index + 1));
  }
  if (mode === 'colors') {
    return colors.flatMap((color, rank) => {
      const group = [];
      for (let index = rank; index < size ** 2; index += colors.length) group.push(`color:${color.id}:${index}`);
      return group;
    });
  }
  const letters = [...'abcdefghijklmnopqrstuvwxyz'];
  if (mode === 'alphanumeric') {
    return [...'0123456789', ...letters.flatMap(letter => [letter.toUpperCase(), letter])];
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
  get recordKey() {
    const key = ['numbers', 'colors'].includes(this.#mode) ? `${this.#mode}-${this.#size}` : this.#mode;
    return this.#order === 'descending' ? `${key}-descending` : key;
  }
  get total() { return this.#sequence.length; }
  get state() { return this.#state; }
  get progress() { return this.#progress; }
  get next() {
    if (this.#mode === 'colors') return this.#sequence.find(value => !this.#clicked.has(value)) ?? null;
    return this.#sequence[this.#progress] ?? null;
  }
  get tiles() { return [...this.#tiles]; }
  get elapsed() {
    return this.#state === 'playing' ? this.#now() - this.#startedAt : this.#finishedTime;
  }

  reset({ size = GRID_SIZES.includes(this.#size) ? this.#size : 3, mode = this.#mode, order = this.#order } = {}) {
    if (!GRID_SIZES.includes(size) && !(mode === 'alphanumeric' && size === 8)) throw new RangeError('Unsupported grid size');
    if (!GAME_MODES.includes(mode)) throw new RangeError('Unsupported game mode');
    if (!SORT_ORDERS.includes(order)) throw new RangeError('Unsupported sort order');
    this.#mode = mode;
    this.#order = mode === 'colors' ? 'ascending' : order;
    this.#size = mode === 'alphanumeric' ? 8 : ['numbers', 'colors'].includes(mode) ? size : 6;
    this.#state = 'idle';
    this.#progress = 0;
    this.#clicked.clear();
    this.#colorOrder = mode === 'colors' ? shuffled(COLOR_PALETTE, this.#random).slice(0, 4) : [];
    this.#sequence = sequenceFor(mode, this.#size, this.#random, this.#colorOrder);
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
    const correct = this.#mode === 'colors' ? tileColor(value).id === tileColor(this.next).id : value === this.next;
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
