import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.FLICK_FORCE_URL||'http://localhost:5173/flick-force/';
const errors=[],key='flick-force.records.v1';let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup({language='en',touch=false,quiet=false,offline=false,blocked=false,width=375,height=812}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,reducedMotion:quiet?'reduce':'no-preference',serviceWorkers:offline?'allow':'block'});
  await context.addInitScript(({language,blocked})=>{localStorage.setItem('playground.language.v1',language);if(blocked)Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});},{language,blocked});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('#runway').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  return {context,page};
}
async function touchFlick(context,page,{direction='up',fraction=.62,duration=180,cancel=false,horizontal=false}={}){
  const surface=page.locator('#runway');await surface.scrollIntoViewIfNeeded();const r=await surface.boundingBox(),session=await context.newCDPSession(page),timestamp=Date.now()/1000;
  const x=r.x+r.width*.5,y=r.y+r.height*(direction==='up'?.82:.18),sign=direction==='up'?-1:1;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',timestamp,touchPoints:[{id:1,x,y}]});
  for(let i=1;i<=10;i++){await page.clock.runFor(duration/10);await session.send('Input.dispatchTouchEvent',{type:'touchMove',timestamp:timestamp+duration/1000*i/10,touchPoints:[{id:1,x:horizontal?x+r.width*.35*i/10:x,y:horizontal?y+1:y+sign*r.height*fraction*(i/10)**1.4}]});}
  await page.clock.runFor(8);
  await session.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',timestamp:timestamp+(duration+8)/1000,touchPoints:[]});await session.detach();
}
const stored=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
async function settle(page){await page.clock.runFor(8500);await page.locator('#result').waitFor({state:'visible'});}
try{
  await mkdir('/tmp/flick-force-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language,touch:true});
    assert.equal(await page.locator('html').getAttribute('lang'),language);
    assert.equal(await page.title(),language==='en'?'Flick Force · Your Playground.':'斗指力 · Your Playground.');
    assert.equal(await page.locator('#distance').textContent(),'0.00');assert.equal(await stored(page),null);
    await page.screenshot({path:`/tmp/flick-force-qa/${language}-ready.png`,fullPage:true});
    await touchFlick(context,page);assert.equal(await page.locator('#runway').getAttribute('data-state'),'coasting');
    assert.equal(await page.locator('#result').isVisible(),false);assert.equal(await stored(page),null,'do not save before the glide ends');
    await page.clock.runFor(300);assert.ok(Number(await page.locator('#distance').textContent())>0);assert.equal(await page.locator('#result').isVisible(),false);
    await page.screenshot({path:`/tmp/flick-force-qa/${language}-coasting.png`});
    await settle(page);const up=Number(await page.locator('#final-distance').textContent());assert.ok(up>10&&up<417);
    assert.equal((await stored(page)).records.length,1);assert.equal((await stored(page)).records[0].direction,'up');
    await page.clock.runFor(1000);assert.equal((await stored(page)).records.length,1);
    for(const name of ['speed','force','range']){assert.match(await page.locator(`#${name}-value`).textContent(),/^\d+%$/);assert.equal(await page.locator(`#${name}-value`).isVisible(),false);}
    await page.screenshot({path:`/tmp/flick-force-qa/${language}-result.png`,fullPage:true});
    await page.locator('#again').evaluate(el=>el.click());await touchFlick(context,page,{direction:'down'});await settle(page);
    const down=Number(await page.locator('#final-distance').textContent());assert.ok(Math.abs(up-down)<.05,'same technique works both ways');
    assert.equal((await stored(page)).records.length,2);
    await page.reload();await page.locator('#runway').waitFor();assert.equal(await page.locator('.record').count(),2);
    if(language==='zh-Hant'){
      const leaked=await page.evaluate(()=>{const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT),found=[];while(w.nextNode()){const n=w.currentNode;if(!n.parentElement.closest('script,style,[translate="no"],.site-copyright')&&/[a-z]{3,}/i.test(n.textContent))found.push(n.textContent.trim());}return found;});
      assert.deepEqual(leaked,[],'Chinese game and prompts are translated');
    }
    await context.close();pass(`${language}: real upward/downward touch flicks, coasting before results, metres, hidden numeric metrics, single save and reload`);
  }
  {
    const {context,page}=await setup({touch:true});
    for(const options of [{fraction:.015},{horizontal:true},{cancel:true}]){
      await touchFlick(context,page,options);assert.equal(await page.locator('#runway').getAttribute('data-state'),'ready');assert.equal(await stored(page),null);
    }
    // A second finger cancels the first gesture instead of creating two launches.
    const s=await context.newCDPSession(page),r=await page.locator('#runway').boundingBox();
    await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+100,y:r.y+150}]});
    await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+100,y:r.y+150},{id:2,x:r.x+200,y:r.y+180}]});
    await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await s.detach();
    assert.equal(await page.locator('#runway').getAttribute('data-state'),'ready');assert.equal(await stored(page),null);
    await context.close();pass('short taps, horizontal swipes, pointer cancellation and multitouch never save a score');
  }
  {
    const {context,page}=await setup({touch:true});await touchFlick(context,page);await page.clock.runFor(300);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.locator('#pause-overlay').isVisible(),true);
    const distance=await page.locator('#distance').textContent();await page.clock.fastForward(30000);assert.equal(await page.locator('#distance').textContent(),distance);assert.equal(await stored(page),null);
    await page.locator('#resume').evaluate(el=>el.click());await settle(page);assert.equal((await stored(page)).records.length,1);
    await page.locator('#again').evaluate(el=>el.click());await touchFlick(context,page);await page.locator('#reset').evaluate(el=>el.click());await page.clock.runFor(10000);
    assert.equal(await page.locator('#runway').getAttribute('data-state'),'ready');assert.equal((await stored(page)).records.length,1);
    await context.close();pass('focus loss pauses a coast; resume completes once; cancelling never adds a record');
  }
  {
    const {context,page}=await setup({width:1440,height:1050});await page.locator('#runway').focus();
    await page.keyboard.down('ArrowUp');await page.clock.runFor(650);await page.keyboard.up('ArrowUp');
    await page.keyboard.press('ArrowDown');assert.equal(await page.locator('#runway').getAttribute('data-state'),'ready');assert.equal(await stored(page),null);
    assert.equal(await page.locator('#keyboard-help').count(),0);
    const r=await page.locator('#runway').boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height*.8);await page.mouse.down();
    for(let i=1;i<=10;i++){await page.clock.runFor(20);await page.mouse.move(r.x+r.width/2,r.y+r.height*.8-r.height*.6*i/10);}
    await page.mouse.up();assert.equal(await page.locator('#runway').getAttribute('data-state'),'coasting');assert.equal(await page.locator('#car').getAttribute('data-mood'),'effort');
    const wheel=page.locator('.wheel-spin').first(),before=await wheel.evaluate(el=>getComputedStyle(el).transform);await page.clock.runFor(80);assert.notEqual(await wheel.evaluate(el=>getComputedStyle(el).transform),before);
    await settle(page);assert.equal((await stored(page)).records.length,1);await context.close();pass('arrow keys never launch; native mouse flicks drive the determined toy car with turning wheels');
  }
  {
    const {context,page}=await setup({touch:true,quiet:true,blocked:true});await touchFlick(context,page);await settle(page);
    assert.match(await page.locator('#storage-note').textContent(),/visit|本次瀏覽/);assert.equal(await page.locator('.record').count(),1);
    assert.equal(await page.locator('.hint-arrow').evaluate(el=>el.getAnimations().length),0);
    await context.close();pass('reduced motion and denied storage preserve play and in-memory records');
  }
  for(const [width,height] of [[320,568],[375,812],[430,932],[812,375],[768,1024],[1440,1050]]){
    const {context,page}=await setup({width,height,touch:width!==1440,language:'zh-Hant'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const controls=await page.locator('button:visible').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height};}));assert.ok(controls.every(r=>r.w>=44&&r.h>=44));
    assert.equal(await page.locator('#runway').evaluate(el=>getComputedStyle(el).touchAction),'none');
    await page.locator('#runway').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/flick-force-qa/ready-${width}x${height}.png`,fullPage:true});
    await context.close();pass(`${width}×${height}: responsive course and page fit without horizontal overflow`);
  }
  {
    const {context,page}=await setup({language:'zh-Hant'});await page.goto(new URL('../',base).href);
    const card=page.locator('.game-card[data-game="flick-force"]');await card.locator('.favourite-button:not(:disabled)').waitFor();
    assert.ok(await page.locator('.game-card').count()>=15);assert.equal(await card.locator('h2').textContent(),'斗指力');
    await card.locator('.favourite-button').click();assert.equal(await page.locator('.game-card').first().getAttribute('data-game'),'flick-force');
    await card.locator('a.card').click();await page.locator('#runway').waitFor();assert.equal(await page.title(),'斗指力 · Your Playground.');
    await context.close();pass('landing card, Chinese title, favourite reordering and navigation integrate with all games');
  }
  {
    const {context,page}=await setup({offline:true,touch:true});await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));
    await context.setOffline(true);await page.reload();await page.locator('#runway').waitFor();await page.clock.runFor(32);
    await touchFlick(context,page);await settle(page);
    assert.equal((await stored(page)).records.length,1);await context.close();pass('offline reload includes fonts, translation, course, physics and local rankings');
  }
  assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`${checks} Flick Force browser checks passed.`);
}finally{await browser.close();}
