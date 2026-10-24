import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.JUST_A_SEC_URL||'http://localhost:5173/just-a-sec/';
const output='/tmp/just-a-sec-qa',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},language='en',random=.35) {
  const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:1100},...options});
  await context.addInitScript(({language,random})=>{try{localStorage.setItem('playground.language.v1',language);}catch{}Math.random=()=>random;},{language,random});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  context.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);return {context,page};
}
async function freeze(page){await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));}
async function begin(page){await page.locator('#start').click();await page.locator('#ready').click();}
async function mouseHold(page,milliseconds,outside=false) {
  const box=await page.locator('#hold').boundingBox(),at={x:box.x+box.width/2,y:box.y+box.height/2};
  await page.mouse.move(at.x,at.y);await page.mouse.down();
  assert.equal(await page.locator('#hold').getAttribute('aria-pressed'),'true');
  await page.clock.runFor(milliseconds);
  if(outside)await page.mouse.move(at.x+box.width,at.y);
  await page.mouse.up();assert.equal(await page.locator('#locked').isVisible(),true);
}
async function keyboardHold(page,milliseconds,code='Space') {
  await page.locator('#hold').focus();await page.keyboard.down(code);await page.clock.runFor(milliseconds);await page.keyboard.up(code);
  assert.equal(await page.locator('#locked').isVisible(),true);
}
try {
  await mkdir(output,{recursive:true});
  for(const language of ['zh-Hant','en']) {
    const {context,page}=await setup({},language);const zh=language==='zh-Hant';
    assert.equal(await page.locator('#player-count').textContent(),'2');assert.equal(await page.locator('#minus').isDisabled(),true);
    for(let i=0;i<4;i++)await page.locator('#plus').click();assert.equal(await page.locator('#plus').isDisabled(),true);assert.equal(await page.locator('#rows input').count(),6);
    for(let i=0;i<4;i++)await page.locator('#minus').click();
    await page.locator('#player-0').fill('Start Game');await page.locator('#player-1').fill('<b>玩家</b>');
    await freeze(page);await begin(page);assert.equal(await page.locator('#target').textContent(),'8');
    const pad=page.locator('#hold');await pad.focus();await page.keyboard.down('Space');
    await page.clock.runFor(1000);const during=await page.locator('#play').innerText();
    await page.clock.runFor(7000);assert.equal(await page.locator('#play').innerText(),during,'no running time or progress cues');
    assert.equal(await page.locator('#standings').textContent(),'');await page.keyboard.up('Space');
    assert.equal(await page.locator('#result').isHidden(),true);assert.equal(await page.locator('#locked-name').textContent(),'Start Game');
    assert.ok(!(await page.locator('#locked').textContent()).includes('8.000'));
    await page.locator('#next').click();assert.equal(await page.locator('#next-player').textContent(),'<b>玩家</b>');
    await page.locator('#ready').click();assert.equal(await page.locator('#target').textContent(),'8');
    await mouseHold(page,8250,true);await page.locator('#next').click();
    assert.equal(await page.locator('#result').isVisible(),true);
    assert.equal(await page.locator('.result-row').count(),2);assert.equal(await page.locator('.winner .result-person strong').textContent(),'Start Game');
    assert.match(await page.locator('#result-title').textContent(),zh?/時間感最準/:/best timing/);
    assert.equal(await page.locator('.result-person > strong').nth(1).textContent(),'<b>玩家</b>');assert.equal(await page.locator('.result-person b').count(),0);
    assert.match(await page.locator('.result-time').first().textContent(),/8\.000/);
    assert.match(await page.locator('.result-person small').nth(1).textContent(),zh?/晚了 0.250 秒/:/0.250s too late/);
    await page.screenshot({path:`${output}/results-${language}.png`,fullPage:true});
    await page.locator('#again').click();assert.equal(await page.locator('#next-player').textContent(),'Start Game');
    await page.locator('#ready').click();await keyboardHold(page,7900,'Enter');await page.locator('#next').click();await page.locator('#ready').click();await keyboardHold(page,8100);await page.locator('#next').click();
    assert.equal(await page.locator('.result-row.winner').count(),2);
    assert.match(await page.locator('#result-title').textContent(),zh?/並列/:/share/);
    await page.locator('#change-players').click();assert.equal(await page.locator('#player-0').inputValue(),'Start Game');
    await context.close();pass(`${language}: 2–6 controls, shared target, hidden timing, mouse outside release, keyboard timing, exact results, literal names, replay and ties`);
  }

  const six=await setup({},'en',0);const sixPage=six.page;
  for(let i=0;i<4;i++)await sixPage.locator('#plus').click();
  await freeze(sixPage);await begin(sixPage);
  for(const duration of [900,1100,1300,600,1000,2000]) {
    await keyboardHold(sixPage,duration);assert.equal(await sixPage.locator('#result').isHidden(),true);
    await sixPage.locator('#next').click();
    if(await sixPage.locator('#handoff').isVisible())await sixPage.locator('#ready').click();
  }
  assert.equal(await sixPage.locator('.result-row').count(),6);
  assert.equal(await sixPage.locator('.winner .result-person strong').textContent(),'Player 5');
  await six.context.close();pass('all six players share a 1-second target, remain private at handoff, and receive the correct final ranking');

  const cancel=await setup();await freeze(cancel.page);await begin(cancel.page);const p=cancel.page;
  for(const reason of ['escape','blur','pointercancel']) {
    const r=await p.locator('#hold').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.clock.runFor(1000);
    if(reason==='escape')await p.keyboard.press('Escape');
    if(reason==='blur')await p.evaluate(()=>window.dispatchEvent(new Event('blur')));
    if(reason==='pointercancel')await p.locator('#hold').evaluate(el=>el.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true})));
    assert.equal(await p.locator('#hold').getAttribute('aria-pressed'),'false');assert.match(await p.locator('#cancel-note').textContent(),/cancelled/);
    await p.mouse.up();assert.equal(await p.locator('#locked').isHidden(),true);
  }
  await keyboardHold(p,8000);await p.locator('#next').click();assert.equal(await p.locator('#next-player').textContent(),'Player 2');
  await p.locator('#end-round').click();assert.equal(await p.locator('#setup').isVisible(),true);
  await cancel.context.close();pass('Escape, window blur and pointer cancellation discard the attempt without consuming a turn; End round resets safely');

  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024],[1440,1100]]) {
    const {context,page}=await setup({viewport:{width,height},isMobile:width<768,hasTouch:width<768},'zh-Hant');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:`${output}/setup-${width}.png`,fullPage:true});
    await begin(page);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const pad=await page.locator('#hold').boundingBox();assert.ok(pad.width>=200&&pad.height>=200&&pad.x>=0&&pad.x+pad.width<=width);
    assert.ok(pad.y>=0&&pad.y+pad.height<=height,'the focused hold target must fit completely in the viewport');
    if(width===320||width===375)await page.screenshot({path:`${output}/ready-${width}.png`,fullPage:true});
    await context.close();pass(`${width}px: Chinese setup, play and large circular hold target fit without horizontal overflow`);
  }

  const touch=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  await freeze(touch.page);await begin(touch.page);const t=touch.page,protocol=await touch.context.newCDPSession(t),r=await t.locator('#hold').boundingBox();
  const at={id:1,x:r.x+r.width/2,y:r.y+r.height/2};
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at]});
  assert.equal(await t.locator('#hold').getAttribute('aria-pressed'),'true');
  await t.clock.runFor(8000);await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...at,x:at.x+100}]});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await t.locator('#locked').isVisible(),true);
  await t.locator('#next').click();await t.locator('#ready').click();
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at]});await t.clock.runFor(1000);
  await protocol.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await t.locator('#hold').getAttribute('aria-pressed'),'false');assert.equal(await t.locator('#locked').isHidden(),true);
  await protocol.detach();await touch.context.close();pass('real touch holds, captured movement, release and cancellation work on phones');

  const motion=await setup({reducedMotion:'no-preference'});await begin(motion.page);
  const b=await motion.page.locator('#hold').boundingBox();await motion.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await motion.page.mouse.down();
  await motion.page.waitForFunction(()=>{
    const scale=Number(document.querySelector('#hold').style.getPropertyValue('--pad-scale'));
    return scale<.99&&scale>.85;
  });
  await motion.page.mouse.up();assert.equal(await motion.page.locator('#locked').isVisible(),true);
  assert.ok(await motion.page.locator('#locked').evaluate(el=>el.getAnimations().length)>0);
  await motion.context.close();pass('spring press feedback and circular lock reveal animate while the measurement runs independently');

  const landing=await setup();
  await landing.page.goto(new URL('../',base).href);
  const card=landing.page.locator('.game-card[data-game="just-a-sec"]');
  assert.equal(await card.locator('h2').textContent(),'Just a Sec');
  await card.locator('.favourite-button').click();
  assert.equal(await landing.page.locator('.game-card').first().getAttribute('data-game'),'just-a-sec');
  await card.locator('a.card').click();await landing.page.waitForURL(base);
  assert.equal(await landing.page.locator('#start').isVisible(),true);
  await landing.context.close();pass('the timing-game landing card can be favourited and opens the new game');

  const offline=await setup({serviceWorkers:'allow'});
  await offline.page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  await offline.context.setOffline(true);await offline.page.reload();await freeze(offline.page);await begin(offline.page);
  for(let i=0;i<2;i++){await keyboardHold(offline.page,8000);await offline.page.locator('#next').click();if(i===0)await offline.page.locator('#ready').click();}
  assert.equal(await offline.page.locator('#result').isVisible(),true);await offline.context.close();pass('a complete round works offline with local fonts, shared UI and motion modules');
  assert.deepEqual(errors,[]);pass('no uncaught browser errors');
  console.log(`\n${checks} Just a Sec browser checks passed.`);
}finally{await browser.close();}
