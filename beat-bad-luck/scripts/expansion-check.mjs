import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {WEAPONS,DECOR,weaponScoreMultiplier} from '../src/catalog.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const errors=[],kits=WEAPONS.filter(w=>w.expanded),decor=DECOR.filter(d=>d.expanded);
const click=(page,s)=>page.locator(s).evaluate(e=>e.click());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
const ordered=list=>[...list].sort((a,b)=>a.cost-b.cost||a.merit-b.merit).map(x=>x.id);
const kitOrder=ordered(WEAPONS.filter(w=>!w.starter&&w.id!=='rebirth-paper'));kitOrder.splice(-1,0,'rebirth-paper');
let checks=0;const pass=s=>{checks++;console.log(`PASS ${s}`);};
try{
 await mkdir('/tmp/bbl-expansion-qa',{recursive:true});
 for(const [width,language,motion]of [[320,'zh-Hant','reduce'],[375,'zh-Hant','no-preference'],[1440,'en','reduce']]){
  const context=await browser.newContext({viewport:{width,height:width<700?812:1100},isMobile:width<700,hasTouch:width<700,reducedMotion:motion,serviceWorkers:'block'});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  await context.addInitScript(language=>{localStorage.setItem('playground.language.v1',language);if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins:1000000,merit:1000000,owned:['flipflop'],equipped:'flipflop',decor:{},records:[],friends:[],lastSeen:Date.now()}));},language);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.deepEqual(await page.locator('[data-decor]').evaluateAll(nodes=>nodes.map(n=>n.dataset.decor)),ordered(DECOR));
  let total=0;
  for(const piece of DECOR){
   await page.locator(`[data-decor="${piece.id}"]`).click();total+=piece.cost;
   assert.equal((await saved(page)).coins,1000000-total);assert.equal(await page.locator(`[data-piece="${piece.id}"] svg`).count(),1);
   const row=page.locator(`[data-decor="${piece.id}"]`).locator('..');assert.match(await row.locator('b').textContent(),new RegExp(piece.nameZh&&language==='zh-Hant'?piece.nameZh.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):language==='en'?piece.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):'.'));
  }
  if(motion==='no-preference')await page.waitForTimeout(700);
  assert.equal(await page.locator('#stall-extension .stall-piece').count(),18);
  const boxes=await page.locator('.stall-piece').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.piece,l:r.left,r:r.right,t:r.top,b:r.bottom};}));
  for(const [i,a]of boxes.entries())for(const b of boxes.slice(i+1))assert.ok(Math.min(a.r,b.r)-Math.max(a.l,b.l)<=1||Math.min(a.b,b.b)-Math.max(a.t,b.t)<=1,`${a.id} overlaps ${b.id}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(new Set(await page.locator('#stall-extension svg').evaluateAll(nodes=>nodes.map(n=>n.innerHTML))).size,18);
  await page.locator('.stall-showcase').screenshot({path:`/tmp/bbl-expansion-qa/stall-${width}.png`});
  const first=decor[0];await page.locator(`[data-decor="${first.id}"]`).click();total+=first.cost*2;assert.equal(await page.locator(`[data-piece="${first.id}"]`).getAttribute('data-level'),'2');assert.equal(await page.locator('#stall-extension .stall-piece').count(),18);
  await click(page,'#tab-kits');assert.deepEqual(await page.locator('[data-weapon]').evaluateAll(nodes=>nodes.map(n=>n.dataset.weapon)),kitOrder);
  for(const kit of kits){
   const row=page.locator(`[data-weapon="${kit.id}"]`).locator('..');assert.equal(await row.locator('[data-collectible]').getAttribute('data-collectible'),kit.id);
   assert.equal(await row.locator('b').textContent(),language==='zh-Hant'?kit.nameZh:kit.name);assert.match(await row.textContent(),new RegExp(`×${weaponScoreMultiplier(kit.id)}`));
   await page.locator(`[data-weapon="${kit.id}"]`).click();total+=kit.cost;assert.equal((await saved(page)).coins,1000000-total);assert.equal((await saved(page)).equipped,kit.id);
  }
  assert.equal(new Set(await page.locator('#weapon-list [data-collectible]').evaluateAll(nodes=>nodes.map(n=>n.innerHTML))).size,30);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.goto(`${base}?lang=${language==='zh-Hant'?'en':'zh-Hant'}`);await page.locator('#start').waitFor();
  await page.waitForTimeout(50);assert.equal(await page.locator('[data-weapon="lassie"]').locator('..').locator('b').textContent(),language==='zh-Hant'?'Wonder dog Lassie':'神犬拉茜');
  await page.reload();await page.locator('#start').waitFor();assert.equal(await page.locator('#stall-extension .stall-piece').count(),18);assert.equal((await saved(page)).decor[first.id],2);assert.equal((await saved(page)).equipped,'immunity-token');
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await click(page,'#start');for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.fastForward(2050);await click(page,'#confirm-worry');await page.clock.fastForward(2050);
  await click(page,'[data-gesture="tap"]');await page.clock.runFor(20);assert.equal((await saved(page)).equipped,'bare-hand');assert.ok(!(await saved(page)).owned.includes('immunity-token'));assert.equal(await page.locator('#striking-weapon [data-collectible]').getAttribute('data-collectible'),'immunity-token');assert.ok(Number(await page.locator('#live-score').textContent())>=300);
  await page.clock.fastForward(45100);assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'tiger');await click(page,'#feed');await page.clock.fastForward(1600);assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'blessing');await click(page,'#bless');await page.clock.fastForward(1600);assert.equal(await page.locator('#result').isVisible(),true);assert.equal((await saved(page)).records[0].weapon,'immunity-token');
  await context.close();pass(`${width}px ${language}: all 48 additions, sorted prices, exact purchases, unique art, 27 nonoverlapping props, upgrades, translation switch, reload and one-use ×21 ritual`);
 }
 {
  const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:375,height:812},reducedMotion:'reduce'});await context.addInitScript(()=>{if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins:100000,merit:20000,owned:['immunity-token'],equipped:'immunity-token',decor:{'dragon-throne':1},lastSeen:Date.now()}));});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await context.setOffline(true);await page.reload();await page.locator('[data-piece="dragon-throne"] [data-collectible]').waitFor();assert.equal(await page.locator('#equipped-art [data-collectible]').getAttribute('data-collectible'),'immunity-token');await context.close();pass('offline reload includes expanded catalogue, prop artwork and saved throne/token');
 }
 assert.deepEqual(errors,[]);console.log(`${checks} expansion browser scenarios passed with no page errors.`);
}finally{await browser.close();}
