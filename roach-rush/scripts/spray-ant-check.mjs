import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
const ids=page=>page.locator('.critter').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.id,type:node.dataset.type})));
async function centre(locator){const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
try{
  await mkdir('/tmp/roach-spray-ants-qa',{recursive:true});
  for(const [language,mobile] of [['en',false],['zh-Hant',false],['zh-Hant',true]]){
    const context=await browser.newContext({viewport:{width:mobile?375:1440,height:mobile?812:1100},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block',reducedMotion:'reduce'});
    await context.addInitScript(language=>{Math.random=()=>.1;localStorage.setItem('playground.language.v1',language);},language);
    await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.locator('#start').evaluate(el=>el.click());
    await page.clock.fastForward(11900);await page.clock.runFor(1400);
    const ant=page.locator('.critter[data-type=ant]').first(),antId=await ant.getAttribute('data-id'),target=await centre(ant),button=await centre(page.locator('#spray')),before=await ids(page);
    let cdp;
    if(mobile){cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...button}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...target}]});}
    else{await page.mouse.move(button.x,button.y);await page.mouse.down();await page.mouse.move(target.x,target.y);}
    assert.equal(await page.locator('#spray-ant-warning').isVisible(),true);assert.equal(await page.locator('#spray-ant-targets').textContent(),'1');assert.equal(await page.locator('#spray-ant-cost').textContent(),'−3');
    await page.screenshot({path:`/tmp/roach-spray-ants-qa/aim-${language}-${mobile?'phone':'desktop'}.png`});
    if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
    assert.equal(await page.locator('#score').textContent(),'0');await page.clock.runFor(300);
    assert.equal(await page.locator(`.critter[data-id="${antId}"]`).count(),0);
    const remaining=new Set((await ids(page)).map(e=>e.id)),removed=before.filter(e=>!remaining.has(e.id)),ants=removed.filter(e=>e.type==='ant').length,roaches=removed.filter(e=>e.type==='roach').length,expected=roaches-ants*3;
    assert.equal(ants,1);assert.equal(await page.locator('#score').textContent(),String(expected));assert.match(await page.locator('#gesture-help').textContent(),language==='en'?/ants 1/:/螞蟻 1/);
    await page.clock.runFor(600);assert.equal(await page.locator('#score').textContent(),String(expected));
    await page.clock.fastForward(121000);assert.equal(await page.locator('#final-score').textContent(),String(expected));assert.match(await page.locator('#spray-ant-summary').textContent(),language==='en'?/Ants sprayed: 1 · −3 points/:/誤殺螞蟻：1 隻 · −3 分/);
    assert.match(await page.locator('#ant-summary').textContent(),language==='en'?/Ant taps: 0/:/誤點螞蟻：0/);
    const records=await page.evaluate(()=>JSON.parse(localStorage.getItem('roach-rush.records.v3')));assert.equal(records.modes[120][0].score,expected);
    await page.locator('#again').evaluate(el=>el.click());assert.equal(await page.locator('#spray').isEnabled(),true);assert.equal(await page.locator('#spray-ant-warning').isVisible(),false);
    if(cdp)await cdp.detach();await context.close();pass(`${language} ${mobile?'real phone touch':'mouse drag'}: ant warning, disappearance, exactly -3 per ant, net roach score, result and saved record`);
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} spray-ant browser checks passed.`);
}finally{await browser.close();}
