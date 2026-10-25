import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.DICE_PARTY_URL||'http://localhost:5173/dice-party/';
const errors=[];let checks=0;const pass=s=>{checks++;console.log(`PASS ${s}`);},click=(p,id)=>p.locator(id).evaluate(el=>el.click());
async function setup({language='en',permission='denied',width=375,height=812,offline=false}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:width!==1440,hasTouch:width!==1440,reducedMotion:'reduce',serviceWorkers:offline?'allow':'block'});
  await context.addInitScript(({language,permission})=>{
    localStorage.setItem('playground.language.v1',language);window.__rolls=[];window.__calls=0;
    crypto.getRandomValues=values=>{values[0]=window.__rolls.length?window.__rolls.shift():0;window.__calls++;return values;};
    window.__permissionCalls=0;Object.defineProperty(window,'DeviceMotionEvent',{configurable:true,value:permission==='unsupported'?undefined:class{static requestPermission(){window.__permissionCalls++;return Promise.resolve(permission);}}});
  },{language,permission});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('.player-row input').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));return {context,page};
}
async function queue(p,faces){await p.evaluate(faces=>{window.__rolls=faces.map(n=>n-1);},faces);}
async function turn(p){await click(p,'#ready');await click(p,'#roll');assert.equal(await p.locator('#stage').getAttribute('data-state'),'rolling');await p.clock.runFor(1700);assert.equal(await p.locator('#stage').getAttribute('data-state'),'locked');await click(p,'#next');}
try{
  await mkdir('/tmp/dice-party-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language});await page.locator('.player-row input').nth(0).fill('Rose & Moon');await page.locator('.player-row input').nth(1).fill('Cloud');await page.locator('#mode').selectOption('poker');
    assert.equal(await page.locator('#count').inputValue(),'5');assert.equal(await page.locator('#count').isDisabled(),true);assert.equal(await page.locator('#rules tbody tr').count(),8);assert.equal(await page.locator('#rules tbody tr').nth(3).locator('th').textContent(),language==='en'?'Straight (five dice)':'順子');
    await queue(page,[3,3,3,3,6,4,4,4,5,6]);await click(page,'#start');await click(page,'#ready');await click(page,'#roll');
    assert.equal(await page.locator('#dice-tray .question').count(),5);await click(page,'#roll');assert.equal(await page.evaluate(()=>window.__calls),5);
    await page.clock.runFor(1519);assert.equal(await page.locator('#stage').getAttribute('data-state'),'rolling');await page.clock.runFor(1);assert.equal(await page.locator('#stage').getAttribute('data-state'),'locked');assert.equal(await page.locator('#roll-total').textContent(),'18');
    await page.screenshot({path:`/tmp/dice-party-qa/${language}-roll.png`});await click(page,'#next');await turn(page);
    assert.equal(await page.locator('#stage').getAttribute('data-state'),'results');assert.equal(await page.locator('#winner-names').textContent(),'Rose & Moon');assert.equal(await page.locator('.standing output').first().textContent(),'18');assert.equal(await page.locator('.standing output').nth(1).textContent(),'23');
    assert.equal(await page.evaluate(()=>window.__permissionCalls),1);await page.screenshot({path:`/tmp/dice-party-qa/${language}-results.png`,fullPage:true});await click(page,'#again');await queue(page,[1,2,3,4,5,6,6,6,1,2]);await click(page,'#ready');await click(page,'#roll');await page.clock.runFor(1700);assert.equal(await page.locator('#roll-detail').textContent(),language==='en'?'Straight (five dice)':'順子');await click(page,'#next');await turn(page);assert.equal(await page.locator('#winner-names').textContent(),'Rose & Moon');await click(page,'#change');
    if(language==='zh-Hant'){
      const leaked=await page.evaluate(()=>{const found=[],w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.parentElement.closest('script,style,[translate="no"],.site-copyright')&&/[a-z]{3,}/i.test(n.textContent))found.push(n.textContent.trim());}return found;});assert.deepEqual(leaked,[]);
    }
    await context.close();pass(`${language}: forced five dice, all eight written rules, locked rolls, correct group ranking over totals, names and one permission request`);
  }
  {
    const {context,page}=await setup();for(const mode of ['high','low'])for(const count of [1,2,3,4,5]){
      await page.locator('#mode').selectOption(mode);await page.locator('#count').selectOption(String(count));await queue(page,[...Array(count).fill(1),...Array(count).fill(6)]);await click(page,'#start');await turn(page);await turn(page);
      const winner=await page.locator('#winner-names').textContent();assert.equal(winner,mode==='high'?'Player 2':'Player 1');assert.equal(await page.locator('.standing').count(),2);await click(page,'#change');
    }await context.close();pass('all one-to-five dice counts compare highest and lowest totals correctly across ten complete matches');
  }
  {
    const {context,page}=await setup({permission:'granted'});await queue(page,[6,1]);await click(page,'#start');await click(page,'#ready');await page.evaluate(()=>Promise.resolve());
    const sample=async x=>{await page.evaluate(x=>{const e=new Event('devicemotion');Object.defineProperty(e,'acceleration',{value:{x,y:0,z:0}});dispatchEvent(e);},x);};
    await sample(2);await page.clock.runFor(60);await sample(16);await page.clock.runFor(60);await sample(-16);assert.equal(await page.locator('#stage').getAttribute('data-state'),'rolling');
    for(let i=0;i<5;i++){await page.clock.runFor(60);await sample(20);}assert.equal(await page.evaluate(()=>window.__calls),1);await page.clock.runFor(1700);assert.equal(await page.locator('#roll-total').textContent(),'6');
    await click(page,'#next');await click(page,'#ready');await page.clock.runFor(1900);assert.match(await page.locator('#motion-status').textContent(),/No motion|Shake the phone/);await click(page,'#roll');await page.clock.runFor(1700);await click(page,'#next');assert.equal(await page.locator('#winner-names').textContent(),'Player 1');
    await context.close();pass('granted phone motion starts exactly one roll and button fallback remains available after silent readings');
  }
  {
    const {context,page}=await setup({permission:'unsupported'});await queue(page,[3,3]);await click(page,'#start');await turn(page);await turn(page);assert.match(await page.locator('#result-title').textContent(),/shared/);assert.equal(await page.locator('.is-winner').count(),2);await click(page,'#again');assert.equal(await page.locator('#stage').getAttribute('data-state'),'handoff');await click(page,'#ready');await click(page,'#roll');await click(page,'#end-round');await page.clock.runFor(3000);assert.equal(await page.locator('#stage').getAttribute('data-state'),'setup');await context.close();pass('unsupported motion, tied winners, replay and cancelling an unfinished round');
  }
  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024],[1440,1050]]){
    const {context,page}=await setup({width,height,language:'zh-Hant'});for(let i=0;i<4;i++)await click(page,'[data-count="plus"]');await page.locator('#mode').selectOption('poker');await click(page,'#start');await click(page,'#ready');
    assert.equal(await page.locator('.die').count(),5);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const tray=await page.locator('#dice-tray').boundingBox();const dice=await page.locator('.die').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};}));assert.ok(dice.every(d=>d.left>=tray.x-2&&d.right<=tray.x+tray.width+2));await page.screenshot({path:`/tmp/dice-party-qa/ready-${width}x${height}.png`,fullPage:true});await context.close();pass(`${width}×${height}: six-player setup, five dice and readable rule table without overflow`);
  }
  {
    const {context,page}=await setup({offline:true});await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await context.setOffline(true);await page.reload();await page.locator('.player-row input').first().waitFor();await click(page,'#start');await turn(page);await turn(page);assert.equal(await page.locator('#stage').getAttribute('data-state'),'results');await context.close();pass('offline reload includes rules, randomness, dice animation and final comparison');
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`${checks} Dice & Delight browser checks passed.`);
}finally{await browser.close();}
