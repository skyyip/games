// Optional regression checks for immediate touch input and stable tile geometry.
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseURL = process.env.GRID_RUSH_URL || 'http://localhost:5173/grid-rush/';
let failures = 0;
let checks = 0;

async function check(name, run) {
  try {
    await run();
    checks += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function geometry(page) {
  return page.locator('#board').evaluate(board => {
    const origin = board.getBoundingClientRect();
    return [...board.children].map(tile => {
      const rect = tile.getBoundingClientRect();
      return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
    });
  });
}

function assertStable(before, after) {
  for (let index = 0; index < before.length; index += 1) {
    for (const key of ['x', 'y', 'width', 'height']) {
      assert.ok(Math.abs(before[index][key] - after[index][key]) < 0.5,
        `Tile ${index + 1} ${key} moved from ${before[index][key]} to ${after[index][key]}`);
    }
  }
}

try {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);

  await check('touch counts on contact, before the finger is lifted, and only once', async () => {
    await page.locator('#start').click();
    const tile = page.locator('.tile').first();
    await tile.scrollIntoViewIfNeeded();
    const bounds = await tile.boundingBox();
    const protocol = await context.newCDPSession(page);
    let touching = false;
    try {
      await protocol.send('Input.dispatchTouchEvent', {
        type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }],
      });
      touching = true;
      assert.equal(await page.locator('#progress').textContent(), '1');
      await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      touching = false;
      assert.equal(await page.locator('#progress').textContent(), '1');
      await tile.dispatchEvent('click');
      assert.equal(await page.locator('#progress').textContent(), '1');
    } finally {
      if (touching) await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await protocol.detach();
      await page.locator('#restart').click();
    }
  });

  await check('a cleared 6×6 tile does not resize its row or neighboring tiles', async () => {
    await page.locator('.grid-option:has(input[value="6"])').click();
    await page.locator('#start').click();
    const before = await geometry(page);
    await page.locator('.tile').nth(7).tap();
    await page.waitForTimeout(220);
    assertStable(before, await geometry(page));
  });

  await check('tile dimensions stay fixed during press feedback', async () => {
    const before = await geometry(page);
    await page.locator('.tile').nth(8).tap();
    for (let frame = 0; frame < 4; frame += 1) {
      assertStable(before, await geometry(page));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    }
  });

  await page.locator('#restart').click();
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 812 });
    for (const size of [3, 4, 5, 6]) {
      await check(`${size}×${size} at ${width}px keeps every tile fixed as each row is cleared`, async () => {
        await page.locator(`.grid-option:has(input[value="${size}"])`).click();
        await page.locator('#start').click();
        const before = await geometry(page);
        for (let row = 0; row < size; row += 1) {
          await page.locator('.tile').nth(row * size + row).tap();
          assertStable(before, await geometry(page));
        }
      });
      await page.locator('#restart').click();
    }
  }

  await check('two simultaneous fingers each count once on contact', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('.grid-option:has(input[value="3"])').click();
    await page.locator('#start').click();
    await page.locator('#board').scrollIntoViewIfNeeded();
    const first = await page.locator('.tile').nth(0).boundingBox();
    const second = await page.locator('.tile').nth(1).boundingBox();
    const protocol = await context.newCDPSession(page);
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { id: 1, x: first.x + first.width / 2, y: first.y + first.height / 2 },
      { id: 2, x: second.x + second.width / 2, y: second.y + second.height / 2 },
    ] });
    assert.equal(await page.locator('#progress').textContent(), '2');
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await page.locator('#progress').textContent(), '2');
    await protocol.detach();
    await page.locator('#restart').click();
  });

  await check('the final touch stops timing before release and cannot trigger replay', async () => {
    await page.locator('#start').click();
    for (let index = 0; index < 8; index += 1) {
      await page.locator('.tile').nth(index).tap();
      assert.equal(await page.locator('#progress').textContent(), String(index + 1));
    }
    const finalTile = page.locator('.tile').nth(8);
    await finalTile.scrollIntoViewIfNeeded();
    const bounds = await finalTile.boundingBox();
    const protocol = await context.newCDPSession(page);
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
    ] });
    assert.equal(await page.locator('#progress').textContent(), '9', 'the final contact must clear tile 9');
    assert.equal(await page.locator('#result').isVisible(), true, 'results must appear on the final contact');
    const time = await page.locator('#timer').textContent();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#timer').textContent(), time);
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await page.locator('#result').isVisible(), true,
      `lifting the final finger must not start a new round; progress=${await page.locator('#progress').textContent()}`);
    assert.equal(await page.locator('#progress').textContent(), '9');
    await protocol.detach();
    await page.locator('#play-again').tap();
    assert.equal(await page.locator('#result').isHidden(), true);
    assert.equal(await page.locator('#progress').textContent(), '0');
  });

  assert.deepEqual(errors, []);
  await context.close();
} finally {
  await browser.close();
}

console.log(`\n${checks} touch checks passed; ${failures} failed.`);
if (failures) process.exitCode = 1;
