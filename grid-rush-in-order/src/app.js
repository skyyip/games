import { wrongFeedback, animateChange } from '../../grid-rush/src/playground-ui.js';
import { OrderedGame, GRID_SIZES, tileColor } from './game.js';
import { addResult, readLeaderboard, saveLeaderboard } from './leaderboard.js';

const $ = selector => document.querySelector(selector);
const game = new OrderedGame();
const board = $('#board');
const timer = $('#timer');
const startButton = $('#start');
const restartButton = $('#restart');
const resultPanel = $('#result');
const options = $('#grid-options');
const modes = $('#mode-options');
const orderSelect = $('#sort-order');
let selectedSize = 3;
const progressBar = $('.progress-track');
const instructions = $('#how-to-play');
instructions.open = !window.matchMedia('(max-width: 600px)').matches;
document.querySelector('a[href="#how-to-play"]').addEventListener('click', () => {
  instructions.open = true;
});
const modeNames = { numbers: 'Numbers', lowercase: 'Lowercase', uppercase: 'Uppercase', mixed: 'Mixed case', alphanumeric: 'Letters + numbers', colors: 'Colours' };
const roundName = () => game.mode === 'colors' ? `${game.size} × ${game.size} colours` : `${game.mode === 'numbers' ? `${game.size} × ${game.size} numbers` : modeNames[game.mode]} · ${game.order === 'ascending' ? 'ascending' : 'descending'}`;

function sequenceNote() {
  if (game.mode === 'colors') return 'A new colour key each round. Clear every tile of one colour, then the next.';
  const ascending = game.order === 'ascending';
  if (game.mode === 'numbers') return ascending ? `1 → 2 → … → ${game.total}` : `${game.total} → … → 2 → 1`;
  if (game.mode === 'alphanumeric') return `${ascending ? '1 → b → 3 → 4 → e → F → 7 …' : '26 → y → 24 → W → 22 …'} Numbers and letters share positions: 1 = A = a, 2 = B = b, …, 26 = Z = z. One random form per position.`;
  if (game.mode === 'mixed') return ascending ? 'A → b → C … → Z. Case does not change alphabet order.' : 'Z → y → X … → A. Case does not change alphabet order.';
  return game.mode === 'uppercase' ? ascending ? 'A → B → C … → Z' : 'Z → Y → X … → A' : ascending ? 'a → b → c … → z' : 'z → y → x … → a';
}
const descriptions = {
  3: ['The warm-up', '9 tiles. A little warm-up.'],
  4: ['Finding your flow', '16 tiles. Find your rhythm.'],
  5: ['Getting serious', '25 tiles. Time to focus.'],
  6: ['Full send', '36 tiles. Leave it all on the grid.'],
};
let frameId = null;
let highlightedRank = null;
let suppressTouchClick = false;
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
  for (const [index, value] of game.tiles.entries()) {
    if (value === null) {
      const blank = document.createElement('span');
      blank.className = 'empty-tile';
      blank.setAttribute('aria-hidden', 'true');
      tiles.append(blank);
      continue;
    }
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.index = index;
    tile.dataset.value = value;
    const color = tileColor(value);
    if (color) {
      tile.classList.add('tile-color');
      tile.dataset.color = color.id;
      tile.style.setProperty('--tile-color', color.hex);
      tile.style.setProperty('--tile-ink', color.ink ?? '#ffffff');
    }
    tile.disabled = game.state !== 'playing';
    tile.setAttribute('aria-label', `${symbolName(value)}, not cleared`);
    tile.innerHTML = `<span class="tile-corner" aria-hidden="true">+</span><span class="tile-number" aria-hidden="true"></span>`;
    tile.querySelector('.tile-number').textContent = color ? color.name : game.mode === 'numbers' ? value.padStart(2, '0') : value;
    tiles.append(tile);
  }
  board.replaceChildren(tiles);
  board.style.setProperty('--size', game.size);
  board.dataset.size = game.size;
  board.dataset.mode = game.mode;
  board.setAttribute('aria-label', `${game.size} by ${game.size} game board`);
  $('#board-label').textContent = `THE ${game.size} × ${game.size} GRID`;
  $('#size-description').textContent = ['numbers', 'colors'].includes(game.mode) ? `${game.total} tiles. ${game.mode === 'colors' ? 'Four random colours.' : descriptions[game.size][0] + '.'}` : game.mode === 'alphanumeric' ? '26 mixed tiles. A 6 × 6 board.' : 'All 26 letters. A 6 × 6 board.';
  options.hidden = !['numbers', 'colors'].includes(game.mode);
  $('#order-control').hidden = game.mode === 'colors';
  $('#mode-note').textContent = sequenceNote();
  renderColorKey();
  renderNext();
  $('#total').textContent = game.total;
  progressBar.setAttribute('aria-valuemax', game.total);
  renderProgress();
}

function symbolName(value) {
  const color = tileColor(value);
  if (color) return color.name;
  if (/^\d+$/.test(value)) return `Number ${value}`;
  return `${value === value.toUpperCase() ? 'Uppercase' : 'Lowercase'} ${value}`;
}

function renderColorKey() {
  $('#color-key').hidden = game.mode !== 'colors';
  $('#color-sequence').replaceChildren(...game.colorOrder.map((color, index) => {
    const item = document.createElement('li');
    item.dataset.color = color.id;
    item.setAttribute('aria-label', `Step ${index + 1}: ${color.name}`);
    item.innerHTML = `<i aria-hidden="true"></i><span></span><small aria-hidden="true">${index + 1}</small>`;
    item.querySelector('i').style.backgroundColor = color.hex;
    item.querySelector('span').textContent = color.name;
    return item;
  }));
}

function renderNext() {
  const color = tileColor(game.next);
  const cue = $('#next-symbol');
  $('#next-label').textContent = game.state === 'completed' ? 'ALL IN ORDER' : game.state === 'playing' ? 'NEXT UP' : 'START WITH';
  cue.textContent = color?.name ?? game.next ?? '✓';
  cue.dataset.value = game.next ?? '';
  cue.dataset.color = color?.id ?? '';
  cue.classList.toggle('is-color', Boolean(color));
  cue.style.setProperty('--cue-color', color?.hex ?? 'transparent');
  cue.style.setProperty('--cue-ink', color?.ink ?? '#ffffff');
  if (game.state === 'playing') animateChange(cue);
  $('#next-description').textContent = game.state === 'completed' ? 'Sequence complete. Results below.' : game.state === 'playing' ? color ? `Clear all ${color.name} tiles.` : 'Find this tile. Keep the order.' : 'The board shuffles when you start.';
  const currentIndex = game.colorOrder.findIndex(entry => entry.id === color?.id);
  for (const [index, item] of [...$('#color-sequence').children].entries()) {
    const current = index === currentIndex;
    item.classList.toggle('is-current', current);
    const cleared = game.state === 'completed' || index < currentIndex;
    item.classList.toggle('is-cleared', cleared);
    item.setAttribute('aria-label', `Step ${index + 1}: ${item.querySelector('span').textContent}${cleared ? ', cleared' : current ? ', current' : ''}`);
    if (current) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
}

function renderProgress() {
  $('#progress').textContent = game.progress;
  $('#progress-fill').style.width = `${game.progress / game.total * 100}%`;
  progressBar.setAttribute('aria-valuenow', game.progress);
}

function renderLeaderboard() {
  $('#record-grid').textContent = game.mode === 'colors' ? `${game.size} × ${game.size} COLOURS` : `${game.mode === 'numbers' ? `${game.size} × ${game.size}` : game.mode === 'alphanumeric' ? '26 POSITIONS' : modeNames[game.mode].toUpperCase()} · ${game.order === 'ascending' ? 'ASC' : 'DESC'}`;
  const list = $('#leaderboard');
  list.replaceChildren();
  for (let index = 0; index < 3; index += 1) {
    const record = records[game.recordKey][index];
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
  const best = records[game.recordKey][0];
  $('#personal-best').textContent = best ? seconds(best.time) : '—';
  $('#personal-best-unit').hidden = !best;
  $('#best-caption').textContent = best ? `Your fastest ${roundName()} run.` : 'Your first finish sets the pace.';
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

function resetRound() {
  cancelAnimationFrame(frameId);
  frameId = null;
  game.reset({ mode: modes.querySelector('input:checked').value, size: selectedSize, order: orderSelect.value });
  board.classList.remove('is-playing');
  highlightedRank = null;
  resultPanel.hidden = true;
  startButton.hidden = false;
  restartButton.hidden = true;
  options.disabled = false;
  modes.disabled = false;
  orderSelect.disabled = false;
  $('#timer-label').textContent = 'READY WHEN YOU ARE';
  $('#progress-label').textContent = 'LET’S MAKE IT A QUICK ONE.';
  $('#board-hint').textContent = 'Choose your sequence. Start the clock. Find each symbol in order.';
  setBoardStatus('STANDBY');
  updateTimer();
  renderBoard();
  renderLeaderboard();
}

function startRound() {
  if (game.state !== 'idle') resetRound();
  game.start();
  renderBoard();
  board.classList.add('is-playing');
  startButton.hidden = true;
  restartButton.hidden = false;
  options.disabled = true;
  modes.disabled = true;
  orderSelect.disabled = true;
  $('#timer-label').textContent = 'MAKE EVERY CLICK COUNT';
  $('#progress-label').textContent = 'ONE BY ONE. IN ORDER.';
  $('#board-hint').textContent = 'Wrong taps don’t count. Use Tab or arrow keys, then Enter or Space.';
  setBoardStatus('IN PLAY', 'playing');
  updateTimer();
  board.querySelector('button').focus({ preventScroll: true });
  announce(`Game started. Find ${symbolName(game.next)} first. Clear all ${game.total} tiles in order.`);
}

function finishRound() {
  board.classList.remove('is-playing');
  cancelAnimationFrame(frameId);
  frameId = null;
  updateTimer();
  const previousBest = records[game.recordKey][0]?.time;
  const result = addResult(records, game.recordKey, game.elapsed);
  records = result.records;
  highlightedRank = result.rank;
  storageAvailable = saveLeaderboard(storage, records);
  renderLeaderboard();
  setBoardStatus('CLEARED', 'completed');
  renderNext();
  $('#timer-label').textContent = 'A LITTLE FASTER EVERY TIME';
  $('#progress-label').textContent = 'EVERY SYMBOL. IN ORDER. DONE.';
  $('#result-time').textContent = seconds(game.elapsed);
  $('#result-kicker').textContent = result.personalBest ? 'YOU JUST RAISED THE BAR' : 'EVERY LAST TILE. CLEARED.';
  $('#result-title').textContent = result.personalBest ? 'New Personal Best!' : 'That was a rush.';
  $('#result-message').textContent = result.personalBest
    ? previousBest === undefined ? 'Your first record is on the board. This is just the beginning.' : `${seconds(previousBest - game.elapsed)}s faster. Your future self has a new time to chase.`
    : result.rank ? `Straight into your top three. A fresh #${result.rank} for the collection.` : 'A grid well cleared. Your personal best is waiting for a rematch.';
  resultPanel.hidden = false;
  restartButton.hidden = true;
  options.disabled = false;
  modes.disabled = false;
  orderSelect.disabled = false;
  $('#board-hint').textContent = 'Sharp eyes. Quick hands. Your next sequence is waiting.';
  $('#play-again').focus({ preventScroll: true });
  announce(`Grid cleared in ${seconds(game.elapsed)} seconds. ${result.personalBest ? 'New Personal Best!' : result.rank ? `New number ${result.rank} result.` : ''}`);
}

options.addEventListener('change', event => {
  if (game.state === 'playing' || !event.target.matches('input[name="grid-size"]')) return;
  selectedSize = Number(event.target.value);
  resetRound();
  announce(`${game.size} by ${game.size} selected. ${game.total} tiles. Ready to start.`);
});

modes.addEventListener('change', () => {
  if (game.state === 'playing') return;
  resetRound();
  announce(`${roundName()} selected. ${$('#mode-note').textContent}`);
});

orderSelect.addEventListener('change', () => {
  if (game.state === 'playing') return;
  resetRound();
  announce(`${roundName()} selected. ${sequenceNote()}`);
});

function activateTile(tile, keyboard = false) {
  if (!tile || tile.disabled || game.state !== 'playing') return;
  if (!game.click(Number(tile.dataset.index))) {
    wrongFeedback(tile);
    tile.classList.add('is-wrong');
    setTimeout(() => tile.classList.remove('is-wrong'), 220);
    $('#next-description').textContent = `Not yet. Find ${tileColor(game.next)?.name ?? game.next} first.`;
    announce(`Not yet. Find ${symbolName(game.next)} next.`);
    return;
  }
  tile.classList.remove('is-wrong');
  tile.disabled = true;
  tile.classList.add('clicked');
  tile.setAttribute('aria-label', `${symbolName(tile.dataset.value)}, cleared`);
  const check = document.createElement('span');
  check.className = 'tile-check';
  check.setAttribute('aria-hidden', 'true');
  check.innerHTML = '<svg class="icon"><use href="#icon-check"/></svg>';
  tile.append(check);
  renderProgress();
  renderNext();
  if (game.state === 'completed') {
    finishRound();
  } else {
    if (keyboard) {
      const remaining = [...board.querySelectorAll('button:not(:disabled)')];
      const next = remaining.find(button => Number(button.dataset.index) > Number(tile.dataset.index)) ?? remaining[0];
      next.focus({ preventScroll: true });
    }
    announce(`${game.progress} of ${game.total} cleared. Next: ${symbolName(game.next)}.`);
  }
}

// A consumed touch must not click a result button that appears under the finger.
// A new gesture clears suppression immediately; keyboard clicks stay available.
document.addEventListener('pointerdown', () => {
  suppressTouchClick = false;
}, true);

document.addEventListener('click', event => {
  if (!suppressTouchClick || event.detail === 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

board.addEventListener('pointerdown', event => {
  if (!['touch', 'pen'].includes(event.pointerType) || event.button !== 0 || game.state !== 'playing') return;
  const tile = event.target.closest('.tile');
  if (!tile) return;
  suppressTouchClick = true;
  // Count contact immediately and suppress compatibility mouse events.
  event.preventDefault();
  activateTile(tile);
});

board.addEventListener('click', event => {
  activateTile(event.target.closest('.tile'), event.detail === 0);
});

board.addEventListener('keydown', event => {
  const direction = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: game.size, ArrowUp: -game.size }[event.key];
  if (direction === undefined || game.state !== 'playing' || !event.target.matches('.tile')) return;
  event.preventDefault();
  const index = Number(event.target.dataset.index);
  for (let step = 1; step <= board.children.length; step += 1) {
    const next = (index + direction * step % board.children.length + board.children.length) % board.children.length;
    if (board.children[next].matches('button:not(:disabled)')) {
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
  modes.querySelector('input:checked').focus();
  announce('Choose your next sequence and grid size.');
});

resetRound();
