import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {WEAPONS,DECOR} from '../src/catalog.js';
import {dismissPurchase} from './purchase-helpers.mjs';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const errors=[];let checks=0;
const pass=text=>{checks++;console.log('PASS '+text);};
const click=(page,selector)=>page.locator(selector).evaluate(e=>e.click());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
async function setup({width=375,height=812,lang='zh-Hant',motion='reduce',seed={},clock=false}={}){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<900,reducedMotion:motion,serviceWorkers:'block'});
 await context.addInitScript(({lang,seed})=>{Math.random=()=>.1;localStorage.setItem('playground.language.v1',lang);if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins:1000000,merit:1000000,owned:['bare-hand'],equipped:'bare-hand',decor:{},records:[],lastSeen:Date.now(),...seed}));},{lang,seed});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 if(clock){await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));}
 await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();await page.evaluate(()=>document.fonts.ready);return {context,page};
}
async function receiptFits(page){
 const state=await page.locator('#purchase-dialog').evaluate(dialog=>{
  const r=dialog.getBoundingClientRect(),visible=[...dialog.querySelectorAll('button')];
  return {inside:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,overflow:dialog.scrollHeight>dialog.clientHeight+1,buttons:visible.map(b=>{const t=b.getBoundingClientRect(),hit=document.elementFromPoint(t.x+t.width/2,t.y+t.height/2);return t.height>=43&&t.top>=r.top&&t.bottom<=r.bottom&&!!hit&&(b===hit||b.contains(hit));}),focus:dialog.contains(document.activeElement),art:dialog.querySelectorAll('#purchase-art svg').length};
 });assert.deepEqual(state,{inside:true,overflow:false,buttons:[true,true,true],focus:true,art:1});
}
try{
 await mkdir('/tmp/bbl-purchase-qa/screens',{recursive:true});
 // Every paid kit and every decoration reaches the correct receipt, including upgrades.
 {
  const {context,page}=await setup({width:320,height:568,lang:'en',clock:true});await click(page,'#sound-setup');await click(page,'#tab-kits');
  for(const item of WEAPONS.filter(w=>!w.starter)){
   const before=(await saved(page)).coins;await click(page,`[data-weapon="${item.id}"]`);assert.equal(await page.locator('#purchase-dialog').isVisible(),true,item.id);assert.equal(await page.locator('#purchase-title').textContent(),item.name);assert.equal(await page.locator('#purchase-dialog').getAttribute('data-kind'),'weapon');assert.equal((await saved(page)).coins,before-item.cost);await receiptFits(page);await dismissPurchase(page);assert.ok((await saved(page)).owned.includes(item.id));
  }
  await click(page,'#tab-stall');
  for(const item of DECOR)for(const level of [1,2]){
   const prior=await saved(page);await click(page,`[data-decor="${item.id}"]`);assert.equal(await page.locator('#purchase-title').textContent(),item.name);assert.match(await page.locator('#purchase-effect').textContent(),new RegExp(`Level ${level}`));const after=await saved(page);assert.equal(after.coins,prior.coins-item.cost*level);assert.equal(after.decor[item.id],level);if(level===2)assert.equal(after.decorExpires[item.id],prior.decorExpires[item.id]);await receiptFits(page);await dismissPurchase(page);assert.equal(await page.evaluate(()=>document.activeElement.dataset.decor),item.id);
  }
  await context.close();pass('all 44 paid kits and all 27 decorations/new upgrades: correct receipt, exact spending, ownership, durability and 320px fit');
 }
 for(const [width,height,lang]of [[320,568,'zh-Hant'],[375,812,'en'],[812,375,'zh-Hant'],[1440,900,'en']]){
  const {context,page}=await setup({width,height,lang,motion:'no-preference'});await click(page,'#sound-setup');await click(page,'#tab-kits');
  const stale=await page.locator('[data-weapon="rebirth-paper"]').elementHandle(),before=(await saved(page)).coins;
  await stale.evaluate(e=>{e.click();e.click();});assert.equal((await saved(page)).coins,before-18000);assert.equal(await page.locator('#purchase-dialog').getAttribute('data-revealed'),'false');
  assert.ok((await page.locator('#purchase-dialog').evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.animationName))).includes('parcel-jiggle'));
  await page.screenshot({path:`/tmp/bbl-purchase-qa/screens/${width}-${lang}-parcel.png`});
  await page.waitForFunction(()=>document.querySelector('#purchase-dialog').dataset.revealed==='true');
  await page.locator('#purchase-dialog').evaluate(e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
  assert.equal(await page.locator('.purchase-parcel').evaluate(e=>getComputedStyle(e).visibility),'hidden');assert.equal(await page.locator('#purchase-art>svg').evaluate(e=>getComputedStyle(e).opacity),'1');await receiptFits(page);
  await page.screenshot({path:`/tmp/bbl-purchase-qa/screens/${width}-${lang}-revealed.png`});
  for(let i=0;i<4;i++){await page.keyboard.press('Tab');assert.equal(await page.locator('#purchase-dialog').evaluate(e=>e.contains(document.activeElement)),true);}
  await page.keyboard.press('Escape');assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.dataset.restoreId),'rebirth-paper');assert.equal((await saved(page)).coins,before-18000);
  await page.reload();await page.locator('#start:not(:disabled)').waitFor();assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.ok((await saved(page)).owned.includes('rebirth-paper'));await context.close();pass(`${width} ${lang}: sealed parcel → reveal/particles, one charge under duplicate clicks, focus, Escape and reload`);
 }
 {
  const {context,page}=await setup({seed:{coins:0,merit:0}});await click(page,'#tab-kits');await click(page,'[data-weapon="paper"]');assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.equal((await saved(page)).coins,0);await context.close();pass('unaffordable purchases never show success or spend money');
 }
 {
  const {context,page}=await setup({seed:{owned:['bare-hand','paper','flipflop'],equipped:'paper'}});await click(page,'#tab-kits');const before=(await saved(page)).coins;await click(page,'[data-weapon="flipflop"]');assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.equal((await saved(page)).coins,before);await click(page,'#use-hands');assert.equal(await page.locator('#purchase-dialog').isVisible(),false);await context.close();pass('equipping owned kits or free hands does not replay a purchase celebration');
 }
 {
  const {context,page}=await setup({clock:true});await click(page,'#tab-kits');await click(page,'[data-weapon="paper"]');await page.locator('#purchase-action').click();assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'incense');assert.ok((await saved(page)).owned.includes('paper'));await click(page,'#pause');await click(page,'#quit');assert.ok((await saved(page)).owned.includes('paper'));await context.close();pass('Start a ritual uses the purchased kit and preserves it when quitting without hits');
 }
 {
  const {context,page}=await setup();await click(page,'[data-decor="neon"]');await page.locator('#purchase-action').click();assert.equal(await page.evaluate(()=>document.activeElement.dataset.piece),'neon');assert.equal(await page.locator('[data-piece="neon"]').evaluate(e=>e.classList.contains('purchase-highlight')),true);await click(page,'[data-decor="neon"]');assert.match(await page.locator('#purchase-effect').textContent(),/2.*1.26/);await page.mouse.click(3,3);assert.equal(await page.locator('#purchase-dialog').isVisible(),false);assert.equal((await saved(page)).decor.neon,2);await context.close();pass('See it in my stall focuses/highlights the prop; upgrades and backdrop dismissal keep the purchase');
 }
 {
  const {context,page}=await setup({clock:true});await click(page,'#tab-kits');await click(page,'[data-weapon="paper"]');const focused=await page.evaluate(()=>document.activeElement.id);await page.clock.fastForward(60100);assert.equal(await page.locator('#purchase-dialog').isVisible(),true);assert.equal(await page.evaluate(()=>document.activeElement.id),focused);assert.equal(await page.locator('#purchase-dialog').getAttribute('data-revealed'),'true');assert.equal(await page.locator('#purchase-dialog').evaluate(e=>e.getAnimations({subtree:true}).length),0);await dismissPurchase(page);assert.equal(await page.evaluate(()=>document.activeElement.dataset.restoreId),'paper');await context.close();pass('reduced motion reveals immediately; minute refresh preserves the open receipt and closing focus');
 }
 if(process.env.BBL_PREVIEW_DIR){
  let html=await readFile(join(process.env.BBL_PREVIEW_DIR,'beat-bad-luck-skills-demo.html'),'utf8');
  html=html.replace('<head>',`<head><script>let at=0;const raf=requestAnimationFrame.bind(window);Object.defineProperty(performance,'now',{value:()=>at});window.requestAnimationFrame=f=>raf(()=>f(at));window.advance=ms=>{at+=ms;return new Promise(resolve=>raf(()=>raf(resolve)));};</script>`);
  const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{configurable:false,get(){throw new DOMException('Blocked','SecurityError');}});});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('https://purchase-preview.test/**',route=>route.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:"},body:'<iframe sandbox="allow-scripts" style="width:100%;height:95vh;border:0"></iframe>'}));await page.goto('https://purchase-preview.test/');await page.locator('iframe').evaluate((e,html)=>e.srcdoc=html,html);const frame=page.frameLocator('iframe'),advance=ms=>frame.locator('body').evaluate((e,ms)=>window.advance(ms),ms);await frame.locator('#start:not(:disabled)').waitFor();for(let use=0;use<2;use++){await click(frame,'#start');for(let i=0;i<3;i++)await click(frame,`[data-stick="${i}"]`);await click(frame,'#blow');await advance(2050);await click(frame,'#confirm-worry');await advance(2050);await click(frame,'#hit-zone');await click(frame,'#pause');await click(frame,'#quit');}await frame.locator('#preview-kit-select').selectOption('flipflop');assert.equal(await frame.locator('#purchase-dialog').isVisible(),true);await click(frame,'#purchase-continue');assert.equal(await frame.locator('#purchase-dialog').isVisible(),false);await context.close();pass('locked-storage opaque chat preview supports repurchase and its native receipt without allow-modals');
 }
 assert.deepEqual(errors,[]);console.log(`${checks} purchase celebration browser scenarios passed with no page errors.`);
}finally{await browser.close();}
