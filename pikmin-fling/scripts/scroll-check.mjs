// Real touch regression for the fixed phone play view and scroll restoration.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const output=process.env.PIKMIN_FLING_SCREENSHOTS||'/tmp/pikmin-scroll-qa';
let checks=0;const errors=[],pass=text=>{checks++;console.log(`PASS ${text}`);};
async function swipe(page,protocol,point,dy=-100){
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
  for(let step=1;step<=5;step++){
    await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,y:point.y+dy*step/5}]});await page.waitForTimeout(30);
  }
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);
}
try{
  await mkdir(output,{recursive:true});
  const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();await page.locator('#start').tap();
  const pen=await page.locator('#pen').boundingBox(),before=await page.evaluate(()=>scrollY);
  const protocol=await context.newCDPSession(page),point={id:1,x:pen.x+3,y:Math.min(650,pen.y+120)};
  await swipe(page,protocol,point);
  const after=await page.evaluate(()=>scrollY);
  assert.equal(after,before,`an upward swipe in the fence scrolled the playing page from ${before}px to ${after}px`);
  pass('playing stays fixed when a finger swipe starts in the blank fence (original regression)');
  await swipe(page,protocol,point,100);await page.mouse.wheel(0,300);await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>scrollY),before);
  pass('downward swipes, momentum and wheel input cannot move the playing page');

  const leaf=page.locator('.pikmin[data-growth="leaf"]:not(:disabled)').first();
  await leaf.focus();const r=await leaf.boundingBox();
  await swipe(page,protocol,{id:1,x:r.x+r.width/2,y:r.y+r.height/2},-65);
  await page.waitForFunction(()=>document.querySelector('#fed').textContent==='1');
  assert.equal(await page.evaluate(()=>scrollY),before);
  assert.equal(await page.locator('.garden-tools #reset').isVisible(),true);
  pass('an actual finger fling still feeds a Pikmin without focus scrolling and End round stays reachable');

  for(const [width,height] of [[320,568],[375,812],[430,932],[568,320],[812,375],[768,1024]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(100);
    const layout=await page.evaluate(()=>{
      const stage=document.querySelector('.play-panel').getBoundingClientRect(),pen=document.querySelector('#pen').getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth>innerWidth,stage:{x:stage.x,y:stage.y,right:stage.right,bottom:stage.bottom},
        units:[...document.querySelectorAll('.pikmin:not(:disabled)')].map(button=>{const r=button.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,inside:r.x>=pen.x&&r.right<=pen.right&&r.y>=pen.y&&r.bottom<=pen.bottom&&r.y>=0&&r.bottom<=innerHeight};}),
        reset:document.querySelector('#reset').getBoundingClientRect().bottom<=innerHeight,
        outside:[...document.querySelectorAll('.site-top,.intro,.sidebar,main>footer')].every(el=>el.inert)};
    });
    assert.equal(layout.overflow,false);assert.equal(layout.stage.x,0);assert.equal(layout.stage.y,0);
    assert.ok(layout.stage.right<=width&&layout.stage.bottom<=height);assert.equal(layout.reset,true);assert.equal(layout.outside,true);
    assert.ok(layout.units.every(r=>r.w>=43.99&&r.h>=43.99&&r.inside),JSON.stringify({width,height,layout}));
    for(let i=0;i<layout.units.length;i++)for(let j=i+1;j<layout.units.length;j++){
      const a=layout.units[i],b=layout.units[j];
      assert.ok(Math.abs(a.x-b.x)>=43.99||Math.abs(a.y-b.y)>=43.99,`rotation must not stack touch targets at ${width}×${height}`);
    }
    if([375,568].includes(width))await page.screenshot({path:`${output}/playing-${width}x${height}.png`,animations:'disabled'});
    pass(`${width}×${height}: full garden and controls fit, 44px targets stay inside, and covered content is inert`);
  }
  await page.setViewportSize({width:375,height:812});await page.locator('#reset').tap();
  assert.equal(await page.locator('body').evaluate(body=>body.classList.contains('play-locked')),false);
  assert.equal(await page.locator('.control-card #reset').count(),1);
  assert.equal(await page.locator('.site-top').evaluate(el=>el.inert),false);
  await page.locator('#pen').scrollIntoViewIfNeeded();const idlePen=await page.locator('#pen').boundingBox(),idleBefore=await page.evaluate(()=>scrollY);
  await swipe(page,protocol,{id:1,x:idlePen.x+3,y:Math.min(650,idlePen.y+140)});
  assert.ok(await page.evaluate(()=>scrollY)>idleBefore);
  pass('End round restores native finger scrolling, outside controls and the original reset-button location');

  for(const mode of ['normal','challenge','timed']){
    await page.locator(`input[value="${mode}"]`).check();
    if(mode==='timed')await page.clock.install();
    await page.locator('#start').tap();
    assert.equal(await page.locator('body').evaluate(body=>body.classList.contains('play-locked')),true);
    if(mode==='timed')await page.clock.fastForward(31000);
    else {await page.locator('.pikmin:not(:disabled)').evaluateAll(items=>items.forEach(button=>button.click()));await page.locator('#results').waitFor({state:'visible'});}
    assert.equal(await page.locator('body').evaluate(body=>body.classList.contains('play-locked')),false);
    assert.equal(await page.locator('#results').isVisible(),true);
    assert.equal(await page.locator('.site-top').evaluate(el=>el.inert),false);
    if(mode==='timed')assert.equal(await page.locator('#timer').textContent(),'0.00');
    await page.locator('#change-mode').tap();pass(`${mode}: completion or timeout releases the screen lock and mode controls work again`);
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors across orientation changes, gestures, exit, completion and timeout');
  await protocol.detach();await context.close();console.log(`\n${checks} screen-lock browser checks passed.`);
}finally{await browser.close();}
