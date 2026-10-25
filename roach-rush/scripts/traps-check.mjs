import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function centre(locator){const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
try{
  await mkdir('/tmp/roach-three-tools-qa',{recursive:true});
  for(const mobile of [false,true]){
    const context=await browser.newContext({viewport:{width:mobile?375:1440,height:mobile?812:1100},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'});
    await context.addInitScript(mobile=>{Math.random=()=>.2;localStorage.setItem('playground.language.v1',mobile?'zh-Hant':'en');},mobile);
    await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
    const cdp=mobile?await context.newCDPSession(page):null;
    async function drop(kind,target){const p=await centre(page.locator(`#${kind}`));if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...p}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...target}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(target.x,target.y);await page.mouse.up();}}
    const start=()=>page.locator('#start').evaluate(el=>el.click());
    assert.deepEqual(await page.locator('input[name=duration]').evaluateAll(es=>es.map(e=>e.value)),['120','180']);assert.equal(await page.locator('#timer').textContent(),'2:00');await start();
    const invalid=await centre(page.locator('#trap'));await drop('trap',invalid);assert.equal(await page.locator('#trap-count').textContent(),'×3');
    await page.locator('#trap').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#trap-aim').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#trap-aim').isVisible(),false);assert.equal(await page.locator('#trap-count').textContent(),'×3');
    await page.clock.fastForward(6500);await page.clock.runFor(600);
    for(let use=0;use<3;use++){
      if(use)await page.clock.fastForward(9000);const mouse=page.locator('.critter[data-type=mouse]').first(),id=await mouse.getAttribute('data-id');
      const roaches=await page.locator('.critter[data-type=roach]').evaluateAll(es=>es.map(e=>e.dataset.id));await drop('trap',await centre(mouse));assert.equal(await page.locator('#trap-count').textContent(),`×${2-use}`);assert.equal(await page.locator('.mouse-trap').count(),1);
      await page.clock.runFor(60);assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await page.locator('#score').textContent(),String((use+1)*6));assert.equal(await page.locator('.mouse-trap').count(),0);
      for(const roach of roaches)assert.equal(await page.locator(`.critter[data-id="${roach}"]`).count(),1);
    }
    assert.equal(await page.locator('#trap').isDisabled(),true);assert.equal(await page.locator('#spray-count').textContent(),'×3');await page.screenshot({path:`/tmp/roach-three-tools-qa/trap-catches-${mobile?'phone':'desktop'}.png`});pass(`${mobile?'real phone touch':'desktop drag'}: three traps place, catch one mouse each for +6, ignore roaches and exhaust only their own inventory`);
    await page.locator('#end').evaluate(el=>el.click());await start();assert.equal(await page.locator('.mouse-trap').count(),0);assert.equal(await page.locator('#trap-count').textContent(),'×3');
    const targets=await page.locator('.critter[data-type=roach]').evaluateAll(es=>es.slice(0,3).map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}));
    for(let i=0;i<3;i++){await drop('spray',targets[i]);assert.equal(await page.locator('#spray-count').textContent(),`×${2-i}`);assert.equal(await page.locator('.spray-cloud').count(),i+1);}
    assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('#spray').isDisabled(),true);await page.clock.runFor(300);assert.equal(await page.locator('#score').textContent(),'3');assert.equal(await page.locator('#trap-count').textContent(),'×3');
    await page.screenshot({path:`/tmp/roach-three-tools-qa/three-clouds-${mobile?'phone':'desktop'}.png`});pass(`${mobile?'phone':'desktop'}: three rapid sprays keep three independent clouds and do not consume traps`);
    await page.locator('#end').evaluate(el=>el.click());await page.locator('input[value="180"]').check();await start();assert.equal(await page.locator('#timer').textContent(),'3:00');await page.clock.fastForward(120001);assert.equal(await page.locator('#result').isHidden(),true);await page.clock.fastForward(60000);assert.equal(await page.locator('#result').isVisible(),true);
    assert.equal(await page.locator('#records-180 .record-row').count(),1);assert.equal(await page.locator('#records-120 .record-row').count(),0);await page.locator('#again').evaluate(el=>el.click());assert.equal(await page.locator('#spray-count').textContent(),'×3');assert.equal(await page.locator('#trap-count').textContent(),'×3');pass(`${mobile?'phone':'desktop'}: three-minute deadline, separate leaderboard and full replay refill`);
    if(cdp)await cdp.detach();await context.close();
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} three-use tools and duration browser checks passed.`);
}finally{await browser.close();}
