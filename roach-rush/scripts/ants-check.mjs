import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(language='en',options={},random=.1){
 const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
 await context.addInitScript(({language,random})=>{try{localStorage.setItem('playground.language.v1',language);}catch{}Math.random=()=>random;},{language,random});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.locator('#start').evaluate(el=>el.click());return {context,page};
}
async function arrive(page){await page.clock.fastForward(11900);await page.clock.runFor(1400);}
async function ant(page){const locator=page.locator('.critter[data-type="ant"]').first(),id=await locator.getAttribute('data-id'),target=page.locator(`.critter[data-id="${id}"]`);await target.focus();return target;}
async function centre(locator){const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
async function flick(page,target){const p=await centre(target);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.clock.runFor(40);await page.mouse.move(p.x+70,p.y-20);await page.mouse.up();}
try{
 await mkdir('/tmp/roach-ants-qa',{recursive:true});
 for(const language of ['zh-Hant','en']){
  const {context,page}=await setup(language);await page.clock.fastForward(11900);assert.equal(await page.locator('.critter[data-type="ant"]').count(),0);
  await page.clock.runFor(1400);let target=await ant(page),id=await target.getAttribute('data-id');
  assert.equal(await page.locator('.critter[data-type="ant"]').count(),1);assert.equal(await target.locator('.ant-art').count(),1);
  const art=await target.locator('.ant-art').evaluate(el=>({width:parseFloat(getComputedStyle(el).width),height:parseFloat(getComputedStyle(el).height)})),hit=await target.boundingBox();assert.equal(art.width,34);assert.equal(art.height,40);assert.equal(hit.width,44);assert.equal(hit.height,52);
  assert.match(await target.getAttribute('aria-label'),language==='en'?/loses 1 point/:/扣 1 分/);
  await page.screenshot({path:`/tmp/roach-ants-qa/ant-${language}.png`,fullPage:true});
  await target.click();assert.equal(await page.locator('#score').textContent(),'-1');assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);
  await page.clock.runFor(2000);target=await ant(page);id=await target.getAttribute('data-id');const p=await centre(target);
  await page.mouse.move(p.x,p.y);await page.mouse.down();
  for(let i=1;i<=5;i++){await page.clock.runFor(80);await page.mouse.move(p.x+i*8,p.y);}
  await page.mouse.up();assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),1);assert.equal(await page.locator('#score').textContent(),'-1');
  await flick(page,target);assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await page.locator('#score').textContent(),'-1');
  assert.match(await page.locator('#gesture-help').textContent(),language==='en'?/safely flicked/:/安全甩出/);
  await page.clock.fastForward(61000);assert.equal(await page.locator('#final-score').textContent(),'-1');
  assert.equal(await page.locator('#best').textContent(),'-1');
  assert.match(await page.locator('#ant-summary').textContent(),language==='en'?/Ant taps: 1 · Safely flicked: 1/:/誤點螞蟻：1 · 安全甩走：1/);
  await page.locator('#again').click();assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('.critter[data-type="ant"]').count(),0);
  await page.reload();assert.equal(await page.locator('#best').textContent(),'-1');
  await context.close();pass(`${language}: delayed single ant, literal -1 tap, slow-drag rejection, safe flick, negative result, summaries and replay`);
 }
 const leaving=await setup();await arrive(leaving.page);const target=await ant(leaving.page),id=await target.getAttribute('data-id'),at=await centre(target);
 await leaving.page.mouse.move(at.x,at.y);await leaving.page.mouse.down();await leaving.page.clock.runFor(4200);
 assert.equal(await leaving.page.locator(`.critter[data-id="${id}"]`).count(),0);await leaving.page.mouse.move(at.x+80,at.y);await leaving.page.mouse.up();
 assert.equal(await leaving.page.locator('#score').textContent(),'0');assert.equal(await leaving.page.locator('.critter[data-type="ant"]').count(),1);
 await leaving.page.clock.runFor(400);assert.equal(await leaving.page.locator('.critter[data-type="ant"]').count(),2);
 await leaving.context.close();pass('one ant departs on its own deadline even while held, while other ants remain and arrive later');

 const touch=await setup('zh-Hant',{viewport:{width:375,height:812},isMobile:true,hasTouch:true});const t=touch.page,protocol=await touch.context.newCDPSession(t);
 await arrive(t);let a=await ant(t),p=await centre(a);
 await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...p}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await t.locator('#score').textContent(),'-1');
 await t.clock.runFor(2000);a=await ant(t);const touchId=await a.getAttribute('data-id');p=await centre(a);
 await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...p}]});await t.clock.runFor(40);
 await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:p.x+70,y:p.y-20}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await t.locator(`.critter[data-id="${touchId}"]`).count(),0);assert.equal(await t.locator('#score').textContent(),'-1');
 await protocol.detach();await touch.context.close();pass('real phone touch input distinguishes an accidental tap from a safe flick');

 const animated=await setup('en',{reducedMotion:'no-preference'});await arrive(animated.page);a=await ant(animated.page);await flick(animated.page,a);
 assert.equal(await animated.page.locator('.ant-fling').count(),1);await animated.page.clock.runFor(550);
 // Web Animations finish on the document timeline, separately from the game clock.
 await animated.page.locator('.ant-fling').waitFor({state:'detached',timeout:5000});assert.equal(await animated.page.locator('#score').textContent(),'0');
 await animated.context.close();pass('a successful flick tumbles the ant out of the room and cleans up its animation without awarding points');

 const keyboard=await setup();await arrive(keyboard.page);a=await ant(keyboard.page);await a.press('Shift+Enter');
 assert.equal(await keyboard.page.locator('.critter[data-type="ant"]').count(),0);assert.equal(await keyboard.page.locator('#score').textContent(),'0');await keyboard.context.close();pass('Shift+Enter provides a safe keyboard flick alternative');
 const staggered=await setup(),s=staggered.page;await arrive(s);
 const firstId=await s.locator('.critter[data-type="ant"]').getAttribute('data-id');
 assert.equal(await s.locator('.critter[data-type="ant"]').count(),1);await s.clock.runFor(2000);
 assert.equal(await s.locator('.critter[data-type="ant"]').count(),2);assert.equal(await s.locator(`.critter[data-id="${firstId}"]`).count(),1);
 await s.clock.runFor(2200);assert.equal(await s.locator(`.critter[data-id="${firstId}"]`).count(),0);
 assert.equal(await s.locator('.critter[data-type="ant"]').count(),1);assert.equal(await s.locator('#score').textContent(),'0');
 await staggered.context.close();pass('ants arrive one at a time and leave separately instead of appearing or disappearing as a group');
 assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} ant browser checks passed.`);
}finally{await browser.close();}
