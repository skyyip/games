// Optional timed-mode QA using the existing Playwright installation.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const output=process.env.PIKMIN_FLING_SCREENSHOTS||'/tmp/pikmin-timed-qa';
const key='pikmin-fling.records.v2',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},init=()=>{Math.random=()=>0;}) {
  const context=await browser.newContext({serviceWorkers:'block',...options});
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  await context.addInitScript(init);
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);
  await page.locator('#start:not(:disabled)').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.locator('input[value="timed"]').check();
  return {context,page};
}
const stored=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const unit=(page,growth)=>page.locator(`.pikmin[data-growth="${growth}"]:not(:disabled)`).first();
async function feed(page,growth) {await unit(page,growth).focus();await page.keyboard.press('Enter');}
async function clear(page) {await page.locator('.pikmin:not(:disabled)').evaluateAll(items=>items.forEach(button=>button.click()));await page.clock.runFor(850);}
try{
  await mkdir(output,{recursive:true});
  const {context,page}=await setup({viewport:{width:1440,height:1100}});
  await page.clock.install();
  assert.equal(await page.locator('#timer').textContent(),'20.00');
  assert.equal(await page.locator('#score').textContent(),'0');
  assert.equal(await page.locator('#records-title').textContent(),'Your highest three');
  assert.equal(await page.locator('#mode-options input').count(),3);
  assert.equal(await page.locator('.point-value:visible').count(),3);
  await page.clock.fastForward(5000);assert.equal(await page.locator('#timer').textContent(),'20.00');
  pass('20s Rush is an independent native mode with an idle 20.00 countdown, zero score and visible point rules');
  for(const width of [320,375,430,768,1440]){
    await page.setViewportSize({width,height:1000});
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
      modes:[...document.querySelectorAll('.fling-modes label')].map(label=>{const r=label.getBoundingClientRect();return {w:r.width,h:r.height};}),
      score:document.querySelector('#score-panel').getBoundingClientRect().right<=innerWidth,
    }));
    assert.equal(layout.overflow,false);assert.equal(layout.score,true);assert.ok(layout.modes.every(r=>r.w>=44&&r.h>=44));
    if([375,1440].includes(width))await page.screenshot({path:`${output}/timed-ready-${width}.png`,fullPage:true,animations:'disabled'});
  }
  pass('countdown, score, three mode controls and point labels fit phone, tablet and desktop widths');
  await page.locator('#start').click();
  for(const [growth,expected] of [['leaf',1],['bud',3],['flower',6]]){
    await feed(page,growth);await page.clock.runFor(500);
    assert.equal(await page.locator('#score').getAttribute('aria-label'),`Score: ${expected} points`);
    assert.ok(await page.locator('#score').evaluate(el=>el.getAnimations().length)>0);
    assert.match(await page.locator('#score-gain').textContent(),/^\+[123]$/);
    await page.clock.runFor(300);assert.equal(await page.locator('#score').textContent(),String(expected));
  }
  assert.equal(await page.locator('#fed').textContent(),'3');
  pass('normal/bud/flower arrivals accumulate 1/2/3 points with a counter animation, point pop and accessible total');
  await page.clock.fastForward(3100);
  assert.match(await page.locator('#cycle-status').textContent(),/Growth wave/);
  pass('the new timed mode runs recurring growth waves during its countdown');
  await page.clock.fastForward(21000);
  assert.equal(await page.locator('#timer').textContent(),'0.00');
  assert.equal(await page.locator('#result-title').textContent(),'Time’s up.');
  assert.equal(await page.locator('#final-time').textContent(),'6');assert.equal(await page.locator('#result-unit').textContent(),'pts');
  assert.equal(await page.locator('.pikmin:not(:disabled)').count(),0);
  assert.equal(await page.locator('.flying-pikmin,.is-held,.is-linked').count(),0);
  assert.deepEqual((await stored(page)).timed.map(r=>r.score),[6]);
  await page.clock.fastForward(21000);assert.equal((await stored(page)).timed.length,1);
  pass('20 seconds ends a partial round, freezes 0.00, disables all input and stores the final score exactly once');

  await page.locator('#again').click();assert.equal(await page.locator('#score').textContent(),'0');
  await feed(page,'leaf');await page.locator('#reset').click();await page.clock.fastForward(21000);
  assert.equal(await page.locator('#timer').textContent(),'20.00');assert.equal(await page.locator('#score').textContent(),'0');
  assert.equal(await page.locator('#results').isVisible(),false);assert.equal((await stored(page)).timed.length,1);
  pass('replay resets score and reset cancels a pending flight and the old deadline without saving an unfinished round');

  await page.locator('#start').click();await page.clock.fastForward(18500);
  const flower=unit(page,'flower');await flower.focus();await flower.scrollIntoViewIfNeeded();
  const box=await flower.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.clock.runFor(1200);
  await unit(page,'leaf').evaluate(button=>button.click());
  assert.equal(await page.locator('.flying-pikmin').count(),1);
  await page.clock.fastForward(1000);await page.mouse.up();await page.clock.runFor(600);
  assert.equal(await page.locator('#final-time').textContent(),'0');assert.equal(await page.locator('#fed').textContent(),'0');
  assert.equal(await page.locator('.flying-pikmin,.is-held,.is-linked').count(),0);
  pass('the deadline cancels a held flower and an unfinished flight; release and late arrival cannot add points');

  await page.locator('#again').click();await clear(page);
  assert.equal(await page.locator('#result-title').textContent(),'Garden cleared.');
  assert.equal(await page.locator('#final-time').textContent(),'45');assert.equal(await page.locator('#score').textContent(),'45');
  assert.ok(Number(await page.locator('#timer').textContent())>0);assert.equal(await page.locator('#fed').textContent(),'30');
  assert.deepEqual((await stored(page)).timed.map(r=>r.score),[45,6,0]);
  assert.equal(await page.locator('.record.is-new').count(),1);
  assert.match(await page.locator('#result-badge').textContent(),/NEW PERSONAL BEST/);
  await page.screenshot({path:`${output}/timed-completed.png`,fullPage:true,animations:'disabled'});
  pass('clearing all 30 ends early at 45 points, completes the score animation and highlights a new highest score');
  await page.locator('#again').click();await page.clock.fastForward(21000);
  assert.deepEqual((await stored(page)).timed.map(r=>r.score),[45,6,0]);assert.equal(await page.locator('.record.is-new').count(),0);
  await page.reload();await page.locator('#start:not(:disabled)').waitFor();await page.locator('input[value="timed"]').check();
  assert.deepEqual((await stored(page)).timed.map(r=>r.score),[45,6,0]);assert.equal(await page.locator('.record').count(),3);
  await page.locator('input[value="normal"]').check();assert.equal(await page.locator('#score-panel').isVisible(),false);
  assert.equal(await page.locator('#timer').textContent(),'0.00');assert.equal(await page.locator('#records-title').textContent(),'Your fastest three');
  pass('only the highest three scores survive reload; lower/tied fourth results stay out and switching modes restores time records');
  await context.close();

  const touch=await setup({viewport:{width:375,height:900},isMobile:true,hasTouch:true},()=>{Math.random=()=>.9;});
  const p=touch.page;await p.locator('#start').tap();
  const leaf=unit(p,'leaf');await leaf.focus();await leaf.scrollIntoViewIfNeeded();const r=await leaf.boundingBox();
  const protocol=await touch.context.newCDPSession(p),origin={id:1,x:r.x+r.width/2,y:r.y+r.height/2};
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[origin]});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...origin,y:origin.y-70}]});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await p.waitForFunction(()=>document.querySelector('#score').textContent==='1');
  const bud=unit(p,'bud');await bud.focus();await bud.tap();await bud.tap();
  await p.waitForFunction(()=>document.querySelector('#score').textContent==='3');
  pass('real finger input in timed mode scores an upward fling and a double-tap bud');
  const flowers=p.locator('.pikmin[data-growth="flower"]:not(:disabled)');
  const first=flowers.first(),second=flowers.nth(1);await first.focus();
  const a=await first.boundingBox(),b=await second.boundingBox(),finger={id:1,x:a.x+a.width/2,y:a.y+a.height/2};
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});await p.waitForTimeout(240);
  await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...finger,x:b.x+b.width/2,y:b.y+b.height/2}]});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...finger,x:b.x+b.width/2,y:b.y+b.height/2-65}]});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const flying=await p.locator('.flying-pikmin').count();assert.ok(flying>=2);
  const expected=3+flying*3;
  await p.waitForFunction(expected=>document.querySelector('#score').textContent===String(expected),expected);
  assert.equal(await p.locator('#score').getAttribute('aria-label'),`Score: ${expected} points`);
  await protocol.detach();await touch.context.close();
  pass('a 240ms flower drag chain in timed mode scores every arrival at three points');

  const quiet=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}},()=>{Math.random=()=>0;Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});
  await quiet.page.clock.install();await quiet.page.locator('#start').focus();await quiet.page.keyboard.press('Enter');
  await feed(quiet.page,'flower');await quiet.page.clock.runFor(550);
  assert.equal(await quiet.page.locator('#score').textContent(),'3');assert.equal(await quiet.page.locator('#score').evaluate(el=>el.getAnimations().length),0);
  await quiet.page.clock.fastForward(21000);assert.equal(await quiet.page.locator('#final-time').textContent(),'3');
  assert.match(await quiet.page.locator('#storage-status').textContent(),/unavailable|無法/);assert.equal(await quiet.page.locator('.record').count(),1);
  await quiet.context.close();pass('reduced motion gives immediate readable scores and keyboard play still saves in-memory results with blocked storage');

  const offline=await setup({serviceWorkers:'allow'});
  await offline.page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await offline.context.setOffline(true);
  await offline.page.reload();await offline.page.locator('#start:not(:disabled)').waitFor();
  await offline.page.locator('input[value="timed"]').check();await offline.page.clock.install();await offline.page.locator('#start').click();
  await feed(offline.page,'bud');await offline.page.clock.runFor(800);await offline.page.clock.fastForward(21000);
  assert.equal(await offline.page.locator('#final-time').textContent(),'2');assert.equal((await stored(offline.page)).timed[0].score,2);
  await offline.context.close();pass('the new countdown, scoring and score records work after an offline reload');
  assert.deepEqual(errors,[]);pass('no uncaught errors during timed play, deadline cancellation, replay, reduced motion or offline play');
  console.log(`\n${checks} timed-mode browser checks passed. Screenshots: ${output}`);
}finally{await browser.close();}
