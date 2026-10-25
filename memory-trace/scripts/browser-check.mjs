import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.MEMORY_TRACE_URL||'http://localhost:5173/memory-trace/';
const errors=[];let checks=0;const pass=s=>{checks++;console.log(`PASS ${s}`);};
async function setup({language='en',width=375,height=812,touch=false,offline=false}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,reducedMotion:'reduce',serviceWorkers:offline?'allow':'block'});
  await context.addInitScript(language=>{localStorage.setItem('playground.language.v1',language);Math.random=()=>.3;},language);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('.player-row input').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);return {context,page};
}
const click=(p,id)=>p.locator(id).evaluate(el=>el.click());
async function clock(p){await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));}
async function draw(p,{correct=true,touch=false,context}={}){
  await p.locator('#board').scrollIntoViewIfNeeded();const r=await p.locator('#board').boundingBox();
  const points=correct?await p.evaluate(async()=>{const {createShape}=await import('./src/shapes.js');return createShape(()=>.3).points.filter((_,i)=>i%4===0);}):[{x:.1,y:.1},{x:.15,y:.1},{x:.15,y:.15},{x:.1,y:.15},{x:.1,y:.1}];
  const coords=points.map(p=>({x:r.x+r.width*p.x,y:r.y+r.height*p.y}));
  if(touch){const s=await context.newCDPSession(p);await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...coords[0]}]});for(const point of coords.slice(1))await s.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...point}]});await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await s.detach();}
  else{await p.mouse.move(coords[0].x,coords[0].y);await p.mouse.down();for(const point of coords.slice(1))await p.mouse.move(point.x,point.y);await p.mouse.up();}
}
try{
  await mkdir('/tmp/memory-trace-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language,touch:true});await page.locator('.player-row input').nth(0).fill('Sky & Moon');await page.locator('.player-row input').nth(1).fill('Player 2');await clock(page);await click(page,'#start');
    for(let turn=0;turn<2;turn++){
      await click(page,'#view');assert.equal(await page.locator('#stage').getAttribute('data-state'),'viewing');assert.equal(await page.locator('#countdown').textContent(),'3');assert.equal(await page.locator('#submit').isVisible(),false);
      if(turn===0){await page.screenshot({path:`/tmp/memory-trace-qa/${language}-remember.png`});await page.clock.runFor(2999);assert.equal(await page.locator('#stage').getAttribute('data-state'),'viewing');await page.clock.runFor(1);}
      else await page.clock.fastForward(3001);
      assert.equal(await page.locator('#stage').getAttribute('data-state'),'drawing');assert.equal(await page.locator('#countdown').isVisible(),false);assert.equal(await page.locator('#submit').isDisabled(),true);
      await draw(page,{correct:turn===0,touch:true,context});assert.equal(await page.locator('#submit').isEnabled(),true);await click(page,'#submit');
      assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#stage').getAttribute('data-state'),'locked');await click(page,'#next');
    }
    assert.equal(await page.locator('#stage').getAttribute('data-state'),'results');assert.equal(await page.locator('.standing').count(),2);assert.equal(await page.locator('.standing output').first().textContent(),'100.0%');assert.equal(await page.locator('#winner-names').textContent(),'Sky & Moon');
    await page.locator('#review-tabs button').nth(1).evaluate(el=>el.click());assert.equal(await page.locator('#review-tabs button').nth(1).getAttribute('aria-pressed'),'true');
    await page.screenshot({path:`/tmp/memory-trace-qa/${language}-results.png`,fullPage:true});await click(page,'#again');assert.equal(await page.locator('#stage').getAttribute('data-state'),'handoff');assert.equal(await page.locator('#results').isVisible(),false);await click(page,'#end-round');
    if(language==='zh-Hant'){
      const leaked=await page.evaluate(()=>{const found=[],w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.parentElement.closest('script,style,[translate="no"],.site-copyright')&&/[a-z]{3,}/i.test(n.textContent.replace(/\bShift\b/g,'')))found.push(n.textContent.trim());}return found;});assert.deepEqual(leaked,[]);
    }
    await context.close();pass(`${language}: exact 3-second view, native touch drawing, private turns, overlap ranking, names, review and replay`);
  }
  {
    const {context,page}=await setup();await clock(page);await click(page,'#start');await click(page,'#view');await page.clock.runFor(800);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    assert.equal(await page.locator('#stage').getAttribute('data-state'),'drawing');assert.equal(await page.locator('#view').isVisible(),false);await page.clock.runFor(5000);assert.equal(await page.locator('#countdown').isVisible(),false);
    await draw(page);await click(page,'#undo');assert.equal(await page.locator('#submit').isDisabled(),true);await draw(page);await click(page,'#clear');assert.equal(await page.locator('#submit').isDisabled(),true);
    await page.locator('#board').focus();await page.keyboard.press('Space');for(let i=0;i<12;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');assert.equal(await page.locator('#submit').isEnabled(),true);await click(page,'#submit');
    assert.equal(await page.locator('#stage').getAttribute('data-state'),'locked');await context.close();pass('interruption hides the target; undo, clear and keyboard drawing work without revealing it again');
  }
  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024],[1440,1050]]){
    const {context,page}=await setup({width,height,language:'zh-Hant',touch:width!==1440});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for(let i=0;i<4;i++)await click(page,'[data-count="plus"]');assert.equal(await page.locator('.player-row input').count(),6);assert.equal(await page.locator('[data-count="plus"]').isDisabled(),true);await click(page,'#start');await click(page,'#view');
    const before=await page.locator('#board').boundingBox();await page.waitForTimeout(50);const after=await page.locator('#board').boundingBox();assert.ok(Math.abs(before.width-after.width)<1);
    await page.screenshot({path:`/tmp/memory-trace-qa/view-${width}x${height}.png`,fullPage:true});await context.close();pass(`${width}×${height}: six players, stable board and no horizontal overflow`);
  }
  {
    const {context,page}=await setup({offline:true});await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await context.setOffline(true);await page.reload();await page.locator('.player-row input').first().waitFor();await clock(page);await click(page,'#start');await click(page,'#view');await page.clock.runFor(3001);await draw(page);await click(page,'#submit');assert.equal(await page.locator('#stage').getAttribute('data-state'),'locked');await context.close();pass('offline reload includes shape generation, scoring, fonts and private turns');
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`${checks} Memory Trace browser checks passed.`);
}finally{await browser.close();}
