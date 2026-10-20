export const GRID_SIZES = Object.freeze([3, 4, 5, 6]);
export const GAME_MODES = Object.freeze(['numbers', 'lowercase', 'uppercase', 'mixed']);
export const RECORD_KEYS = Object.freeze([
  ...GRID_SIZES.map(size => `numbers-${size}`), 'lowercase', 'uppercase', 'mixed',
]);

function sequenceFor(mode, size, random) {
  if (mode === 'numbers') {
    return Array.from({ length: size ** 2 }, (_, index) => String(index + 1));
  }
  const letters = [...'abcdefghijklmnopqrstuvwxyz'];
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
  #state = 'idle';
  #progress = 0;
  #sequence = [];
  #tiles = [];
  #startedAt = 0;
  #finishedTime = 0;
  #now;
  #random;

  constructor({ size = 3, mode = 'numbers', now = () => performance.now(), random = Math.random } = {}) {
    this.#now = now;
    this.#random = random;
    this.reset({ size, mode });
  }

  get size() { return this.#size; }
  get mode() { return this.#mode; }
  get recordKey() { return this.#mode === 'numbers' ? `numbers-${this.#size}` : this.#mode; }
  get total() { return this.#sequence.length; }
  get state() { return this.#state; }
  get progress() { return this.#progress; }
  get next() { return this.#sequence[this.#progress] ?? null; }
  get tiles() { return [...this.#tiles]; }
  get elapsed() {
    return this.#state === 'playing' ? this.#now() - this.#startedAt : this.#finishedTime;
  }

  reset({ size = this.#size, mode = this.#mode } = {}) {
    if (!GRID_SIZES.includes(size)) throw new RangeError('Unsupported grid size');
    if (!GAME_MODES.includes(mode)) throw new RangeError('Unsupported game mode');
    this.#mode = mode;
    this.#size = mode === 'numbers' ? size : 6;
    this.#state = 'idle';
    this.#progress = 0;
    this.#sequence = sequenceFor(mode, this.#size, this.#random);
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
        index >= this.#tiles.length || this.#tiles[index] !== this.next) return false;
    this.#progress += 1;
    if (this.progress === this.total) {
      this.#finishedTime = this.#now() - this.#startedAt;
      this.#state = 'completed';
    }
    return true;
  }
}
