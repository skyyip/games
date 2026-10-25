import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const DAY=86400000,errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
const click=(page,selector)=>page.locator(selector).evaluate(element=>element.click());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
async function setup({width=375,language='zh-Hant',motion='reduce',coins=10000,freeze=true}={}){
 const context=await browser.newContext({viewport:{width,height:width<700?812:1100},isMobile:width<700,hasTouch:width<700,reducedMotion:motion,serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(({language,coins,freeze,DAY})=>{
  localStorage.setItem('playground.language.v1',language);window.__careNow=Number(localStorage.getItem('bbl.qa.now'))||Date.now();if(freeze)Date.now=()=>window.__careNow;
  const now=Date.now(),key='beat-bad-luck.stall.v1';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,coins,merit:2500,owned:['flipflop'],equipped:'flipflop',decor:{radio:1,neon:3,incense:1,cat:1,tiger:1,aquarium:1,'three-stars':1,'money-tree':2,amethyst:1},decorExpires:{radio:now+30*DAY,neon:now+15*DAY,incense:now+30*DAY,cat:now+5*DAY,tiger:now+30*DAY,aquarium:now+30*DAY,'three-stars':now+30*DAY,'money-tree':now+60000,amethyst:now-3600000},friends:[],records:[],lastSeen:now,idleCarry:0}));
 },{language,coins,freeze,DAY});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);return {context,page};
}
try{
 await mkdir('/tmp/bbl-care-qa',{recursive:true});
 for(const [width,language]of [[320,'zh-Hant'],[375,'zh-Hant'],[1440,'en']]){
  const {context,page}=await setup({width,language});const initial=await saved(page);assert.equal(initial.decor.amethyst,0);assert.equal(await page.locator('.stall-piece').count(),8);assert.equal(await page.locator('.decor-durability').count(),8);assert.equal(await page.locator('[data-repair="neon"]').isDisabled(),false);assert.equal(await page.locator('[data-repair="radio"]').isDisabled(),true);
  assert.equal(await page.locator('[data-piece="cat"]').evaluate(e=>e.classList.contains('is-fragile')),true);assert.equal(await page.locator('[data-piece="neon"]').evaluate(e=>e.classList.contains('is-weathered')),true);
  await page.locator('.stall-showcase').scrollIntoViewIfNeeded();await page.locator('.stall-showcase').screenshot({path:`/tmp/bbl-care-qa/aged-${width}.png`});
  await page.locator('[data-repair="neon"]').click();const repaired=await saved(page);assert.equal(repaired.coins,initial.coins-430);assert.equal(repaired.decor.neon,3);assert.equal(repaired.decorExpires.neon,initial.lastSeen+30*DAY);assert.equal(await page.locator('[data-repair="neon"]').isDisabled(),true);assert.equal(await page.locator('[data-piece="neon"]').evaluate(e=>e.classList.contains('is-weathered')),false);
  await page.locator('[data-discard="cat"]').click();assert.equal(await page.locator('#discard-dialog').isVisible(),true);await page.locator('#cancel-discard').click();assert.equal((await saved(page)).decor.cat,1);
  await page.locator('[data-discard="cat"]').click();await page.locator('#confirm-discard').click();const discarded=await saved(page);assert.equal(discarded.coins,repaired.coins);assert.equal(discarded.decor.cat,0);assert.ok(!('cat'in discarded.decorExpires));assert.equal(await page.locator('[data-piece="cat"]').count(),0);
  await page.evaluate(()=>{window.__careNow+=120000;localStorage.setItem('bbl.qa.now',String(window.__careNow));document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await saved(page)).decor['money-tree'],0);assert.equal(await page.locator('[data-piece="money-tree"]').count(),0);assert.equal(await page.locator('[data-repair="money-tree"]').count(),0);assert.equal(await page.locator('#decor-loss-note').isVisible(),true);
  await page.locator('[data-decor="money-tree"]').click();const replacement=await saved(page);assert.equal(replacement.decor['money-tree'],1);assert.equal(replacement.decorExpires['money-tree'],replacement.lastSeen+30*DAY);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(language==='zh-Hant')assert.match(await page.locator('.bbl-brand').textContent(),/葉師傅除厄小攤/);assert.ok(!/芳姐|Fong/.test(await page.locator('body').textContent()));
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();const restored=await saved(page);assert.equal(restored.decor.neon,3);assert.equal(restored.decor.cat,0);assert.equal(restored.decorExpires.neon,repaired.decorExpires.neon);assert.equal(restored.decor['money-tree'],1);
  assert.equal(await page.locator('.master-avatar img').evaluate(e=>e.complete&&e.naturalWidth>0),true);assert.equal(await page.locator('.fong-logo').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await context.close();pass(`${width}px ${language}: durability meters, repair/fees/levels, discard cancel/confirm, live expiry, replacement, rename, reduced motion, logo and reload`);
 }
 {
  const {context,page}=await setup({coins:0});assert.equal(await page.locator('[data-repair="neon"]').isDisabled(),true);assert.equal((await saved(page)).coins,0);await context.close();pass('insufficient oil disables repair without silently removing coins');
 }
 {
  const {context,page}=await setup({motion:'no-preference',freeze:false});assert.equal(await page.locator('.fong-logo').first().evaluate(e=>getComputedStyle(e).animationIterationCount),'infinite');assert.equal(await page.locator('.fong-mage-hat').first().evaluate(e=>getComputedStyle(e).animationName),'master-yip-hat');
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await click(page,'#start');for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.fastForward(2050);await click(page,'#confirm-worry');await page.clock.fastForward(2050);
  assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'beat');assert.equal(await page.locator('[data-ghost] svg').count(),3);assert.equal(await page.locator('#tram-art').count(),0);assert.equal(await page.locator('.ghost-parade').evaluate(e=>getComputedStyle(e).visibility),'visible');assert.equal(await page.locator('.ghost-parade').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
  for(const [selector,time]of [['.ghost-drift',5000],['.ghost-peek',9000],['.ghost-oops',17000]])await page.locator(selector).evaluate((element,time)=>{for(const animation of element.getAnimations()){animation.pause();animation.currentTime=time;}},time);
  await page.screenshot({path:'/tmp/bbl-care-qa/ghosts-and-master.png'});await click(page,'[data-gesture="heavy"]');await page.clock.runFor(20);assert.ok(Number(await page.locator('#live-score').textContent())>0);
  await context.close();pass('looping Master Yip logo/hat, three cute ghost animations replacing the old prop, unobstructed whacking');
 }
 assert.deepEqual(errors,[]);console.log(`${checks} durability and presentation browser scenarios passed.`);
}finally{await browser.close();}
