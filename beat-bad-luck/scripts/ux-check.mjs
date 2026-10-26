import assert from 'node:assert/strict';
import {DECOR} from '../src/catalog.js';
import {idleRate} from '../src/progress.js';
import {SCENES} from '../src/neighbourhood.js';
import {paperGesture} from './paper-gesture.mjs';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
let checks=0;const errors=[];
const pass=text=>{checks++;console.log('PASS '+text);};
const click=(page,selector)=>page.locator(selector).evaluate(e=>e.click());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
async function setup({lang='en',width=375,height=812,motion='reduce',seed={}}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:motion,serviceWorkers:'block'});
 await context.addInitScript(({lang,seed})=>{localStorage.setItem('playground.language.v1',lang);Math.random=()=>.1;localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins:999999,merit:999999,owned:['bare-hand'],equipped:'bare-hand',decor:{},lastSeen:Date.now(),...seed}));},{lang,seed});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 // Install before navigation so the real minute/scene timers are covered too.
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();await page.evaluate(()=>document.fonts.ready);
 return {context,page};
}
async function beat(page){await click(page,'#start');for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.fastForward(2050);await click(page,'#confirm-worry');await page.clock.fastForward(2050);}
async function domAudit(page){
 const issues=await page.evaluate(()=>{
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id),duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
  const missing=[...document.querySelectorAll('[aria-describedby],[aria-labelledby],[aria-controls]')].flatMap(e=>['aria-describedby','aria-labelledby','aria-controls'].flatMap(attr=>(e.getAttribute(attr)||'').split(/\s+/).filter(id=>id&&!document.getElementById(id))));
  return {duplicates:[...new Set(duplicates)],missing,overflow:document.documentElement.scrollWidth>innerWidth,nestedButtons:document.querySelectorAll('button button').length};
 });assert.deepEqual(issues,{duplicates:[],missing:[],overflow:false,nestedButtons:0});
}
try{
 for(const [width,height,lang]of [[320,568,'zh-Hant'],[812,375,'en']]){
  const {context,page}=await setup({width,height,lang,seed:{owned:['bare-hand','spanner'],equipped:'spanner'}});await beat(page);
  for(let i=0;i<12;i++){await click(page,'#hit-zone');await page.clock.fastForward(80);}await click(page,'#kit-skill');
  for(const [step,direction]of [1,-1].entries()){
   const r=await page.locator('#expanded-canvas').boundingBox();await page.mouse.move(r.x+r.width*.78,r.y+r.height*.45);await page.mouse.down();
   for(let i=1;i<=240;i++){const angle=direction*i/240*Math.PI*2;await page.mouse.move(r.x+r.width*(.5+.28*Math.cos(angle)),r.y+r.height*(.45+.28*Math.sin(angle)));}
   await page.clock.fastForward(1200);await page.mouse.up();
   if(step===0)assert.match(await page.locator('#kit-title').textContent(),/2\/2$/);
  }
  assert.equal(await page.locator('#kit-stage').evaluate(e=>e.classList.contains('is-win')),true);await context.close();pass(`${width} ${lang}: 240-sample clockwise/anticlockwise native circles complete the kit`);
 }
 for(const lang of ['zh-Hant','en'])for(const [kind,gesture]of [['blind-box','rub'],['marksix','circle']]){
  const {context,page}=await setup({lang});await click(page,`[data-worry="${kind}"]`);await beat(page);const hint=await page.locator('#personality-hint').textContent();assert.ok(!/Copier|影印/.test(hint));assert.match(hint,gesture==='rub'?/搓|Rub/:/畫圈|Circle/);await page.clock.fastForward(1000);await paperGesture(page,gesture);assert.match(await page.locator('#hit-feedback').textContent(),/弱點命中|Weakness hit/);assert.equal(await page.locator('[data-copy]').count(),0);await context.close();pass(`${lang} ${kind}: truthful hint and matching native weakness bonus`);
 }
 for(const lang of ['zh-Hant','en']){
  const {context,page}=await setup({lang});await click(page,'#tab-kits');await page.locator('[data-weapon="paper"]').focus();await page.clock.fastForward(60100);assert.equal(await page.evaluate(()=>document.activeElement.dataset.weapon),'paper');
  await click(page,'[data-weapon="paper"]');assert.equal(await page.evaluate(()=>document.activeElement.dataset.restoreId),'paper');assert.equal(await page.locator('[data-weapon="paper"]').isDisabled(),true);await page.clock.fastForward(60100);assert.equal(await page.evaluate(()=>document.activeElement.dataset.restoreId),'paper');
  await click(page,'#tab-stall');for(let i=0;i<5;i++)await click(page,'[data-decor="neon"]');assert.equal(await page.evaluate(()=>document.activeElement.dataset.restoreId),'neon');assert.equal(await page.locator('[data-decor="neon"]').isDisabled(),true);await domAudit(page);await context.close();pass(`${lang}: periodic refresh and completed purchases/upgrades preserve meaningful focus`);
 }
 for(const lang of ['zh-Hant','en']){
  const {context,page}=await setup({lang,seed:{coins:100,merit:10}});await click(page,'#tab-kits');assert.equal(await page.locator('[data-weapon="paper"]').isDisabled(),true);assert.match(await page.locator('#kit-reason-paper').textContent(),/30.*145/);assert.equal(await page.locator('[data-weapon="paper"]').getAttribute('aria-describedby'),'kit-reason-paper');await click(page,'#tab-stall');assert.match(await page.locator('#decor-reason-neon').textContent(),/1,045/);await domAudit(page);await context.close();pass(`${lang}: unaffordable kits and decorations explain exact deficits`);
 }
 {
  const decor=Object.fromEntries(DECOR.map(d=>[d.id,1])),{context,page}=await setup({seed:{coins:10000,decor}}),initial=await saved(page);await beat(page);
  await page.locator('#weapon-list').evaluate(e=>{window.shopRebuilds=0;new MutationObserver(records=>window.shopRebuilds+=records.length).observe(e,{childList:true});});await page.clock.fastForward(56000);assert.equal(await page.evaluate(()=>window.shopRebuilds),0);await page.clock.fastForward(4100);await click(page,'#feed');await page.clock.fastForward(1600);await click(page,'#bless');await page.clock.fastForward(1600);assert.equal(await page.locator('#result').isVisible(),true);
  const result=await saved(page),idle=Math.floor((result.lastSeen-initial.lastSeen)/3600000*idleRate(result));assert.equal(result.coins,10000+idle+30);await click(page,'#to-stall');assert.equal((await saved(page)).coins,result.coins);await domAudit(page);await context.close();pass('no hidden shop rebuild during play; idle income settles correctly once on return');
 }
 {
  const decor=Object.fromEntries(DECOR.map(d=>[d.id,1])),{context,page}=await setup({seed:{coins:10000,decor}}),initial=await saved(page);await beat(page);await click(page,'#pause');await page.locator('#weapon-list').evaluate(e=>{window.shopRebuilds=0;new MutationObserver(records=>window.shopRebuilds+=records.length).observe(e,{childList:true});});
  for(let i=0;i<9;i++)await page.clock.fastForward(3600000);
  const paused=await saved(page),income=Math.floor((paused.lastSeen-initial.lastSeen)/3600000*idleRate(paused));assert.equal(paused.coins,10000+income);assert.ok(income>idleRate(paused)*8);assert.equal(await page.evaluate(()=>window.shopRebuilds),0);await click(page,'#quit');assert.equal((await saved(page)).coins,paused.coins);await context.close();pass('a long foreground pause keeps earning without hidden shop rebuilds or ritual rewards');
 }
 for(const lang of ['zh-Hant','en']){
  const decor=Object.fromEntries(DECOR.map(d=>[d.id,1])),{context,page}=await setup({lang,motion:'no-preference',seed:{decor,neighbourhood:{scenes:SCENES.map(s=>s.id)}}});await page.clock.fastForward(2900);await click(page,'#next-skit-line');const act=await page.locator('#stall-skit').getAttribute('data-act');await page.clock.fastForward(5900);assert.equal(await page.locator('#stall-skit').getAttribute('data-act'),act);await page.clock.fastForward(3100);assert.notEqual(await page.locator('#stall-skit').getAttribute('data-act'),act);
  await click(page,'#toggle-skit-auto');assert.equal(await page.locator('#toggle-skit-auto').getAttribute('aria-pressed'),'false');const paused=await page.locator('#skit-line').textContent();await page.clock.fastForward(12000);assert.equal(await page.locator('#skit-line').textContent(),paused);await click(page,'#next-skit-line');assert.notEqual(await page.locator('#skit-line').textContent(),paused);await click(page,'#toggle-skit-auto');assert.equal(await page.locator('#toggle-skit-auto').getAttribute('aria-pressed'),'true');await domAudit(page);await context.close();pass(`${lang}: manual scene reading grace, pause/play and working manual controls`);
 }
 {
  const decor=Object.fromEntries(DECOR.map(d=>[d.id,1])),{context,page}=await setup({seed:{decor}});await click(page,'#open-journey');await page.locator('#layout-piece').selectOption('cat');await page.locator('#layout-slot').selectOption('5');await click(page,'#place-decoration');assert.equal(await page.locator('#layout-piece').inputValue(),'cat');assert.equal(await page.locator('#layout-slot').inputValue(),'5');assert.equal((await saved(page)).neighbourhood.layout[5],'cat');await click(page,'#next-skit-line');await page.clock.fastForward(60100);assert.equal(await page.locator('#layout-slot').inputValue(),'5');await context.close();pass('decoration placement preserves both editor selections through updates');
 }
 {
  const {context,page}=await setup();await click(page,'#start');await page.keyboard.press('Escape');assert.equal(await page.locator('#pause-overlay').isVisible(),true);assert.equal(await page.locator('#pause-overlay').getAttribute('role'),'dialog');assert.equal(await page.evaluate(()=>document.activeElement.id),'resume');const time=await page.locator('#phase-clock').textContent();await page.clock.fastForward(10000);assert.equal(await page.locator('#phase-clock').textContent(),time);await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'quit');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'resume');await page.keyboard.press('Escape');assert.equal(await page.locator('#pause-overlay').isVisible(),false);assert.equal(await page.locator('#ritual-stage').evaluate(e=>e.inert),false);await context.close();pass('named pause dialog, contained keyboard focus and Escape pause/resume');
 }
 assert.deepEqual(errors,[]);console.log(`${checks} focused UX regression scenarios passed with no page errors.`);
}finally{await browser.close();}
