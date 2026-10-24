import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function centre(locator){const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
try{
  await mkdir('/tmp/roach-population-qa',{recursive:true});
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:{width:mobile?375:1440,height:mobile?812:1100},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'});
    await context.addInitScript(mobile=>{Math.random=()=>.2;localStorage.setItem('playground.language.v1',mobile?'zh-Hant':'en');},mobile);
    await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.locator('#start').evaluate(el=>el.click());
    for(const [index,time] of [7000,9000,9000,9000].entries()){await page.clock.fastForward(time);assert.equal(await page.locator('.critter[data-type=mouse]').count(),index+1);}
    await page.clock.fastForward(20000);assert.equal(await page.locator('.critter[data-type=mouse]').count(),4);
    const target=page.locator('.critter[data-type=mouse]').first(),id=await target.getAttribute('data-id'),at=await centre(target),button=await centre(page.locator('#trap'));
    if(mobile){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...button}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...at}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
    else{await page.mouse.move(button.x,button.y);await page.mouse.down();await page.mouse.move(at.x,at.y);await page.mouse.up();}
    assert.equal(await page.locator('.mouse-trap').count(),1);await page.clock.runFor(60);assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await page.locator('.mouse-trap').count(),0);assert.equal(await page.locator('.critter[data-type=mouse]').count(),3);assert.equal(await page.locator('#score').textContent(),'5');assert.equal(await page.locator('#trap-count').textContent(),'×2');
    await page.clock.fastForward(10000);assert.equal(await page.locator('.critter[data-type=mouse]').count(),4);await page.clock.fastForward(10000);assert.equal(await page.locator('.critter[data-type=mouse]').count(),4);
    await page.screenshot({path:`/tmp/roach-population-qa/four-mice-${mobile?'phone':'desktop'}.png`});await context.close();pass(`${mobile?'real phone touch':'desktop mouse'}: four concurrent mice, no fifth, mouse and trap disappear together for +5, and the freed slot refills`);
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} population browser checks passed.`);
}finally{await browser.close();}
