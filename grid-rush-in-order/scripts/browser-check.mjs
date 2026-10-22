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
    const next = await page.locator('#next-symbol').getAttribute('data-value');
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
  assert.equal(Object.keys(data).length, 20);
  assert.equal(Object.values(data).filter(records => records.length === 1).length, 7);
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

  const alphanumericSequence = [...'0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'];
  for (const order of ['ascending', 'descending']) {
    await selectMode(page, 'alphanumeric');
    await page.locator('#sort-order').selectOption(order);
    assert.equal(await page.locator('#board').getAttribute('data-size'), '8');
    assert.equal(await page.locator('.tile').count(), 62);
    assert.equal(await page.locator('.empty-tile').count(), 2);
    await page.locator('#start').click();
    assert.equal(await page.locator('#sort-order').isDisabled(), true);
    const expected = order === 'ascending' ? alphanumericSequence : [...alphanumericSequence].reverse();
    await tileFor(page, expected[1]).click();
    assert.equal(await page.locator('#progress').textContent(), '0');
    const before = await geometry(page);
    await tileFor(page, expected[0]).click();
    const cleared = tileFor(page, expected[0]);
    assert.equal(await cleared.locator('.tile-number').textContent(), expected[0]);
    assert.equal(await cleared.locator('.tile-check').count(), 1);
    const opacity = await cleared.evaluate(el => Number(getComputedStyle(el).opacity));
    assert.ok(opacity > 0.4 && opacity < 1);
    stable(before, await geometry(page));
    await cleared.dispatchEvent('click');
    assert.equal(await page.locator('#progress').textContent(), '1');
    for (const value of expected.slice(1)) {
      assert.equal(await page.locator('#next-symbol').textContent(), value);
      await tileFor(page, value).click();
    }
    assert.equal(await page.locator('.tile.clicked .tile-check').count(), 62);
    const labels = await page.locator('.tile-number').allTextContents();
    assert.deepEqual(labels.sort(), [...alphanumericSequence].sort());
    const regions = await page.evaluate(() => ({ board:document.querySelector('#board').getBoundingClientRect().bottom,result:document.querySelector('#result').getBoundingClientRect().top }));
    assert.ok(regions.result > regions.board, 'results must leave the cleared board visible');
    await page.screenshot({ path:`${output}/alphanumeric-${order}-completed.png`,fullPage:true,animations:'disabled' });
    await page.locator('#change-grid').click();
    pass(`62-symbol ${order}: exact case order, retained labels, faded ticked tiles and results below the board`);
  }

  for (const size of [3,4,5,6]) {
    await selectMode(page, 'numbers');
    await page.locator(`.grid-option:has(input[value="${size}"])`).click();
    await page.locator('#sort-order').selectOption('descending');
    assert.equal(await page.locator('#next-symbol').textContent(), String(size**2));
    await page.locator('#start').click();
    await finish(page);
    assert.equal(await page.locator('#progress').textContent(),String(size**2));
    await page.locator('#change-grid').click();
    pass(`${size}×${size}: descending numeric round completes`);
  }
  for (const mode of ['lowercase','uppercase','mixed']) {
    await selectMode(page,mode);
    await page.locator('#sort-order').selectOption('descending');
    assert.equal((await page.locator('#next-symbol').textContent()).toLowerCase(),'z');
    await page.locator('#start').click();
    await finish(page, mode === 'uppercase' ? 'keyboard' : 'click');
    assert.equal(await page.locator('#progress').textContent(),'26');
    await page.locator('#change-grid').click();
    pass(`${mode}: descending alphabet round completes`);
  }

  for (const size of [3,4,5,6]) {
    await selectMode(page,'colors');
    await page.locator(`.grid-option:has(input[value="${size}"])`).click();
    assert.equal(await page.locator('#order-control').isHidden(),true);
    const previewColors = await page.locator('#color-sequence li').evaluateAll(items => items.map(item=>item.dataset.color));
    await page.locator('#start').click();
    const colors = await page.locator('#color-sequence li').evaluateAll(items => items.map(item=>item.dataset.color));
    assert.deepEqual(colors,previewColors,'starting must preserve the colour key shown in setup');
    assert.equal(new Set(colors).size,4);
    const first = colors[0];
    const wrong = page.locator(`.tile:not([data-color="${first}"])`).first();
    await wrong.click();
    assert.equal(await page.locator('#progress').textContent(),'0');
    const before = await geometry(page);
    const selected = page.locator(`.tile[data-color="${first}"]`).last();
    const name = await selected.locator('.tile-number').textContent();
    const background = await selected.evaluate(el=>getComputedStyle(el).backgroundColor);
    await selected.click();
    assert.equal(await selected.locator('.tile-number').textContent(),name);
    assert.equal(await selected.evaluate(el=>getComputedStyle(el).backgroundColor),background);
    assert.equal(await selected.locator('.tile-check').count(),1);
    stable(before,await geometry(page));
    while (await page.locator('#next-symbol').getAttribute('data-color') === first) {
      await page.locator(`.tile[data-color="${first}"]:not(:disabled)`).last().click();
      stable(before,await geometry(page));
    }
    assert.equal(await page.locator('#color-sequence li').first().getAttribute('class'),'is-cleared');
    assert.equal(await page.locator('#color-sequence li[aria-current="step"]').getAttribute('data-color'),colors[1]);
    if (size===6) await page.screenshot({path:`${output}/colors-playing.png`,fullPage:true,animations:'disabled'});
    await finish(page);
    assert.equal(await page.locator('.tile-check').count(),size**2);
    await page.locator('#change-grid').click();
    pass(`${size}×${size}: random four-colour key, arbitrary tiles within each group and retained colour labels`);
  }
  const allRecords = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(Object.keys(allRecords).length,20);
  assert.ok(Object.values(allRecords).every(records=>records.length===1));
  for (const legacyKey of ['numbers-3','numbers-4','numbers-5','numbers-6','lowercase','uppercase','mixed']) {
    assert.deepEqual(allRecords[legacyKey],data[legacyKey]);
  }
  await page.reload();
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),allRecords);
  pass('all twenty challenge records persist independently and retain every earlier ascending score');

  for (const width of [320, 375, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ['mixed','alphanumeric','colors']) {
      await selectMode(page,mode);
    const layout = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      cells: [...document.querySelectorAll('#board > *')].map(el => {
        const r = el.getBoundingClientRect(); return [r.width, r.height];
      }),
    }));
    assert.ok(layout.scroll <= layout.width, `horizontal overflow at ${width}px`);
    assert.ok(layout.cells.every(([w, h]) => Math.abs(w - h) < 1));
    if (mode==='alphanumeric') assert.ok(layout.cells.every(([w])=>w>=24),'dense-board touch targets must remain at least 24px');
    if ([320,375,768].includes(width)) await page.screenshot({path:`${output}/${mode}-${width}.png`,fullPage:true,animations:'disabled'});
    }
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
  await touchPage.locator('#restart').tap();
  await selectMode(touchPage,'alphanumeric');
  await touchPage.locator('#start').tap();
  await finish(touchPage,'tap');
  assert.equal(await touchPage.locator('.tile-check').count(),62);
  assert.equal(await touchPage.locator('#progress').textContent(),'62');
  await touchPage.locator('#change-grid').tap();
  await selectMode(touchPage,'colors');
  await touchPage.locator('#start').tap();
  await finish(touchPage,'tap');
  assert.equal(await touchPage.locator('#progress').textContent(),'9');
  await mobile.close();
  pass('62-symbol and colour rounds complete with real touch input');
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
