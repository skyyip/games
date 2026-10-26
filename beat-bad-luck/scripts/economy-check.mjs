import {buyAndContinue} from './purchase-helpers.mjs';
import {DURATIONS} from '../src/game.js';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {DECOR} from '../src/catalog.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const ids=['neon','incense','cat','radio','tiger','aquarium','three-stars','money-tree','amethyst'];
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(width=375,language='zh-Hant',motion='reduce'){
 const context=await browser.newContext({viewport:{width,height:width<700?812:1100},isMobile:width<700,hasTouch:width<700,reducedMotion:motion,serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(language=>{localStorage.setItem('playground.language.v1',language);if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins:300000,merit:1000,owned:['flipflop'],equipped:'flipflop',decor:{},friends:[],records:[],lastSeen:Date.now()}));},language);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);return {context,page};
}
const click=(p,s)=>p.locator(s).evaluate(e=>e.click());
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
async function beat(p){await click(p,'#start');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);await click(p,'#blow');await p.clock.fastForward(2050);await click(p,'#confirm-worry');await p.clock.fastForward(2050);assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'beat');}
try{
 await mkdir('/tmp/bbl-economy-qa',{recursive:true});
 for(const [width,language,motion]of [[320,'zh-Hant','reduce'],[375,'zh-Hant','no-preference'],[1440,'en','reduce']]){
  const {context,page}=await setup(width,language,motion);
  assert.deepEqual(await page.locator('[data-decor]').evaluateAll(nodes=>nodes.map(n=>n.dataset.decor)),[...DECOR].sort((a,b)=>a.cost-b.cost).map(d=>d.id));
  for(const [i,id]of ids.entries()){await buyAndContinue(page,`[data-decor="${id}"]`);assert.equal(await page.locator('.stall-piece').count(),i+1);}
  for(const id of ['cat','money-tree','amethyst'])for(let level=2;level<=5;level++){await buyAndContinue(page,`[data-decor="${id}"]`);assert.equal(await page.locator(`[data-piece="${id}"]`).getAttribute('data-level'),String(level));const prices=await page.locator('#decor-list [data-decor]').evaluateAll(nodes=>nodes.map(n=>parseInt(n.textContent,10)||Infinity));assert.ok(prices.every((price,i)=>i===0||price>=prices[i-1]));}
  if(motion==='no-preference')await page.waitForTimeout(700);
  assert.match(await page.locator('#idle-note').textContent(),/27\.72/);
  const boxes=await page.locator('.stall-piece').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.piece,l:r.left,r:r.right,t:r.top,b:r.bottom};}));
  for(const [i,a]of boxes.entries())for(const b of boxes.slice(i+1))assert.ok(Math.min(a.r,b.r)-Math.max(a.l,b.l)<=1||Math.min(a.b,b.b)-Math.max(a.t,b.t)<=1,`${a.id} overlaps ${b.id}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.stall-showcase').scrollIntoViewIfNeeded();await page.locator('.stall-showcase').screenshot({path:`/tmp/bbl-economy-qa/stall-${width}.png`});
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-piece="amethyst"]').waitFor();assert.equal(await page.locator('.stall-piece').count(),9);assert.equal((await saved(page)).decor.amethyst,5);
  await click(page,'#tab-kits');const text=await page.locator('#weapon-list').textContent();assert.ok(text.includes('×2.42')&&text.includes('×4.55'));assert.ok(!text.includes('{multiplier}'));if(language==='zh-Hant')assert.match(text,/解壓分數/);
  await context.close();pass(`${width}px ${language}: nine ordered incomes, instant props, three capped upgrades, nonoverlapping placement, 27.72/hr, reload and score labels`);
 }
 for(const language of ['zh-Hant','en']){
  const {context,page}=await setup(375,language);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await click(page,'#tab-kits');await buyAndContinue(page,'[data-weapon="paper"]');assert.equal((await saved(page)).coins,299755);
  await click(page,'#start');await click(page,'#pause');await click(page,'#quit');assert.ok((await saved(page)).owned.includes('paper'));
  await beat(page);await click(page,'#hit-zone');const first=await saved(page);assert.ok(first.owned.includes('paper'));assert.equal(first.weaponUses.paper,1);assert.equal(first.equipped,'paper');assert.equal(first.coins,299755);
  await page.clock.runFor(80);await click(page,'#hit-zone');await page.clock.runFor(20);assert.ok(Number(await page.locator('#live-score').textContent())>30);assert.equal((await saved(page)).coins,299755);
  await page.clock.fastForward(DURATIONS.beat+100);await click(page,'#feed');await page.clock.fastForward(1600);await click(page,'#bless');await page.clock.fastForward(1600);assert.equal(await page.locator('#result').isVisible(),true);
  const result=await saved(page);assert.equal(result.records[0].weapon,'paper');assert.equal(result.weaponUses.paper,1);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();assert.equal((await saved(page)).equipped,'paper');assert.equal((await saved(page)).weaponUses.paper,1);await beat(page);await click(page,'#hit-zone');assert.ok(!(await saved(page)).owned.includes('paper'));assert.equal((await saved(page)).equipped,'bare-hand');await page.clock.fastForward(80);await click(page,'#hit-zone');await click(page,'#pause');await click(page,'#quit');await click(page,'#tab-kits');const before=(await saved(page)).coins;await buyAndContinue(page,'[data-weapon="paper"]');assert.equal((await saved(page)).coins,before-245);
  await context.close();pass(`${language}: no-hit cancellation preserves kit; one use per ritual; first use survives completion/reload; second use breaks; repurchase charges full price`);
 }
 assert.deepEqual(errors,[]);console.log(`${checks} economy browser scenarios passed with no page errors.`);
}finally{await browser.close();}
