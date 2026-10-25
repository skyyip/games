import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const output='/tmp/pikmin-improvements-qa',errors=[];let checks=0;
const pass=message=>{checks++;console.log(`PASS ${message}`);};
async function setup(options={}){
 const context=await browser.newContext({serviceWorkers:'block',...options});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(()=>{
  localStorage.setItem('playground.language.v1','en');let seed=42;
  Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();return {context,page};
}
const centre=async locator=>{const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
async function fullViewport(page){
 const layout=await page.evaluate(()=>{
  const panel=document.querySelector('.play-panel'),world=document.querySelector('#world'),r=panel.getBoundingClientRect(),garden=world.getBoundingClientRect();
  return {full:Math.abs(r.x)<1&&Math.abs(r.y)<1&&Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-innerHeight)<1,
   scroll:panel.scrollTop===0&&world.scrollTop===0,garden:garden.height>100,
   paint:[.35,.55,.75].every(f=>document.elementFromPoint(innerWidth/2,innerHeight*f)?.closest('.play-panel'))};
 });
 assert.ok(Object.values(layout).every(Boolean),JSON.stringify(layout));
}
try{
 await mkdir(output,{recursive:true});
 const {context,page}=await setup({viewport:{width:1440,height:1100}});await page.locator('#start').click();
 assert.ok(await page.locator('.pikmin[data-type="white"]').count()>0);
 assert.equal(await page.locator('.pikmin:not([data-type="winged"]) .rig-wing').count(),0);
 assert.equal(await page.locator('.pikmin[data-type="winged"] .rig-wing').count(),2*await page.locator('.pikmin[data-type="winged"]').count());
 const ground=page.locator('.pikmin:not([data-type="winged"]):not([data-type="glow"])').first(),pink=page.locator('.pikmin[data-type="winged"]').first();
 assert.equal(await ground.evaluate(el=>el.style.getPropertyValue('--lift')),'0px');
 assert.equal(await pink.evaluate(el=>el.style.getPropertyValue('--lift')),'-6px');
 const poses=[];
 for(let sample=0;sample<3;sample++){
  poses.push(await ground.evaluate(el=>({leg:getComputedStyle(el.querySelector('.rig-leg-left')).transform,arm:getComputedStyle(el.querySelector('.rig-arm-left')).transform})));
  await page.waitForTimeout(100);
 }
 assert.ok(new Set(poses.map(p=>p.leg)).size>1);
 const sine=matrix=>matrix==='none'?0:Number(matrix.slice(7,-1).split(',')[1]);
 assert.ok(poses.some(p=>sine(p.leg)*sine(p.arm)<0));
 const wing1=await pink.locator('.rig-wing-left').evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(80);
 assert.notEqual(await pink.locator('.rig-wing-left').evaluate(el=>getComputedStyle(el).transform),wing1);
 pass('white characters render, ground base types walk with opposing arms/legs, and pink characters hover and flap');

 const groups=await page.locator('.pikmin[data-growth="leaf"]').evaluateAll(els=>Object.entries(Object.groupBy(els.map(el=>({id:el.dataset.id,type:el.dataset.type})),el=>el.type)));
 const [color,matches]=groups.find(([,els])=>els.length>=2),wrongId=groups.find(([type])=>type!==color)[1][0].id;
 const first=page.locator(`.pikmin[data-id="${matches[0].id}"]`),target=page.locator(`.pikmin[data-id="${matches[1].id}"]`),wrong=page.locator(`.pikmin[data-id="${wrongId}"]`);
 await first.focus();await first.scrollIntoViewIfNeeded();let at=await centre(first);await page.mouse.move(at.x,at.y);await page.mouse.down();await page.waitForTimeout(240);
 assert.equal(await first.evaluate(el=>getComputedStyle(el).boxShadow),'none');
 assert.equal(await first.locator('.hold-ring').evaluate(el=>getComputedStyle(el).opacity),'0');
 at=await centre(wrong);await page.mouse.move(at.x,at.y);
 assert.equal(await wrong.evaluate(el=>el.classList.contains('is-linked')),false);
 at=await centre(target);await page.mouse.move(at.x,at.y);
 assert.equal(await target.evaluate(el=>el.classList.contains('is-linked')),true);
 assert.ok(await page.locator('.is-linked').evaluateAll((els,type)=>els.every(el=>el.dataset.type===type&&el.dataset.growth==='leaf'),color));
 await page.keyboard.press('Escape');await page.mouse.up();assert.equal(await page.locator('#fed').textContent(),'0');
 pass('selection has no frame or leaf countdown; chains reject other colours and retain same-colour/same-stage members');

 await page.locator('#reset').click();await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.locator('#start').click();
 const flower=page.locator('.pikmin[data-growth="flower"]').first();await flower.focus();at=await centre(flower);
 await page.mouse.move(at.x,at.y);await page.mouse.down();await page.clock.runFor(599);await page.mouse.move(at.x,at.y-65);await page.mouse.up();
 assert.equal(await flower.isDisabled(),false);
 at=await centre(flower);await page.mouse.move(at.x,at.y);await page.mouse.down();await page.clock.runFor(300);
 assert.equal(await flower.locator('.hold-ring').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await flower.evaluate(el=>getComputedStyle(el).boxShadow),'none');
 await page.clock.runFor(300);await page.mouse.move(at.x,at.y-65);await page.mouse.up();assert.equal(await flower.isDisabled(),true);
 assert.ok(await page.locator('.flying-pikmin .rig-body').count()>0);await page.clock.runFor(550);
 assert.equal(await page.locator('#fed').textContent(),'1');pass('599ms flower charge is rejected; 600ms launches, with the countdown ring retained');
 await context.close();

 for(const [width,height] of [[320,568],[375,812],[812,375]]){
  const replay=await setup({viewport:{width,height},isMobile:true,hasTouch:true});const p=replay.page;
  await p.locator('input[value="timed"]').check();await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').tap();
  for(let round=0;round<3;round++){
   await fullViewport(p);const remaining=Number(await p.locator('#timer').textContent());assert.ok(remaining>34.9&&remaining<=35);
   await p.clock.fastForward(36000);await p.locator('#results').waitFor({state:'visible'});
   await p.locator('#again').tap();await p.clock.runFor(32);await fullViewport(p);
   if(round===2)await p.screenshot({path:`${output}/replay-${width}x${height}.png`,animations:'disabled'});
  }
  // Also replay after an early clear rather than waiting for the deadline.
  await p.locator('.pikmin:not(:disabled)').evaluateAll(els=>els.forEach(el=>el.click()));await p.clock.runFor(600);
  await p.locator('#again').tap();await p.clock.runFor(32);await fullViewport(p);
  await replay.context.close();pass(`${width}x${height}: timeout and early-clear replays keep the full garden visible without stale scroll or white regions`);
 }
 assert.deepEqual(errors,[]);pass('no uncaught errors across sprites, charging, chain filtering and repeated timed replay');
 console.log(`\n${checks} improvement browser checks passed.`);
}finally{await browser.close();}
