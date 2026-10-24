// Shape-mode end-to-end QA with the repository's optional Playwright installation.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel:'chrome',headless:true});
const base = process.env.GRID_RUSH_URL || 'http://localhost:5174/grid-rush-in-order/';
const output = process.env.GRID_RUSH_SCREENSHOTS || '/tmp/grid-rush-shapes-qa';
const errors = [];
let checks = 0;
const pass = message => {checks++;console.log(`PASS ${message}`);};
const key = 'grid-rush-in-order.records.v1';
async function setup(language, options={}) {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',...options});
 await context.addInitScript(lang=>{localStorage.setItem('playground.language.v1',lang);},language);
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('input[value="shapes"]').check();
 return {context,page};
}
const shapes=page=>page.locator('#color-sequence li').evaluateAll(items=>items.map(item=>item.dataset.shape));
async function finish(page,touch=false) {
 while(await page.locator('#result').isHidden()) {
  const shape=await page.locator('#next-symbol').getAttribute('data-shape');
  const remaining=page.locator(`.tile[data-shape="${shape}"]:not(:disabled)`);
  assert.ok(await remaining.count()>0);
  // Reverse DOM order proves the group does not require a particular cell order.
  while(await remaining.count()) {
   if(touch)await remaining.last().tap();
   else await remaining.last().press('Enter');
  }
 }
}
try {
 await mkdir(output,{recursive:true});
 for(const language of ['zh-Hant','en']) {
  const {context,page}=await setup(language);
  assert.equal(await page.locator('input[value="shapes"]').isChecked(),true);
  assert.equal(await page.locator('#order-control').isHidden(),true);
  assert.equal(await page.locator('#grid-options').isVisible(),true);
  assert.equal(await page.locator('#color-key-title').textContent(),language==='zh-Hant'?'依照形狀順序':'FOLLOW THE SHAPES');
  for(const size of [3,4,5,6]) {
   await page.locator(`input[name="grid-size"][value="${size}"]`).check();
   const preview=await shapes(page);
   assert.equal(new Set(preview).size,4);
   assert.equal(await page.locator('.tile .shape-icon').count(),size**2);
   assert.match(await page.locator('#size-description').textContent(),language==='zh-Hant'?/四種隨機形狀/:/Four random shapes/);
   await page.locator('#start').click();assert.deepEqual(await shapes(page),preview);
   assert.equal(await page.locator('#mode-options input').first().isDisabled(),true);
   const first=preview[0],wrong=page.locator(`.tile:not([data-shape="${first}"])`).first();
   await wrong.click();assert.equal(await page.locator('#progress').textContent(),'0');
   assert.match(await page.locator('#next-description').textContent(),language==='zh-Hant'?/還未輪到/:/Not yet/);
   const before=await page.locator('.tile').evaluateAll(tiles=>tiles.map(tile=>{const r=tile.getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height];}));
   await page.locator(`.tile[data-shape="${first}"]`).last().press('Enter');
   assert.equal(await page.locator('#progress').textContent(),'1');
   // Synthetic duplicate activation must not advance progress.
   await page.locator('.tile:disabled').first().dispatchEvent('click');
   assert.equal(await page.locator('#progress').textContent(),'1');
   await finish(page);
   assert.equal(await page.locator('.tile.clicked .shape-icon').count(),size**2);
   assert.equal(await page.locator('.tile:disabled').count(),size**2);
   assert.equal(await page.locator('#color-sequence .is-cleared').count(),4);
   const after=await page.locator('.tile').evaluateAll(tiles=>tiles.map(tile=>{const r=tile.getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height];}));
   assert.deepEqual(after,before);
   assert.match(await page.locator('#result-title').textContent(),language==='zh-Hant'?/紀錄|痛快/:/Best|rush/);
   const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
   assert.equal(saved[`shapes-${size}`].length,1);
   assert.equal(saved[`colors-${size}`].length,0);
   await page.locator('#change-grid').click();
   pass(`${language} ${size}x${size}: preview key, wrong/duplicate input, full keyboard round, stable cells and separate record`);
  }
  const saved=await page.evaluate(k=>localStorage.getItem(k),key);
  await page.reload();await page.locator('input[value="shapes"]').check();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),saved);
  for(const width of [320,375,600,768,1440]) {
   await page.setViewportSize({width,height:900});
   const fit=await page.evaluate(()=>({
    page:document.documentElement.scrollWidth<=innerWidth,
    key:[...document.querySelectorAll('#color-sequence li')].every(el=>el.scrollWidth<=el.clientWidth),
    icons:[...document.querySelectorAll('.tile .shape-icon')].every(el=>{const r=el.getBoundingClientRect();return r.width>12&&Math.abs(r.width-r.height)<1;}),
   }));
   assert.ok(Object.values(fit).every(Boolean),JSON.stringify({width,fit}));
   if([375,1440].includes(width))await page.screenshot({path:`${output}/${language}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  await page.locator('input[value="colors"]').check();
  assert.equal(await page.locator('.tile-shape').count(),0);assert.equal(await page.locator('.tile-color').count(),9);
  pass(`${language}: records survive reload, phone/desktop SVG proportions and switching back to colours`);
  await context.close();
 }
 const mobile=await setup('zh-Hant',{viewport:{width:375,height:812},isMobile:true,hasTouch:true});
 await mobile.page.locator('#start').tap();await finish(mobile.page,true);
 assert.equal(await mobile.page.locator('#result').isVisible(),true);
 await mobile.page.locator('#play-again').tap();assert.equal(await mobile.page.locator('#progress').textContent(),'0');
 await mobile.page.locator('#restart').tap();assert.equal(await mobile.page.locator('#timer').textContent(),'00.00');
 await mobile.context.close();pass('real touch completion, deliberate replay and reset');

 const offline=await setup('zh-Hant',{serviceWorkers:'allow'});
 await offline.page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('可以離線遊玩了'));
 await offline.page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 await offline.context.setOffline(true);await offline.page.reload();
 await offline.page.locator('input[value="shapes"]').check();await offline.page.locator('#start').click();await finish(offline.page);
 assert.equal(await offline.page.locator('#result').isVisible(),true);
 await offline.context.close();pass('Chinese shape mode loads and completes a full round offline');
 assert.deepEqual(errors,[]);pass('no uncaught errors throughout shape rounds, replay and offline play');
 console.log(`\n${checks} shape browser checks passed.`);
} finally {await browser.close();}
