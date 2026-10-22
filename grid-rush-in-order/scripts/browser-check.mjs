// Optional QA using an existing Playwright installation; no runtime dependency.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseURL = process.env.GRID_RUSH_URL || 'http://localhost:5174/grid-rush-in-order/';
const output = process.env.GRID_RUSH_SCREENSHOTS || '/tmp/grid-rush-in-order-qa';
const key = 'grid-rush-in-order.records.v1';
await mkdir(output, { recursive: true });
let checks = 0;
const pass = message => { checks += 1; console.log(`PASS ${message}`); };
const tileFor = (page, value) => page.locator(`.tile[data-value="${value}"]`);
async function selectMode(page, mode) {
  await page.locator(`.mode-option:has(input[value="${mode}"])`).click();
}
async function finish(page, method = 'click') {
  while (await page.locator('#result').isHidden()) {
    const next = await page.locator('#next-symbol').textContent();
    const tile = tileFor(page, next);
    if (method === 'keyboard') {
      await tile.focus();
      await page.keyboard.press(Number(await page.locator('#progress').textContent()) % 2 ? 'Space' : 'Enter');
    } else await tile[method]();
  }
}
async function geometry(page) {
  return page.locator('#board').evaluate(board => [...board.children].map(tile => {
    const r = tile.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }));
}
function stable(before, after) {
  before.forEach((tile, index) => Object.keys(tile).forEach(key => {
    assert.ok(Math.abs(tile[key] - after[index][key]) < 0.5, `cell ${index} ${key} changed`);
  }));
}
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  await page.locator('#start').waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('.tile:disabled').count(), 9);
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#timer').textContent(), '00.00');
  await page.screenshot({ path: `${output}/desktop-numbers.png`, fullPage: true });
  pass('idle has nine disabled number tiles and a stopped timer');

  for (const size of [3, 4, 5, 6]) {
    await page.locator(`.grid-option:has(input[value="${size}"])`).click();
    assert.equal(await page.locator('.tile').count(), size ** 2);
    await page.locator('#start').click();
    assert.equal(await page.locator('#mode-options input').first().isDisabled(), true);
    assert.equal(await page.locator('#grid-options input').first().isDisabled(), true);
    await page.waitForTimeout(90);
    assert.notEqual(await page.locator('#timer').textContent(), '00.00');
    await tileFor(page, '2').click();
    assert.equal(await page.locator('#progress').textContent(), '0');
    assert.match(await page.locator('#next-description').textContent(), /Find 1 first/);
    await tileFor(page, '1').click();
    await tileFor(page, '1').dispatchEvent('click');
    assert.equal(await page.locator('#progress').textContent(), '1');
    await finish(page);
    const time = await page.locator('#timer').textContent();
    await page.waitForTimeout(70);
    assert.equal(await page.locator('#timer').textContent(), time);
    assert.equal(await page.locator('#progress').textContent(), String(size ** 2));
    assert.equal(await page.locator('#result-title').textContent(), 'New Personal Best!');
    assert.equal(await page.locator('.record-new').count(), 1);
    await page.locator('#change-grid').click();
    assert.equal(await page.locator('#timer').textContent(), '00.00');
    pass(`${size}×${size}: wrong/repeated clicks, ordered completion, timer, records and reset`);
  }

  for (const mode of ['lowercase', 'uppercase', 'mixed']) {
    await selectMode(page, mode);
    assert.equal(await page.locator('#grid-options').isHidden(), true);
    assert.equal(await page.locator('.tile').count(), 26);
    assert.equal(await page.locator('.empty-tile').count(), 10);
    const labels = await page.locator('.tile').evaluateAll(tiles => tiles.map(tile => tile.dataset.value));
    assert.deepEqual(labels.map(value => value.toLowerCase()).sort(), [...'abcdefghijklmnopqrstuvwxyz']);
    if (mode === 'mixed') {
      assert.ok(labels.some(value => /[A-Z]/.test(value)) && labels.some(value => /[a-z]/.test(value)));
      await page.screenshot({ path: `${output}/desktop-mixed.png`, fullPage: true });
    }
    await page.locator('#start').click();
    const wrong = page.locator('.tile').filter({ has: page.locator('.tile-number', { hasText: /^[zZ]$/ }) });
    await wrong.click();
    assert.equal(await page.locator('#progress').textContent(), '0');
    await finish(page, mode === 'mixed' ? 'keyboard' : 'click');
    assert.equal(await page.locator('#progress').textContent(), '26');
    assert.equal(await page.locator('#play-again').evaluate(el => el === document.activeElement), true);
    await page.locator('#change-grid').click();
    pass(`${mode}: all 26 unique letters, blank cells, ordering and independent record`);
  }

  const saved = await page.evaluate(key => localStorage.getItem(key), key);
  const data = JSON.parse(saved);
  assert.equal(Object.keys(data).length, 7);
  assert.ok(Object.values(data).every(records => records.length === 1));
  await page.evaluate(() => localStorage.setItem('grid-rush.records.v1', 'original-game-sentinel'));
  await page.reload();
  assert.equal(await page.evaluate(key => localStorage.getItem(key), key), saved);
  assert.equal(await page.evaluate(() => localStorage.getItem('grid-rush.records.v1')), 'original-game-sentinel');
  await selectMode(page, 'mixed');
  assert.equal(await page.locator('.record-empty').count(), 2);
  pass('all seven record categories persist without modifying original-game storage');

  await page.locator('#start').focus();
  await page.keyboard.press('Enter');
  for (const arrow of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
    await page.keyboard.press(arrow);
    assert.equal(await page.evaluate(() => document.activeElement.matches('.tile:not(:disabled)')), true);
  }
  await page.locator('#restart').click();
  assert.equal(await page.locator('#progress').textContent(), '0');
  assert.equal(await page.locator('#timer').textContent(), '00.00');
  assert.equal(await page.locator('.tile:disabled').count(), 26);
  pass('keyboard navigation skips blanks; restarting stops timing and resets progress');

  for (const width of [320, 375, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      cells: [...document.querySelectorAll('#board > *')].map(el => {
        const r = el.getBoundingClientRect(); return [r.width, r.height];
      }),
    }));
    assert.ok(layout.scroll <= layout.width, `horizontal overflow at ${width}px`);
    assert.ok(layout.cells.every(([w, h]) => Math.abs(w - h) < 1));
    if ([320, 375, 768].includes(width)) await page.screenshot({ path: `${output}/mixed-${width}.png`, fullPage: true });
    pass(`${width}px: square cells and no horizontal overflow`);
  }

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const touchPage = await mobile.newPage();
  touchPage.on('pageerror', error => errors.push(error.message));
  await touchPage.goto(baseURL);
  await selectMode(touchPage, 'mixed');
  await touchPage.locator('#start').tap();
  await touchPage.locator('#board').scrollIntoViewIfNeeded();
  const before = await geometry(touchPage);
  const first = tileFor(touchPage, await touchPage.locator('#next-symbol').textContent());
  const bounds = await first.boundingBox();
  const protocol = await mobile.newCDPSession(touchPage);
  await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
  assert.equal(await touchPage.locator('#progress').textContent(), '1');
  stable(before, await geometry(touchPage));
  await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await touchPage.locator('#progress').textContent(), '1');
  for (let count = 1; count < 25; count += 1) {
    await tileFor(touchPage, await touchPage.locator('#next-symbol').textContent()).tap();
    stable(before, await geometry(touchPage));
  }
  const final = await tileFor(touchPage, await touchPage.locator('#next-symbol').textContent()).boundingBox();
  await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: final.x + final.width / 2, y: final.y + final.height / 2 }] });
  assert.equal(await touchPage.locator('#result').isVisible(), true);
  const time = await touchPage.locator('#timer').textContent();
  await touchPage.waitForTimeout(80);
  assert.equal(await touchPage.locator('#timer').textContent(), time);
  await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await touchPage.locator('#result').isVisible(), true);
  await protocol.detach();
  await touchPage.screenshot({ path: `${output}/mobile-result.png`, fullPage: true });
  await touchPage.locator('#play-again').tap();
  assert.equal(await touchPage.locator('#progress').textContent(), '0');
  await mobile.close();
  pass('touch counts on contact, never resizes cells, finishes before release, and replays deliberately');

  const denied = await browser.newContext();
  await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
  const deniedPage = await denied.newPage();
  deniedPage.on('pageerror', error => errors.push(error.message));
  await deniedPage.goto(baseURL);
  assert.match(await deniedPage.locator('#storage-note').textContent(), /unavailable/);
  await deniedPage.locator('#start').click();
  await finish(deniedPage);
  assert.equal(await deniedPage.locator('.record-empty').count(), 2);
  await denied.close();
  pass('unavailable storage keeps the game and session records working');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.tile').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.deepEqual(errors, []);
  pass('reduced motion respected and no uncaught browser errors');
  await context.close();
  console.log(`\n${checks} browser checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
