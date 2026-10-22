// Optional browser verification with an existing Playwright installation.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
// A temporary regular profile allows Chrome's actual installation checks;
// installation is intentionally unavailable in incognito browser contexts.
const profile = await mkdtemp(join(tmpdir(), 'grid-rush-in-order-pwa-'));
const context = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: true });
// Offline/gameplay checks do not send analytics events.
await context.route('https://www.googletagmanager.com/**', route => route.fulfill({contentType:'text/javascript',body:''}));
// Test the accessible fallback without leaving Chrome's native install UI open.
// CDP still checks actual manifest installability below.
await context.addInitScript(() => addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); event.stopImmediatePropagation();
}));
const browser = context.browser();
const baseURL = process.env.GRID_RUSH_URL || 'http://localhost:5174/grid-rush-in-order/';
let checks = 0;
const pass = message => { checks += 1; console.log(`PASS ${message}`); };

try {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL);
  const manifestURL = await page.locator('link[rel="manifest"]').getAttribute('href');
  const response = await context.request.get(new URL(manifestURL, baseURL).href);
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-type'], /application\/manifest\+json/);
  const manifest = await response.json();
  assert.equal(manifest.name, 'Grid Rush: In Order');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
  pass('install manifest declares a standalone app with required icon sizes');

  const icons = await page.evaluate(async () => {
    const manifest = await fetch(document.querySelector('link[rel="manifest"]').href).then(response => response.json());
    return Promise.all(manifest.icons.map(icon => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ sizes: icon.sizes, width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = reject;
      image.src = icon.src;
    })));
  });
  for (const icon of icons) assert.equal(icon.sizes, `${icon.width}x${icon.height}`);
  pass('all app icons load at their declared dimensions');

  await page.evaluate(async () => {
    await caches.open('grid-rush-app-sentinel');
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });
  assert.ok(await page.evaluate(async () => (await caches.keys()).includes('grid-rush-app-sentinel')));
  pass('service worker controls the page and preserves the original game’s cache');

  const protocol = await context.newCDPSession(page);
  const installation = await protocol.send('Page.getInstallabilityErrors');
  assert.deepEqual(installation.installabilityErrors, []);
  await protocol.detach();
  pass('Chrome reports no app installability errors');

  await page.locator('#install-app').click();
  assert.equal(await page.locator('#install-dialog').isVisible(), true);
  assert.match(await page.locator('#offline-status').textContent(), /ready.*offline/i);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#install-dialog').evaluate(dialog => dialog.open), false);
  await page.locator('#install-dialog').waitFor({ state:'hidden' });
  pass('installation action works with accessible browser instructions when needed');

  await context.setOffline(true);
  await page.reload();
  for (const mode of ['numbers', 'number-range', 'lowercase', 'uppercase', 'mixed', 'alphanumeric', 'colors']) {
    await page.locator(`.mode-option:has(input[value="${mode}"])`).click();
    for (const size of ['numbers','number-range','colors'].includes(mode) ? [3,4,5,6] : [6]) {
      if (['numbers','number-range','colors'].includes(mode)) await page.locator(`.grid-option:has(input[value="${size}"])`).click();
      for (const order of mode === 'colors' ? ['ascending'] : ['ascending','descending']) {
        if (mode !== 'colors') await page.locator('#sort-order').selectOption(order);
        await page.locator('#start').click();
        while (await page.locator('#result').isHidden()) {
          const next = await page.locator('#next-symbol').getAttribute('data-value');
          await page.locator(`.tile[data-value="${next}"]`).click();
        }
        assert.equal(await page.locator('#result').isVisible(),true);
        await page.locator('#change-grid').click();
      }
    }
  }
  const saved = await page.evaluate(() => localStorage.getItem('grid-rush-in-order.records.v1'));
  await page.reload();
  assert.equal(await page.evaluate(() => localStorage.getItem('grid-rush-in-order.records.v1')), saved);
  pass('offline reload supports all twenty-eight challenges and preserves records across another reload');

  const offlineTab = await context.newPage();
  offlineTab.on('pageerror', error => errors.push(error.message));
  await offlineTab.goto(baseURL);
  assert.equal(await offlineTab.locator('.tile').count(), 9);
  assert.equal(await offlineTab.locator('.record-empty').count(), 2);
  pass('a fresh tab can launch the cached app while the network is offline');

  const standalone = await browser.newContext();
  await standalone.route('https://www.googletagmanager.com/**', route => route.fulfill({contentType:'text/javascript',body:''}));
  await standalone.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => query === '(display-mode: standalone)' ? { matches: true } : original(query);
  });
  const standalonePage = await standalone.newPage();
  await standalonePage.goto(baseURL);
  assert.equal(await standalonePage.locator('#install-banner').isHidden(), true);
  await standalone.close();
  pass('installation promotion is hidden when running as an installed app');

  assert.deepEqual(errors, []);
  pass('no uncaught errors during installation setup or offline games');
  console.log(`\n${checks} web-app browser checks passed.`);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true });
}
