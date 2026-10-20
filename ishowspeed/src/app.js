import { GridGame, GRID_SIZES } from './game.js';
import { addResult, readLeaderboard, saveLeaderboard } from './leaderboard.js';

const $ = selector => document.querySelector(selector);
const game = new GridGame();
const board = $('#board');
const timer = $('#timer');
const startButton = $('#start');
const restartButton = $('#restart');
const resultPanel = $('#result');
const options = $('#grid-options');
const progressBar = $('.progress-track');
const instructions = $('#how-to-play');
instructions.open = !window.matchMedia('(max-width: 600px)').matches;
document.querySelector('a[href="#how-to-play"]').addEventListener('click', () => {
  instructions.open = true;
});
const descriptions = {
  3: ['The warm-up', '9 tiles. A little warm-up.'],
  4: ['Finding your flow', '16 tiles. Find your rhythm.'],
  5: ['Getting serious', '25 tiles. Time to focus.'],
  6: ['Full send', '36 tiles. Leave it all on the grid.'],
};
let frameId = null;
let highlightedRank = null;
let storage = null;
try { storage = window.localStorage; } catch { /* Storage can be blocked by browser settings. */ }
const loaded = readLeaderboard(storage);
let records = loaded.records;
let storageAvailable = loaded.available;

const seconds = milliseconds => (milliseconds / 1000).toFixed(2);
const announce = message => { $('#announcements').textContent = message; };

for (const size of GRID_SIZES) {
  const label = document.createElement('label');
  label.className = 'grid-option';
  label.innerHTML = `<input type="radio" name="grid-size" value="${size}" ${size === 3 ? 'checked' : ''} aria-label="${size} by ${size}, ${size * size} tiles">
    <span class="grid-option-content"><span class="mini-grid" style="--size:${size}" aria-hidden="true">${'<i></i>'.repeat(size * size)}</span><strong>${size} × ${size}</strong><small>${descriptions[size][0]}</small></span>`;
  options.append(label);
}

function renderBoard() {
  const tiles = document.createDocumentFragment();
  for (let index = 0; index < game.total; index += 1) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.index = index;
    tile.disabled = game.state !== 'playing';
    tile.setAttribute('aria-label', `Tile ${index + 1}, unclicked`);
    tile.innerHTML = `<span class="tile-corner" aria-hidden="true">+</span><span class="tile-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>`;
    tiles.append(tile);
  }
  board.replaceChildren(tiles);
  board.style.setProperty('--size', game.size);
  board.dataset.size = game.size;
  board.setAttribute('aria-label', `${game.size} by ${game.size} game board`);
  $('#board-label').textContent = `THE ${game.size} × ${game.size} GRID`;
  $('#size-description').textContent = descriptions[game.size][1];
  $('#total').textContent = game.total;
  progressBar.setAttribute('aria-valuemax', game.total);
  renderProgress();
}

function renderProgress() {
  $('#progress').textContent = game.progress;
  $('#progress-fill').style.width = `${game.progress / game.total * 100}%`;
  progressBar.setAttribute('aria-valuenow', game.progress);
}

function renderLeaderboard() {
  $('#record-grid').textContent = `${game.size} × ${game.size} GRID`;
  const list = $('#leaderboard');
  list.replaceChildren();
  for (let index = 0; index < 3; index += 1) {
    const record = records[game.size][index];
    const item = document.createElement('li');
    item.className = `${index === 0 ? 'record-first' : ''} ${record ? '' : 'record-empty'} ${highlightedRank === index + 1 ? 'record-new' : ''}`;
    const rank = document.createElement('span');
    rank.className = 'record-rank';
    rank.textContent = String(index + 1).padStart(2, '0');
    const detail = document.createElement('div');
    detail.className = 'record-detail';
    const time = document.createElement('p');
    time.className = 'record-time';
    time.textContent = record ? seconds(record.time) : '— —';
    if (record) {
      const unit = document.createElement('span');
      unit.textContent = 's';
      time.append(unit);
    }
    const date = document.createElement('p');
    date.className = 'record-date';
    date.textContent = record
      ? new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : ['A spot for your fastest run', 'Room for another good one', 'Go on. Make it yours.'][index];
    detail.append(time, date);
    item.append(rank, detail);
    if (highlightedRank === index + 1) {
      const badge = document.createElement('span');
      badge.className = 'new-record-badge';
      badge.textContent = 'NEW';
      item.append(badge);
    } else if (index === 0 && record) {
      const medal = document.createElement('span');
      medal.className = 'record-medal';
      medal.textContent = '✦';
      medal.setAttribute('aria-label', 'Personal best');
      item.append(medal);
    }
    list.append(item);
  }
  const best = records[game.size][0];
  $('#personal-best').textContent = best ? seconds(best.time) : '—';
  $('#personal-best-unit').hidden = !best;
  $('#best-caption').textContent = best ? `Your fastest ${game.size} × ${game.size}. So far.` : 'Your first finish sets the pace.';
  $('#records-caption').textContent = best ? 'Every fraction of a second is a fresh challenge.' : 'Your next personal best is one game away.';
  $('#storage-note').textContent = storageAvailable
    ? 'Just your records, in your browser. No account. No leaderboard anxiety.'
    : 'Browser storage is unavailable. Your records stay for this visit only.';
}

function setBoardStatus(label, state = '') {
  const status = $('#board-status');
  status.className = `board-status ${state ? `is-${state}` : ''}`;
  status.replaceChildren(document.createElement('i'), document.createTextNode(label));
}

function updateTimer() {
  timer.textContent = seconds(game.elapsed).padStart(5, '0');
  if (game.state === 'playing') frameId = requestAnimationFrame(updateTimer);
}

function resetRound(size = game.size) {
  cancelAnimationFrame(frameId);
  frameId = null;
  game.reset(size);
  highlightedRank = null;
  resultPanel.hidden = true;
  startButton.hidden = false;
  restartButton.hidden = true;
  options.disabled = false;
  $('#timer-label').textContent = 'READY WHEN YOU ARE';
  $('#progress-label').textContent = 'LET’S MAKE IT A QUICK ONE.';
  $('#board-hint').textContent = 'Your timer starts when you do. No pressure. Okay, a little.';
  setBoardStatus('STANDBY');
  updateTimer();
  renderBoard();
  renderLeaderboard();
}

function startRound() {
  resetRound();
  game.start();
  startButton.hidden = true;
  restartButton.hidden = false;
  options.disabled = true;
  for (const tile of board.children) tile.disabled = false;
  $('#timer-label').textContent = 'MAKE EVERY CLICK COUNT';
  $('#progress-label').textContent = 'FIND YOUR FLOW. KEEP GOING.';
  $('#board-hint').textContent = 'Click or tap every tile. Keyboard? Use Tab or the arrow keys, then Enter or Space.';
  setBoardStatus('IN PLAY', 'playing');
  updateTimer();
  board.firstElementChild.focus({ preventScroll: true });
  announce(`Game started. Clear all ${game.total} tiles.`);
}

function finishRound() {
  cancelAnimationFrame(frameId);
  frameId = null;
  updateTimer();
  const previousBest = records[game.size][0]?.time;
  const result = addResult(records, game.size, game.elapsed);
  records = result.records;
  highlightedRank = result.rank;
  storageAvailable = saveLeaderboard(storage, records);
  renderLeaderboard();
  setBoardStatus('CLEARED', 'completed');
  $('#timer-label').textContent = 'A LITTLE FASTER EVERY TIME';
  $('#progress-label').textContent = 'EVERY TILE. EVERY CLICK. DONE.';
  $('#result-time').textContent = seconds(game.elapsed);
  $('#result-kicker').textContent = result.personalBest ? 'YOU JUST RAISED THE BAR' : 'EVERY LAST TILE. CLEARED.';
  $('#result-title').textContent = result.personalBest ? 'New Personal Best!' : 'That was a rush.';
  $('#result-message').textContent = result.personalBest
    ? previousBest === undefined ? 'Your first record is on the board. This is just the beginning.' : `${seconds(previousBest - game.elapsed)}s faster. Your future self has a new time to chase.`
    : result.rank ? `Straight into your top three. A fresh #${result.rank} for the collection.` : 'A grid well cleared. Your personal best is waiting for a rematch.';
  resultPanel.hidden = false;
  restartButton.hidden = true;
  options.disabled = false;
  $('#board-hint').textContent = 'Quick hands. Clear grid. Your next run is waiting.';
  $('#play-again').focus({ preventScroll: true });
  announce(`Grid cleared in ${seconds(game.elapsed)} seconds. ${result.personalBest ? 'New Personal Best!' : result.rank ? `New number ${result.rank} result.` : ''}`);
}

options.addEventListener('change', event => {
  if (game.state === 'playing' || !event.target.matches('input[name="grid-size"]')) return;
  resetRound(Number(event.target.value));
  announce(`${game.size} by ${game.size} selected. ${game.total} tiles. Ready to start.`);
});

board.addEventListener('click', event => {
  const tile = event.target.closest('.tile');
  if (!tile || !game.click(Number(tile.dataset.index))) return;
  tile.disabled = true;
  tile.classList.add('clicked');
  tile.setAttribute('aria-label', `Tile ${Number(tile.dataset.index) + 1}, cleared`);
  tile.querySelector('.tile-number').innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>';
  renderProgress();
  if (game.state === 'completed') {
    finishRound();
  } else {
    if (event.detail === 0) {
      const remaining = [...board.children].filter(button => !button.disabled);
      const next = remaining.find(button => Number(button.dataset.index) > Number(tile.dataset.index)) ?? remaining[0];
      next.focus({ preventScroll: true });
    }
    announce(`${game.progress} of ${game.total} tiles cleared.`);
  }
});

board.addEventListener('keydown', event => {
  const direction = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: game.size, ArrowUp: -game.size }[event.key];
  if (direction === undefined || game.state !== 'playing' || !event.target.matches('.tile')) return;
  event.preventDefault();
  const index = Number(event.target.dataset.index);
  for (let step = 1; step <= game.total; step += 1) {
    const next = (index + direction * step % game.total + game.total) % game.total;
    if (!board.children[next].disabled) {
      board.children[next].focus({ preventScroll: true });
      break;
    }
  }
});

startButton.addEventListener('click', startRound);
$('#play-again').addEventListener('click', startRound);
restartButton.addEventListener('click', () => {
  resetRound();
  startButton.focus({ preventScroll: true });
  announce('Round reset. Timer stopped. Ready to start again.');
});
$('#change-grid').addEventListener('click', () => {
  resetRound();
  options.querySelector('input:checked').focus();
  announce('Choose your next grid size.');
});

resetRound();
