import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BALANCE_BRIDGE_URL||'http://localhost:5173/balance-bridge/';
async function visibleInWorld(page,selector){
  const element=await page.locator(selector).boundingBox(),world=await page.locator('#world').boundingBox();
  assert.ok(element.y>=world.y&&element.y+element.height<=world.y+world.height+.5,`${selector} is inside the visible scene`);
  assert.ok(await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),`${selector} is not clipped or covered`);
}
try{
  await mkdir('/tmp/balance-bridge-qa',{recursive:true});
  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
    await context.addInitScript(()=>{Math.random=()=>.4;localStorage.setItem('playground.language.v1','zh-Hant');});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
    await p.locator('input[value=touch]').check();await p.locator('#start').click();await p.clock.runFor(3200);await p.locator('#pause').click();
    await visibleInWorld(p,'#resume');await visibleInWorld(p,'#quit');assert.equal(await p.locator('#controls').isVisible(),false);await p.locator('#resume').click();await p.clock.runFor(18000);
    assert.equal(await p.locator('#result').isVisible(),true);await visibleInWorld(p,'#again');await visibleInWorld(p,'#change');await p.screenshot({path:`/tmp/balance-bridge-qa/result-visible-${width}.png`});
    await p.locator('#again').click();await p.clock.runFor(3200);assert.equal(await p.locator('#controls').isVisible(),true);await p.locator('#pause').click();await p.locator('#quit').click();assert.equal(await p.locator('body').evaluate(el=>el.classList.contains('play-locked')),false);assert.deepEqual(errors,[]);await context.close();console.log(`PASS ${width}×${height}: pause and result actions remain fully visible, unobscured and usable without scrolling`);
  }
}finally{await browser.close();}
