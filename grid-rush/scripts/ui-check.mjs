// Shared UI regression checks. Requires an existing Playwright installation.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseURL = process.env.PLAYGROUND_URL || 'http://localhost:5173/';
const output = process.env.PLAYGROUND_SCREENSHOTS || '/tmp/skys-playground-qa';
const games = ['grid-rush/', 'grid-rush-in-order/', 'tap-and-spill/', 'line-up/', 'pikmin-fling/', 'just-a-sec/', 'roach-rush/', 'stone-skip/','balance-bridge/','pot-toss/','marble-maze/','floating-balance/','flick-force/','memory-trace/','dice-party/','poker-party/','mahjong-match/','beat-bad-luck/','bun-rush/'];
const errors = [];
let checks = 0;
const pass = text => { checks += 1; console.log(`PASS ${text}`); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const silenceAnalytics = context => context.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType:'text/javascript', body:'' }));
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await silenceAnalytics(context);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  assert.equal(await page.title(), 'Your Playground.');
  assert.equal(await page.locator('.card').count(), 19);
  const manifest = await context.request.get(new URL(await page.locator('link[rel="manifest"]').getAttribute('href'), baseURL).href).then(r => r.json());
  assert.equal(manifest.name, 'Sky’s Playground');
  assert.equal(new URL(manifest.start_url, new URL('grid-rush/playground.webmanifest', baseURL)).href, baseURL);
  await page.locator('.card').evaluateAll(cards => Promise.all(cards.flatMap(card => card.getAnimations().map(animation => animation.finished))));
  await page.screenshot({ path: `${output}/landing-desktop.png`, fullPage: true, animations: 'disabled' });
  pass('landing name, manifest and all nineteen games are present');

  const expectedIcon = hash(await readFile(new URL('../assets/icons/apple-touch-icon.png', import.meta.url)));
  for (const path of ['', ...games]) {
    await page.goto(new URL(path, baseURL).href);
    assert.match(await page.title(), path ? (['stone-skip/','balance-bridge/','pot-toss/','marble-maze/','floating-balance/','flick-force/','memory-trace/','dice-party/','poker-party/','mahjong-match/','beat-bad-luck/','bun-rush/'].includes(path) ? /^(?:Stone Skip|Little Balance|Pot Luck|Marble & Mist|Float & Balance|Flick Force|Memory Trace|Dice & Delight|Pocket Poker|Mahjong Match|Beat the Bad Luck|Cheung Chau Bun Rush) · Your Playground\.$/ : /Sky’s Playground/) : /^Your Playground\.$/);
    const icon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    const response = await context.request.get(new URL(icon, page.url()).href);
    assert.equal(response.status(), 200);
    assert.equal(hash(await response.body()), expectedIcon);
    const manifestURL = new URL(await page.locator('link[rel="manifest"]').getAttribute('href'), page.url());
    const manifest = await context.request.get(manifestURL.href).then(r => r.json());
    for (const icon of manifest.icons) {
      assert.equal((await context.request.get(new URL(icon.src, manifestURL).href)).status(), 200);
    }
    if (path) {
      assert.equal(await page.locator('.playground-home').count(), 1);
      const link = await page.locator('.playground-home').getAttribute('href');
      assert.equal(new URL(link, page.url()).href, baseURL);
      await page.locator('.playground-home').click();
      await page.waitForURL(baseURL);
      assert.equal(await page.title(), 'Your Playground.');
    }
    pass(`${path || 'landing'}: shared title, supplied icon, valid install assets and home navigation`);
  }

  for (const width of [320, 375, 430, 600, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['', ...games]) {
      await page.goto(new URL(path, baseURL).href);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        width: document.documentElement.scrollWidth,
        columns: document.querySelector('.grid') && getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length,
        back: (() => { const r = document.querySelector('.playground-home')?.getBoundingClientRect(); return r && { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right }; })(),
        cells: [...document.querySelectorAll('#board > *')].map(tile => { const r=tile.getBoundingClientRect(); return [r.width,r.height]; }),
      }));
      assert.ok(layout.width <= layout.viewport, `${path}: overflow at ${width}px`);
      if (!path && width <= 600) assert.equal(layout.columns, 2);
      if (path) {
        assert.ok(layout.back.width >= 44 && layout.back.height >= 44);
        assert.ok(layout.back.x >= 0 && layout.back.right <= width && layout.back.y >= 0);
      }
      assert.ok(layout.cells.every(([w,h]) => Math.abs(w-h) < 1));
      if ([375,768].includes(width)) {
        await page.screenshot({ path: `${output}/${path.replaceAll('/','') || 'landing'}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
    }
    pass(`${width}px: all pages fit; home controls stay usable; mobile landing has two columns`);
  }

  const mobile = await browser.newContext({ viewport: { width:375,height:812 }, isMobile:true,hasTouch:true });
  await mobile.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await silenceAnalytics(mobile);
  await mobile.addInitScript(() => {
    window.haptics = [];
    Object.defineProperty(navigator, 'vibrate', { configurable:true,value:pattern => { window.haptics.push(pattern); return true; } });
  });
  const touchPage = await mobile.newPage();
  touchPage.on('pageerror', error => errors.push(error.message));
  await touchPage.goto(new URL('grid-rush-in-order/', baseURL).href);
  await touchPage.locator('#start').tap();
  const wrong = touchPage.locator('.tile[data-value="2"]');
  const before = await wrong.boundingBox();
  await wrong.tap();
  assert.equal(await touchPage.locator('#progress').textContent(), '0');
  assert.equal(await touchPage.evaluate(() => window.haptics.length), 1);
  assert.deepEqual(await touchPage.evaluate(() => window.haptics[0]), [35,25,35]);
  const after = await wrong.boundingBox();
  assert.equal(after.width, before.width);
  assert.equal(after.height, before.height);
  await touchPage.locator('.tile[data-value="1"]').tap();
  assert.equal(await touchPage.locator('#progress').textContent(), '1');
  assert.equal(await touchPage.evaluate(() => window.haptics.length), 1);
  pass('wrong selection vibrates once without advancing; correct selection does not vibrate or resize tiles');

  await touchPage.goto(new URL('tap-and-spill/', baseURL).href);
  await touchPage.setViewportSize({ width:375,height:568 });
  for (let i=0;i<4;i+=1) await touchPage.locator('#plus').tap();
  assert.equal(await touchPage.locator('#rows input').count(), 6);
  await touchPage.locator('#rows input').last().fill('Test six');
  await touchPage.locator('#setup').evaluate(panel => { panel.scrollTop = 0; });
  const protocol = await mobile.newCDPSession(touchPage);
  await protocol.send('Input.dispatchTouchEvent', { type:'touchStart',touchPoints:[{x:367,y:480}] });
  for (let step=1;step<=5;step+=1) {
    await protocol.send('Input.dispatchTouchEvent', { type:'touchMove',touchPoints:[{x:367,y:480-step*70}] });
    await touchPage.waitForTimeout(16);
  }
  await protocol.send('Input.dispatchTouchEvent', { type:'touchEnd',touchPoints:[] });
  assert.ok(await touchPage.locator('#setup').evaluate(panel => panel.scrollTop > 0), 'six-player setup must allow a native vertical swipe');
  pass('six-player setup can be scrolled with a real touch gesture on a short phone screen');
  await touchPage.locator('#start').tap();
  await touchPage.locator('#go').tap();
  const bounds = await touchPage.locator('#touch').boundingBox();
  await protocol.send('Input.dispatchTouchEvent', { type:'touchStart',touchPoints:[{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}] });
  await touchPage.waitForTimeout(40);
  await protocol.send('Input.dispatchTouchEvent', { type:'touchEnd',touchPoints:[] });
  assert.match(await touchPage.locator('#hint').textContent(), /Too short!/);
  assert.equal(await touchPage.evaluate(() => window.haptics.length), 1);
  assert.equal(await touchPage.locator('.playground-home').count(), 1);
  pass('Tap & Spill supports six mobile players and gives haptic feedback on an invalid short pour');
  await protocol.detach();
  await mobile.close();

  const noHaptics = await browser.newContext({ reducedMotion:'reduce' });
  await noHaptics.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await silenceAnalytics(noHaptics);
  await noHaptics.addInitScript(() => Object.defineProperty(navigator,'vibrate',{value:undefined}));
  const quiet = await noHaptics.newPage();
  quiet.on('pageerror', error => errors.push(error.message));
  await quiet.goto(baseURL);
  assert.equal(await quiet.locator('.card').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  await quiet.goto(new URL('grid-rush-in-order/',baseURL).href);
  await quiet.locator('#start').click();
  await quiet.locator('.tile[data-value="2"]').click();
  assert.equal(await quiet.locator('#progress').textContent(),'0');
  assert.equal(await quiet.locator('.tile-number').first().evaluate(el => getComputedStyle(el).animationName),'none');
  await noHaptics.close();
  pass('reduced-motion settings and missing vibration support are handled safely');

  assert.deepEqual(errors,[]);
  pass('no uncaught errors across navigation, mobile layouts and feedback');
  await context.close();
  console.log(`\n${checks} shared UI checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
