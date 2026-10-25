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
  const {context,page}=await setup(language);await arrive(page);let target=await ant(page);await target.click();assert.equal(await page.locator('#score').textContent(),'-3');
  await page.clock.runFor(2000);target=await ant(page);const id=await target.getAttribute('data-id');await flick(page,target);assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await page.locator('#score').textContent(),'-6');
  await page.clock.fastForward(121000);assert.equal(await page.locator('#final-score').textContent(),'-6');assert.match(await page.locator('#ant-summary').textContent(),/2/);await page.locator('#again').click();assert.equal(await page.locator('#score').textContent(),'0');await page.reload();assert.equal(await page.locator('#best').textContent(),'-6');await context.close();pass(`${language}: tap and swipe each deduct three, with negative records and clean replay`);
 }
 const mobile=await setup('zh-Hant',{viewport:{width:375,height:812},isMobile:true,hasTouch:true}),p=mobile.page;await arrive(p);let target=await ant(p),id=await target.getAttribute('data-id'),at=await centre(target);const cdp=await mobile.context.newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...at}]});await p.clock.runFor(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:at.x+70,y:at.y-20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await p.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await p.locator('#score').textContent(),'-3');await cdp.detach();await mobile.context.close();pass('native phone swipe eliminates the ant and deducts three once');
 const keyboard=await setup();await arrive(keyboard.page);target=await ant(keyboard.page);await target.press('Shift+Enter');assert.equal(await keyboard.page.locator('#score').textContent(),'-3');await keyboard.context.close();pass('keyboard swipe uses the same penalty');
 const staying=await setup();await arrive(staying.page);target=await ant(staying.page);id=await target.getAttribute('data-id');at=await centre(target);await staying.page.mouse.move(at.x,at.y);await staying.page.mouse.down();await staying.page.clock.fastForward(60000);await staying.page.mouse.up();assert.equal(await staying.page.locator(`.critter[data-id="${id}"]`).count(),1);assert.equal(await staying.page.locator('#score').textContent(),'0');await staying.context.close();pass('holding without a swipe does not remove an ant or deduct points');
 const animated=await setup('en',{reducedMotion:'no-preference'});await arrive(animated.page);target=await ant(animated.page);await flick(animated.page,target);assert.equal(await animated.page.locator('#score').textContent(),'-3');assert.ok(await animated.page.locator('.is-penalty').count()>0);await animated.page.clock.runFor(750);assert.equal(await animated.page.locator('#effects .is-penalty').count(),0);await animated.context.close();pass('swipe penalty feedback animates and cleans up');
 const staggered=await setup(),s=staggered.page;await arrive(s);const firstId=await s.locator('.critter[data-type="ant"]').getAttribute('data-id');await s.clock.fastForward(30000);for(let i=0;i<3;i++)await s.clock.fastForward(3000);assert.equal(await s.locator('.critter[data-type="ant"]').count(),5);assert.equal(await s.locator(`.critter[data-id="${firstId}"]`).count(),1);await staggered.context.close();pass('ants persist and remain capped at five');
 assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`${checks} ant browser checks passed.`);
}finally{await browser.close();}
