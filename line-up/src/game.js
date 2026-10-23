import { createLine, selectionFraction, SHAPES } from './geometry.js';

const EPSILON = 1e-9;

export class LineGame {
  constructor(random = Math.random) { this.random = random; this.reset(); }

  reset() {
    this.state = 'setup'; this.target = null; this.line = null; this.players = []; this.turn = 0; this.guesses = [];
  }

  start(names) {
    if (!Array.isArray(names) || names.length < 2 || names.length > 6 || names.some(name => typeof name !== 'string')) {
      throw new TypeError('Choose between two and six players.');
    }
    this.players = names.map((name,index) => name.trim().slice(0,24) || `Player ${index+1}`);
    this.target = Math.floor(this.random() * 100) + 1;
    this.line = createLine(SHAPES[Math.floor(this.random()*SHAPES.length)],this.random);
    this.turn = 0; this.guesses = []; this.state = 'handoff';
  }

  beginTurn() {
    if (this.state !== 'handoff') return false;
    this.state = 'choosing'; return true;
  }

  submit(start, end, otherSide=false) {
    if (this.state !== 'choosing' || typeof otherSide !== 'boolean' || ![start,end].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) return false;
    const percent = selectionFraction(this.line,start,end,otherSide) * 100;
    if(percent<=0)return false;
    this.guesses.push({ index:this.turn, name:this.players[this.turn], start, end, otherSide:this.line.closed&&otherSide, percent, error:Math.abs(percent-this.target) });
    this.turn++;
    this.state = this.turn === this.players.length ? 'results' : 'handoff';
    return true;
  }

  get results() {
    if (this.state !== 'results') return [];
    return [...this.guesses].sort((a,b) => Math.abs(a.error-b.error) < EPSILON ? a.index-b.index : a.error-b.error);
  }

  get winners() {
    const results = this.results;
    return results.filter(result => Math.abs(result.error-results[0].error) < EPSILON);
  }
}
