import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup({language='en',legacy=false,...options}={}){
  const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
  await context.addInitScript(({language,legacy})=>{Math.random=()=>.2;localStorage.setItem('playground.language.v1',language);if(legacy)localStorage.setItem('roach-rush.best.v1',JSON.stringify({60:14,120:9}));},{language,legacy});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));return {context,page};
}
async function start(page){await page.locator('#start').evaluate(el=>el.click());}
async function point(locator){const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
async function drag(page,target,drop=true){const p=await point(page.locator('#spray'));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(target.x,target.y);assert.equal(await page.locator('#spray-aim').isVisible(),true);if(drop)await page.mouse.up();}
try{
  await mkdir('/tmp/roach-spray-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language});if(language==='zh-Hant'){assert.match(await page.title(),/殲滅小強，人人有責/);assert.equal(await page.locator('h1').textContent(),'殲滅小強，人人有責。');}
    await start(page);const first=page.locator('.critter[data-type=roach]').first(),id=await first.getAttribute('data-id'),target=await point(first);
    const button=await point(page.locator('#spray'));await page.mouse.move(button.x,button.y);await page.mouse.down();await page.mouse.up();assert.equal(await page.locator('#spray').isEnabled(),true);
    await drag(page,target);assert.equal(await page.locator('#spray').isDisabled(),false);assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('.spray-cloud').isVisible(),true);
    await page.clock.runFor(180);assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),1);await page.clock.runFor(120);
    assert.equal(await page.locator('#score').textContent(),'1');assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.equal(await page.locator('.critter[data-type=roach]').count(),3);
    await page.clock.runFor(1200);assert.equal(await page.locator('.spray-cloud').isVisible(),false);await page.clock.fastForward(121000);
    assert.equal(await page.locator('#final-score').textContent(),'1');assert.match(await page.locator('#spray-summary').textContent(),language==='en'?/Sprayed roaches: 1/:/殺蟲劑消滅：1/);assert.equal(await page.locator('#records-120 .record-row').count(),1);
    await page.locator('#again').evaluate(el=>el.click());assert.equal(await page.locator('#spray').isEnabled(),true);assert.equal(await page.locator('#spray-count').textContent(),'×3');await context.close();pass(`${language}: renamed game, invalid drop preserves can, delayed gas kills for one point, result record and replay refill`);
  }
  for(const width of [320,375]){
    const mobile=await setup({language:'zh-Hant',viewport:{width,height:812},isMobile:true,hasTouch:true}),p=mobile.page;await start(p);const target=await point(p.locator('.critter[data-type=roach]').first()),button=await point(p.locator('#spray')),cdp=await mobile.context.newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...button}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...target}]});
    assert.equal(await p.locator('#spray-aim').isVisible(),true);assert.equal(await p.locator('#spray-targets').textContent(),'1');await p.screenshot({path:`/tmp/roach-spray-qa/aim-${width}.png`});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.clock.runFor(300);assert.equal(await p.locator('#score').textContent(),'1');assert.equal(await p.locator('#spray').isDisabled(),false);
    await p.screenshot({path:`/tmp/roach-spray-qa/gas-${width}.png`});await cdp.detach();await mobile.context.close();pass(`${width}px: real touch drag, accurate aiming circle and a single consumed can`);
  }
  const keyboard=await setup(),k=keyboard.page;await start(k);await k.locator('#spray').focus();await k.keyboard.press('Enter');assert.equal(await k.locator('#spray-aim').isVisible(),true);await k.keyboard.press('Escape');assert.equal(await k.locator('#spray-aim').isVisible(),false);assert.equal(await k.locator('#spray').isEnabled(),true);
  await k.keyboard.press('Enter');for(let i=0;i<24;i++){await k.keyboard.press('ArrowUp');await k.keyboard.press('ArrowLeft');}await k.keyboard.press('Enter');await k.clock.runFor(300);assert.equal(await k.locator('#score').textContent(),'1');await keyboard.context.close();pass('keyboard aiming, arrow movement, Escape cancellation and Enter release match drag scoring');

  const records=await setup({legacy:true}),r=records.page;assert.equal(await r.locator('#best').textContent(),'9');assert.equal(await r.locator('#records-120 .record-row').count(),1);assert.equal(await r.locator('#records-180 .record-row').count(),0);
  for(const score of [0,0,1]){await start(r);if(score)await r.locator('.critter[data-type=roach]').first().press('Enter');await r.clock.fastForward(121000);await r.locator('#change-time').evaluate(el=>el.click());}
  assert.equal(await r.locator('#records-120 .record-row').count(),3);await r.locator('input[name=duration][value="180"]').check();await start(r);await r.clock.fastForward(181000);
  const saved=await r.evaluate(()=>JSON.parse(localStorage.getItem('roach-rush.records.v3')));assert.deepEqual(saved.modes[60].map(x=>x.score),[14]);assert.deepEqual(saved.modes[120].map(x=>x.score),[9,1,0]);assert.deepEqual(saved.modes[180].map(x=>x.score),[0]);
  await r.reload();assert.equal(await r.locator('#records-120 .record-row').count(),3);assert.equal(await r.locator('#records-180 .record-row').count(),1);await records.context.close();pass('legacy best migration, archived one-minute records, separate current round lengths and reload persistence');

  const deadline=await setup(),d=deadline.page;await start(d);await d.clock.fastForward(119900);const target=await point(d.locator('.critter[data-type=roach]').first());await drag(d,target);await d.clock.runFor(300);assert.equal(await d.locator('#final-score').textContent(),'0');assert.equal(await d.locator('.spray-cloud').isVisible(),false);await deadline.context.close();pass('a gas cloud released too close to the deadline cannot score after time is up');
  const animated=await setup({reducedMotion:'no-preference'}),a=animated.page;await start(a);await drag(a,await point(a.locator('.critter[data-type=roach]').first()));
  const pose=await a.locator('.spray-cloud').evaluate(el=>{const animation=el.getAnimations()[0];animation.pause();animation.currentTime=240;return {opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform};});assert.ok(Number(pose.opacity)>.5);assert.notEqual(pose.transform,'none');await a.screenshot({path:'/tmp/roach-spray-qa/cloud-animation.png'});await animated.context.close();pass('ordinary motion expands a visible gas cloud over the scored area');
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} spray and record browser checks passed.`);
}finally{await browser.close();}
