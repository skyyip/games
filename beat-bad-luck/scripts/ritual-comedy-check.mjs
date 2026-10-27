import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const errors=[];
const invoke=(page,selector)=>page.locator(selector).evaluate(node=>node.click());
const phase=page=>page.locator('#play-panel').getAttribute('data-phase');
async function centre(page,selector){const box=await page.locator(selector).boundingBox();assert.ok(box,selector);return [box.x+box.width/2,box.y+box.height/2];}
async function beginDrag(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.mouse.move(...await centre(page,selector));await page.mouse.down();}
async function drag(page,from,to){await beginDrag(page,from);await page.mouse.move(...await centre(page,to),{steps:8});await page.mouse.up();await page.clock.runFor(25);}
async function geometry(page,selector){return page.locator(selector).evaluate(node=>{const {x,y,width,height}=node.getBoundingClientRect();return {x,y,width,height};});}
async function stable(page,selector,before){const after=await geometry(page,selector);for(const key of Object.keys(before))assert.ok(Math.abs(before[key]-after[key])<.6,`${selector} ${key}: ${before[key]} -> ${after[key]}`);}
async function reachable(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();assert.equal(await page.locator(selector).evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===node||node.contains(hit);}),true,selector);}
async function pauseEffects(page){
 const state=await page.evaluate(async()=>{const effects=()=>document.getAnimations().filter(a=>a.effect.target.closest('.ritual-comedy-layer')&&a.playState!=='finished');document.querySelector('#pause').click();window.__comicPaused=effects();await Promise.all(window.__comicPaused.map(a=>a.ready));window.__comicPaused=window.__comicPaused.filter(a=>a.playState!=='finished'&&a.playState!=='idle');return window.__comicPaused.map(a=>({state:a.playState,time:a.currentTime}));});
 assert.ok(state.length,'decorative effects exist');assert.ok(state.every(a=>a.state==='paused'),JSON.stringify(state));
 await page.clock.fastForward(5000);
 const times=await page.evaluate(()=>window.__comicPaused.map(a=>a.currentTime));
 assert.deepEqual(times,state.map(a=>a.time));await page.locator('#resume').click();await page.clock.runFor(20);
}

try{
 await mkdir('/tmp/ritual-comedy-qa',{recursive:true});
 for(const [width,height,lang,mode,input,reduced]of [
  [320,568,'zh-Hant','blood','drag',false],
  [390,844,'en','plain','tap',false],
  [812,375,'zh-Hant','blood','keyboard',true],
  [1440,900,'en','plain','drag',false]
 ]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<900,reducedMotion:reduced?'reduce':'no-preference',serviceWorkers:'block'});
  await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
  await context.addInitScript(({lang,mode})=>{localStorage.setItem('playground.language.v1',lang);localStorage.setItem('beat-bad-luck.preferences.v1',JSON.stringify({version:1,sound:false}));Math.random=()=>window.__ritualRandom??(mode==='blood'?.3:.8);},{lang,mode});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.stack));await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();
  await page.locator('#ritual-loot-dialog[open]').waitFor();await page.locator('#loot-close').click();await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.locator('#start').click();assert.equal(await phase(page),'incense');
  for(let i=0;i<3;i++)await invoke(page,`[data-stick="${i}"]`);
  await page.locator('#blow').click();await page.clock.fastForward(2050);assert.equal(await phase(page),'worry');await page.locator('#confirm-worry').click();await page.clock.fastForward(2050);assert.equal(await phase(page),'beat');
  await beginDrag(page,'#hit-zone');await page.clock.runFor(900);await page.mouse.up();await page.clock.runFor(20);assert.ok(Number(await page.locator('#live-score').textContent())>0,'native hold scores');
  await page.clock.fastForward(90100);assert.equal(await phase(page),'tiger');
  assert.equal(await page.locator('.ritual-comedy-layer').first().evaluate(node=>getComputedStyle(node).pointerEvents),'none');
  if(mode==='blood'){
   await drag(page,'#pork-piece','#paper-tiger .tiger-mouth');assert.equal(await page.locator('#phase-tiger').evaluate(node=>node.classList.contains('is-fed')),false,'undipped pork rejected');
   if(input==='drag')await drag(page,'#pork-piece','#blood-bowl');else{await page.locator('#pork-piece').focus();await page.keyboard.press('Enter');}
   assert.equal(await page.locator('#pork-piece').evaluate(node=>node.classList.contains('is-dipped')),true);
  }
  // Interruption never leaves a translated pork control or feeds accidentally.
  await beginDrag(page,'#pork-piece');await page.mouse.move(100,160,{steps:3});await invoke(page,'#pause');await page.mouse.up();assert.equal(await page.locator('#pork-piece').evaluate(node=>node.style.translate),'');await page.locator('#resume').click();await page.clock.runFor(20);
  const mouth=await geometry(page,'#paper-tiger .tiger-mouth');
  if(input==='drag'){
   await beginDrag(page,'#pork-piece');const [x,y]=await centre(page,'#paper-tiger .tiger-mouth');await page.mouse.move(x,y,{steps:8});await page.mouse.move(x-15,y);await page.mouse.move(x+15,y);await page.clock.runFor(25);const ready=await geometry(page,'#paper-tiger .tiger-mouth');assert.ok(Math.hypot(ready.x+ready.width/2-mouth.x-mouth.width/2,ready.y+ready.height/2-mouth.y-mouth.height/2)<1,'mouth opens around a fixed drop centre');await page.mouse.up();
  }else if(input==='tap')await page.locator('#pork-piece').click();
  else{await page.locator('#pork-piece').focus();await page.keyboard.press('Space');}
  assert.equal(await page.locator('#phase-tiger').evaluate(node=>node.classList.contains('is-fed')),true);
  if(!reduced){assert.equal(await page.locator('.ritual-comic-food').evaluate(node=>{const layer=node.parentElement;return parseFloat(node.style.left)>0&&parseFloat(node.style.left)<layer.clientWidth&&parseFloat(node.style.top)>0&&parseFloat(node.style.top)<layer.clientHeight;}),true,'food effect starts inside the visible tiger scene');await pauseEffects(page);}
  await page.clock.fastForward(1700);assert.equal(await phase(page),'blessing');assert.equal(await page.locator('#scatter-grains').isDisabled(),true);await invoke(page,'#bless');assert.equal(await page.locator('.purify-scene').getAttribute('data-step'),'0');
  // Pause while dragging paper: release capture and reset, with no hidden progress.
  await beginDrag(page,'#burn-paper');await page.mouse.move(120,160,{steps:4});await invoke(page,'#pause');await page.mouse.up();assert.equal(await page.locator('#burn-paper').evaluate(node=>node.style.translate),'');assert.equal(await page.locator('#burn-paper').evaluate(node=>node.classList.contains('is-dragging')),false);await page.locator('#resume').click();await page.clock.runFor(20);assert.equal(await page.locator('.purify-scene').getAttribute('data-step'),'0');
  if(input==='drag'){
   await beginDrag(page,'#burn-paper');const [x,y]=await centre(page,'#burn-paper');await page.mouse.move(x+5,y-90,{steps:4});await page.mouse.up();assert.equal(await page.locator('.purify-scene').getAttribute('data-step'),'0','bad drop does not burn');
   await drag(page,'#burn-paper','.ritual-paper-tiger .tiger-mouth');
  }else if(input==='tap')await page.locator('#burn-paper').click();
  else{await page.locator('#burn-paper').focus();await page.keyboard.press('Enter');}
  assert.equal(await page.locator('.purify-scene').getAttribute('data-step'),'1');assert.equal(await page.locator('#scatter-grains').isDisabled(),false);await reachable(page,'#scatter-grains');
  await page.locator('#scatter-grains').click();assert.equal(await page.locator('#ritual-grains i').count(),20);assert.equal(await page.locator('#ritual-grains .'+(mode==='blood'?'comic-rice':'comic-bean')).count(),20);
  const horse=await geometry(page,'#bless');await page.clock.runFor(160);await stable(page,'#bless',horse);
  await page.screenshot({path:`/tmp/ritual-comedy-qa/grains-${width}.png`});await reachable(page,'#bless');await page.locator('#bless').click();assert.equal(await page.locator('.purify-scene').getAttribute('data-step'),'3');
  if(!reduced)await pauseEffects(page);
  else assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect.target.closest('.ritual-comedy-layer')).every(a=>a.effect.getKeyframes().every(frame=>!frame.transform))),true,'reduced-motion clones only fade');
  await page.clock.fastForward(1100);assert.equal(await phase(page),'divination');assert.equal(await page.locator('.ritual-comedy-layer > *').count(),0,'phase transition clears clones');
  await page.evaluate(()=>window.__ritualRandom=.8);await page.locator('#throw-blocks').click();await page.clock.fastForward(1400);assert.equal(await page.locator('#result').isVisible(),false);await page.evaluate(()=>window.__ritualRandom=.3);await page.locator('#throw-blocks').click();await page.clock.fastForward(2600);assert.equal(await page.locator('#result').isVisible(),true);
  assert.equal(await page.locator('#ritual-loot-dialog .manga-trophy').count(),1);await reachable(page,'#loot-close');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`/tmp/ritual-comedy-qa/result-${width}.png`});
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));assert.equal(state.rituals,1);assert.equal(state.records.length,1);await invoke(page,'#throw-blocks');await page.clock.fastForward(3000);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')).rituals),1,'result only credited once');
  await page.locator('#loot-close').click();await page.locator('#again').click();assert.equal(await phase(page),'incense');assert.equal(await page.locator('.ritual-comedy-layer > *').count(),0);
  await context.close();console.log(`PASS ${width} ${lang}: six steps, ${mode}/${input}, interrupted drags, stable targets, paused effects, ${reduced?'reduced motion':'comic motion'}, retry and manga trophy`);
 }
 assert.deepEqual(errors,[]);console.log('All four full ritual comedy profiles passed.');
}finally{await browser.close();}
