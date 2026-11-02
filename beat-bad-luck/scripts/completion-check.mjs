import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
import {fresh,STORAGE_KEY} from '../src/progress.js';import {hkDay} from '../src/ritual-rewards.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5260/beat-bad-luck/',out='/tmp/bbl-completion';await mkdir(out,{recursive:true});
const click=(p,s)=>p.locator(s).evaluate(n=>n.click()),read=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORAGE_KEY);
try{for(const[width,height,language]of JSON.parse(process.env.BBL_VIEWPORTS||'[[320,568,"zh-Hant"],[390,844,"zh-Hant"],[812,375,"en"],[1280,900,"en"]]')){
 let standardReward;
 for(const mode of ['quick','step']){
  const c=await browser.newContext({viewport:{width,height},hasTouch:width<900,serviceWorkers:'block',reducedMotion:width===812?'reduce':'no-preference'});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  await c.addInitScript(({seed,key,language})=>{localStorage.setItem(key,JSON.stringify(seed));localStorage.setItem('playground.language.v1',language);Math.random=()=>.4;},{seed:{...fresh(),coins:10000,merit:10000,lastDaily:hkDay(Date.now()),owned:['bare-hand','flipflop'],equipped:'flipflop',weaponUses:{flipflop:5},ownedSkins:['plain','duck'],selectedSkin:'duck',skinUses:{duck:5}},key:STORAGE_KEY,language});
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
  await p.locator('#worry-select').selectOption('noise');await click(p,'#start');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);await click(p,'#blow');await p.clock.fastForward(2100);await click(p,'#confirm-worry');await p.clock.fastForward(2100);await p.locator('#hit-zone').press('Space');await p.clock.fastForward(66100);
  assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'tiger');assert(await p.locator('#ritual-completion-choice').isVisible());assert(await p.locator('#feed').isHidden());assert(await p.locator('#tiger-manual-steps').isHidden());assert.equal((await read(p)).rituals,0);
  await p.clock.fastForward(60000);assert(await p.locator('#ritual-completion-choice').isVisible());assert.equal((await read(p)).rituals,0);
  const controls=p.locator('.completion-choice-actions button');assert.equal(await controls.count(),2);
  for(const box of await controls.evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,overflow:n.scrollWidth>n.clientWidth+1};}))){assert(box.h>=44&&box.w>=44);assert(!box.overflow);assert(box.x>=0&&box.y>=0&&box.x+box.w<=width+1&&box.y+box.h<=height+1,JSON.stringify(box));}
  await p.screenshot({path:`${out}/choice-${width}-${mode}.png`});
  await click(p,'#pause');await click(p,'#complete-ritual-quick');assert.equal((await read(p)).rituals,0);assert(await p.locator('#pause-overlay').isVisible());await click(p,'#resume');await p.clock.runFor(300);
  const before=await read(p);assert.equal(before.weaponUses.flipflop,4);assert.equal(before.skinUses.duck,4);
  if(mode==='quick'){
   await p.locator('#complete-ritual-quick').click();assert(await p.locator('#result').isVisible());
  }else{
   await p.locator('#complete-ritual-step').click();assert(await p.locator('#ritual-completion-choice').isHidden());assert(await p.locator('#feed').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'feed');
   await p.locator('#feed').click();await p.clock.fastForward(1700);assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'blessing');await p.locator('#purify-next').click();await p.clock.fastForward(1100);assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'divination');await p.locator('#throw-blocks').click();await p.clock.fastForward(2500);assert(await p.locator('#result').isVisible());
  }
  assert(await p.locator('#ritual-loot-dialog').isVisible());assert(await p.locator('#loot-title').isVisible());const after=await read(p);assert.equal(after.rituals,1);assert.equal(after.records.length,1);assert.equal(after.neighbourhood.album.length,1);assert.equal(after.weaponUses.flipflop,4);assert.equal(after.skinUses.duck,4);
  const gained={oil:after.coins-before.coins,merit:after.merit-before.merit,score:await p.locator('#final-score').textContent()};assert(gained.oil>0&&gained.merit>0);if(standardReward)assert.deepEqual(gained,standardReward);else standardReward=gained;
  await click(p,'#complete-ritual-quick');await click(p,'#complete-ritual-step');await p.clock.fastForward(3000);const duplicate=await read(p);for(const key of ['rituals','coins','merit','weaponUses','skinUses','records'])assert.deepEqual(duplicate[key],after[key]);
  await p.screenshot({path:`${out}/result-${width}-${mode}.png`});await p.locator('#loot-close').click();await p.clock.runFor(300);await p.locator('#ritual-loot-dialog').waitFor({state:'hidden'});await click(p,'#again');assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'incense','replay starts a fresh ritual');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);await click(p,'#blow');await p.clock.fastForward(2100);await click(p,'#confirm-worry');await p.clock.fastForward(2100);assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'beat','replay reaches whacking');await p.clock.fastForward(66100);assert(await p.locator('#ritual-completion-choice').isVisible());assert(await p.locator('#feed').isHidden());assert.equal((await read(p)).rituals,1);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${language} ${mode}: waiting choice, visible 44px controls, pause guard, manual focus, complete ritual, equal standard rewards, one-use stock debit, single saved result, duplicate protection and fresh replay choice.`);await c.close();
 }
}}finally{await browser.close();}
