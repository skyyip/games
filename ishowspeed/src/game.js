export const GRID_SIZES = Object.freeze([3, 4, 5, 6]);

export class GridGame {
  #size;
  #state = 'idle';
  #clicked = new Set();
  #startedAt = 0;
  #finishedTime = 0;
  #now;

  constructor({ size = 3, now = () => performance.now() } = {}) {
    if (!GRID_SIZES.includes(size)) throw new RangeError('Unsupported grid size');
    this.#size = size;
    this.#now = now;
  }

  get size() { return this.#size; }
  get total() { return this.#size ** 2; }
  get state() { return this.#state; }
  get progress() { return this.#clicked.size; }
  get elapsed() {
    return this.#state === 'playing' ? this.#now() - this.#startedAt : this.#finishedTime;
  }

  reset(size = this.#size) {
    if (!GRID_SIZES.includes(size)) throw new RangeError('Unsupported grid size');
    this.#size = size;
    this.#state = 'idle';
    this.#clicked.clear();
    this.#startedAt = 0;
    this.#finishedTime = 0;
  }

  start() {
    if (this.#state !== 'idle') return false;
    this.#startedAt = this.#now();
    this.#state = 'playing';
    return true;
  }

  click(index) {
    if (this.#state !== 'playing' || !Number.isInteger(index) || index < 0 ||
        index >= this.total || this.#clicked.has(index)) return false;
    this.#clicked.add(index);
    if (this.progress === this.total) {
      this.#finishedTime = this.#now() - this.#startedAt;
      this.#state = 'completed';
    }
    return true;
  }
}
