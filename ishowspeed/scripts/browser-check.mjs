// Optional browser QA. Playwright is a development tool, never an app dependency.
// GRID_RUSH_PLAYWRIGHT_MODULE can point to an existing Playwright installation.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseURL = process.env.GRID_RUSH_URL || 'http://localhost:5173';
const output = process.env.GRID_RUSH_SCREENSHOTS || '/tmp/grid-rush-qa';
await mkdir(output, { recursive: true });
let checks = 0;
const pass = message => { checks += 1; console.log(`PASS ${message}`); };

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto(baseURL);
  await page.locator('#start').waitFor();
  assert.equal(await page.locator('.tile').count(), 9);
  assert.equal(await page.locator('.tile:disabled').count(), 9);
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#timer').textContent(), '00.00');
  await page.screenshot({ path: `${output}/desktop-idle.png`, fullPage: true });
  pass('idle has 9 disabled tiles and a stopped timer');

  for (const size of [3, 4, 5, 6]) {
    await page.locator(`.grid-option:has(input[value="${size}"])`).click();
    assert.equal(await page.locator('.tile').count(), size * size);
    await page.locator('#start').click();
    await page.waitForTimeout(100);
    assert.notEqual(await page.locator('#timer').textContent(), '00.00');
    assert.equal(await page.locator('input[name="grid-size"]').first().isDisabled(), true);
    await page.locator('.tile').first().click();
    // A real disabled button ignores further clicks, including synthetic dispatch.
    await page.locator('.tile').first().dispatchEvent('click');
    assert.equal(await page.locator('#progress').textContent(), '1');
    for (let index = 1; index < size * size; index += 1) {
      await page.locator('.tile').nth(index).click();
    }
    assert.equal(await page.locator('#result').isVisible(), true);
    assert.equal(await page.locator('#progress').textContent(), String(size * size));
    assert.equal(await page.locator('.tile:disabled').count(), size * size);
    const final = await page.locator('#timer').textContent();
    await page.waitForTimeout(80);
    assert.equal(await page.locator('#timer').textContent(), final);
    assert.equal(await page.locator('#result-title').textContent(), 'New Personal Best!');
    assert.equal(await page.locator('.new-record-badge').count(), 1);
    await page.locator('#change-grid').click();
    assert.equal(await page.locator('#timer').textContent(), '00.00');
    assert.equal(await page.locator('#progress').textContent(), '0');
    pass(`${size}×${size}: unique clicks, timer start/stop, completion, new record, reset`);
  }

  const saved = await page.evaluate(() => localStorage.getItem('grid-rush.records.v1'));
  await page.reload();
  assert.equal(await page.evaluate(() => localStorage.getItem('grid-rush.records.v1')), saved);
  for (const size of [3, 4, 5, 6]) {
    await page.locator(`.grid-option:has(input[value="${size}"])`).click();
    assert.equal(await page.locator('.record-empty').count(), 2);
  }
  pass('all four independent records persist after reload');

  await page.locator('.grid-option:has(input[value="3"])').click();
  await page.locator('#start').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.tile').first().evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.tile').nth(1).evaluate(element => element === document.activeElement), true);
  for (let index = 0; index < 9; index += 1) await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
  assert.equal(await page.locator('#result').isVisible(), true);
  assert.equal(await page.locator('#play-again').evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#result').isHidden(), true);
  assert.equal(await page.locator('#progress').textContent(), '0');
  await page.locator('#restart').click();
  assert.equal(await page.locator('#timer').textContent(), '00.00');
  assert.equal(await page.locator('#start').isVisible(), true);
  pass('keyboard arrows, Enter/Space completion, replay, and in-game restart');

  for (const width of [320, 375, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.grid-option:has(input[value="6"])').click();
    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      tiles: [...document.querySelectorAll('.tile')].map(tile => {
        const { width, height } = tile.getBoundingClientRect();
        return { width, height };
      }),
    }));
    assert.ok(layout.document <= layout.viewport, `No horizontal overflow at ${width}px`);
    assert.ok(layout.tiles.every(tile => Math.abs(tile.width - tile.height) < 1), `Square tiles at ${width}px`);
    if ([320, 375, 768].includes(width)) {
      await page.screenshot({ path: `${output}/idle-${width}.png`, fullPage: true });
    }
    pass(`${width}px: grid fits and every 6×6 tile stays square`);
  }

  for (const width of [320, 375]) {
    const mobile = await browser.newContext({ viewport: { width, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const mobilePage = await mobile.newPage();
    mobilePage.on('pageerror', error => errors.push(error.message));
    await mobilePage.goto(baseURL);
    await mobilePage.locator('a[href="#how-to-play"]').tap();
    assert.equal(await mobilePage.locator('#how-to-play').evaluate(element => element.open), true);
    await mobilePage.locator('#start').tap();
    for (let index = 0; index < 9; index += 1) await mobilePage.locator('.tile').nth(index).tap();
    assert.equal(await mobilePage.locator('#result').isVisible(), true);
    const fit = await mobilePage.evaluate(() => {
      const panel = document.querySelector('#result').getBoundingClientRect();
      const action = document.querySelector('#change-grid').getBoundingClientRect();
      const icon = document.querySelector('.result-icon').getBoundingClientRect();
      return { top: panel.top, bottom: panel.bottom, actionBottom: action.bottom, iconTop: icon.top };
    });
    assert.ok(fit.iconTop >= fit.top && fit.actionBottom <= fit.bottom, `Result contents fit at ${width}px: ${JSON.stringify(fit)}`);
    await mobilePage.locator('#result').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    await mobilePage.screenshot({ path: `${output}/mobile-result-${width}.png`, fullPage: true });
    await mobilePage.locator('#play-again').tap();
    assert.equal(await mobilePage.locator('#result').isHidden(), true);
    await mobile.close();
    pass(`${width}px touch: instructions, full round, result fits, and replay`);
  }

  const denied = await browser.newContext();
  await denied.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  const deniedPage = await denied.newPage();
  deniedPage.on('pageerror', error => errors.push(error.message));
  await deniedPage.goto(baseURL);
  assert.match(await deniedPage.locator('#storage-note').textContent(), /unavailable/);
  await deniedPage.locator('#start').click();
  for (let index = 0; index < 9; index += 1) await deniedPage.locator('.tile').nth(index).click();
  assert.equal(await deniedPage.locator('#result').isVisible(), true);
  assert.equal(await deniedPage.locator('.record-empty').count(), 2);
  await denied.close();
  pass('blocked browser storage preserves fully playable rounds and session records');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.tile').first().evaluate(element => getComputedStyle(element).animationName), 'none');
  assert.deepEqual(errors, []);
  pass('reduced motion respected; no uncaught browser errors');
  assert.ok(requests.some(url => url.endsWith('/assets/fonts/SpaceGrotesk.ttf')));
  assert.ok(requests.some(url => url.endsWith('/assets/fonts/DMSans.ttf')));
  assert.ok(requests.every(url => new URL(url).origin === new URL(baseURL).origin));
  pass('bundled fonts load and the application makes no external network requests');
  await context.close();
  console.log(`\n${checks} browser checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
