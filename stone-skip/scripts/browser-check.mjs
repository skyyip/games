import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.STONE_SKIP_URL||'http://localhost:5173/stone-skip/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup({language='en',motion='granted',...options}={}){
  const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
  await context.addInitScript(({language,motion})=>{
    try{localStorage.setItem('playground.language.v1',language);if(!localStorage.getItem('stone-skip.records.v1'))localStorage.setItem('stone-skip.records.v1','legacy-kept');}catch{}
    if(motion==='missing')Object.defineProperty(window,'DeviceMotionEvent',{value:undefined});
    else{window.__motionRequests=0;window.DeviceMotionEvent=class extends Event{constructor(type,init){super(type);Object.assign(this,init);}static requestPermission(){window.__motionRequests++;return Promise.resolve(motion);}};}
  },{language,motion});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));return {context,page};
}
async function arm(page,mode='gesture'){
  await page.locator(`input[name=mode][value=${mode}]`).check();await page.locator('#start').evaluate(el=>el.click());
}
const centre=async el=>{const r=await el.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
async function swipe(page){
  const p=await centre(page.locator('#stone'));await page.mouse.move(p.x,p.y);await page.mouse.down();await page.clock.runFor(35);
  await page.mouse.move(p.x+15,p.y-45);await page.clock.runFor(35);await page.mouse.move(p.x+35,p.y-140);await page.mouse.up();
}
async function keyboard(page,duration=900){await page.locator('#stone').focus();await page.keyboard.down('Space');await page.clock.runFor(duration);await page.keyboard.up('Space');}
async function finished(page,normal=false){await page.clock.runFor(normal?10000:5000);assert.equal(await page.locator('#result').isVisible(),true);}
async function emit(page,x=0,gravity=false){await page.clock.runFor(50);await page.evaluate(({x,gravity})=>window.dispatchEvent(new DeviceMotionEvent('devicemotion',gravity?{acceleration:null,accelerationIncludingGravity:{x,y:0,z:9.81}}:{acceleration:{x,y:0,z:0}})),{x,gravity});}
async function sensorThrow(page,gravity=false){for(let i=0;i<11;i++)await emit(page,0,gravity);for(let i=0;i<4;i++)await emit(page,22,gravity);await page.clock.runFor(400);}
try{
  await mkdir('/tmp/stone-skip-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language});assert.equal(await page.locator('html').getAttribute('lang'),language);
    assert.match(await page.title(),language==='en'?/Stone Skip/:/打水漂/);
    for(const [key,value] of Object.entries({angle:'20'})){await page.locator(`#${key}-value`).fill(value);await page.locator(`#${key}-value`).dispatchEvent('input');}assert.equal(await page.locator('#setup-score').textContent(),'20.0 / 20');
    assert.equal(await page.locator('#length,#width,#weight,#spin').count(),0);assert.equal(await page.locator('#settings .setting').count(),1);assert.deepEqual(await page.locator('.recipe-parts b').allTextContents(),['20%','80%']);
    await page.screenshot({path:`/tmp/stone-skip-qa/setup-${language}.png`,fullPage:true});await arm(page);
    await swipe(page);assert.equal(await page.locator('#result').isVisible(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),null);
    assert.equal(await page.locator('#flight-counter').isVisible(),true);assert.equal(await page.locator('#angle').isDisabled(),true);
    await finished(page);assert.equal(await page.locator('#contributions > li').count(),2);assert.match(await page.locator('#contributions').textContent(),/20%/);assert.match(await page.locator('#contributions').textContent(),/80%/);assert.equal(await page.locator('#result-source').textContent(),language==='en'?'Swipe throw':'手指甩投');
    assert.equal(await page.locator('#distance-records .record-row').count(),1);assert.equal(await page.locator('#bounce-records .record-row').count(),1);
    await page.screenshot({path:`/tmp/stone-skip-qa/result-${language}.png`});
    for(const duration of [300,600,1050]){await page.locator('#again').evaluate(el=>el.click());await keyboard(page,duration);await finished(page);}
    assert.equal(await page.locator('#distance-records .record-row').count(),3);assert.equal(await page.locator('#bounce-records .record-row').count(),3);
    assert.equal(await page.evaluate(()=>localStorage.getItem('stone-skip.records.v1')),'legacy-kept');const saved=await page.evaluate(()=>localStorage.getItem('stone-skip.records.v2'));await page.reload();assert.equal(await page.locator('#distance-records .record-row').count(),3);assert.equal(await page.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),saved);
    await context.close();pass(`${language}: exact setup shares, swipe, animation before scoring, keyboard replay, independent top threes and reload persistence`);
  }
  const cancel=await setup(),p=cancel.page;await arm(p);await p.locator('#stone').click();assert.equal(await p.locator('#result').isVisible(),false);
  await p.keyboard.down('Space');await p.clock.runFor(500);await p.keyboard.press('Escape');await p.keyboard.up('Space');await p.clock.runFor(500);assert.equal(await p.locator('#stone').isVisible(),true);
  const at=await centre(p.locator('#stone'));await p.mouse.move(at.x,at.y);await p.mouse.down();await p.locator('#stone').dispatchEvent('pointercancel');await p.mouse.up();
  assert.equal(await p.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),null);
  await swipe(p);await p.locator('#exit').evaluate(el=>el.click());await p.clock.runFor(5500);assert.equal(await p.locator('#result').isVisible(),false);assert.equal(await p.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),null);
  await cancel.context.close();pass('taps, Escape, cancelled pointers and abandoned flights never create records');

  for(const gravity of [false,true]){
    const sensor=await setup(),s=sensor.page;await arm(s,'motion');assert.equal(await s.evaluate(()=>window.__motionRequests),1);
    for(let i=0;i<11;i++)await emit(s,0,gravity);assert.equal(await s.locator('#flight-counter').isVisible(),false);
    for(let i=0;i<4;i++)await emit(s,22,gravity);await s.clock.runFor(400);assert.equal(await s.locator('#flight-counter').isVisible(),true);
    assert.equal(await s.locator('#result').isVisible(),false);await finished(s);assert.equal(await s.locator('#result-source').textContent(),'Phone motion');
    assert.match(await s.locator('#result-power').textContent(),/[1-9]\d% strength/);const data=await s.evaluate(()=>JSON.parse(localStorage.getItem('stone-skip.records.v2')));
    assert.equal(data.records[0].source,'motion');assert.ok(data.records[0].motion.force>0);assert.ok(data.records[0].motion.speed>0);assert.ok(data.records[0].motion.amplitude>0);assert.equal(await s.locator('#motion-metrics > div').count(),3);await s.locator('.breakdown').evaluate(el=>el.open=true);assert.match(await s.locator('#motion-metrics').innerText(),/Throw force/);assert.match(await s.locator('#motion-metrics').innerText(),/Throw speed/);assert.match(await s.locator('#motion-metrics').innerText(),/Swing range/);await sensor.context.close();pass(`${gravity?'gravity-inclusive':'linear'} sensor events: permission, calibration, stationary rejection and measured eighty-percent composite throw`);
  }
  for(const motion of ['denied','missing']){
    const fallback=await setup({motion}),s=fallback.page;await arm(s,'motion');assert.equal(await s.locator('#motion-actions').isVisible(),true);
    assert.match(await s.locator('#throw-help').textContent(),motion==='denied'?/declined/:/unavailable/);
    await s.locator('#use-gesture').click();await swipe(s);await finished(s);assert.equal(await s.locator('#result-source').textContent(),'Swipe throw');await fallback.context.close();pass(`${motion} sensor access offers a working swipe alternative`);
  }
  const silent=await setup(),s=silent.page;await arm(s,'motion');await s.clock.fastForward(8100);
  assert.match(await s.locator('#throw-help').textContent(),/No throw detected/);assert.equal(await s.locator('#enable-motion').isEnabled(),true);assert.equal(await s.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),null);
  await silent.context.close();pass('no sensor data times out without inventing a throw or saving a record');

  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024]]){
    const mobile=await setup({viewport:{width,height},isMobile:true,hasTouch:true}),m=mobile.page;await arm(m);
    const view=await m.locator('.play-panel').boundingBox();assert.ok(Math.abs(view.y)<1&&Math.abs(view.height-height)<1);assert.ok(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const protocol=await mobile.context.newCDPSession(m),point=await centre(m.locator('#stone'));
    await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...point}]});await m.clock.runFor(40);
    await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:point.x+25,y:point.y-100}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await m.locator('#flight-counter').isVisible(),true);await finished(m);assert.equal(await m.locator('#result-source').textContent(),'Swipe throw');
    const button=await m.locator('#again').boundingBox();assert.ok(button.y>=0&&button.y+button.height<=height);
    await m.screenshot({path:`/tmp/stone-skip-qa/mobile-result-${width}.png`});await m.locator('#change').evaluate(el=>el.click());assert.equal(await m.locator('body').evaluate(el=>el.classList.contains('play-locked')),false);
    await m.locator('#start').evaluate(el=>el.click());assert.ok((await m.locator('.play-panel').boundingBox()).y>=0);await protocol.detach();await mobile.context.close();pass(`${width}×${height}: real touch swipe, visible result actions and repeated play-view cleanup`);
  }
  const normal=await setup({reducedMotion:'no-preference'}),n=normal.page;await arm(n);await swipe(n);await n.clock.runFor(1300);
  assert.equal(await n.locator('#result').isVisible(),false);assert.ok(Number(await n.locator('#live-bounces').textContent())>=1);
  await n.screenshot({path:'/tmp/stone-skip-qa/flight-and-ripples.png'});await finished(n,true);await normal.context.close();pass('ordinary-motion throw shows the path, stone, bounce feedback and ripples before revealing a result');

  const returning=await setup(),r=returning.page;await arm(r);await swipe(r);await r.clock.runFor(300);
  await r.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await r.clock.runFor(5000);
  assert.equal(await r.locator('#result').isVisible(),false);assert.equal(await r.evaluate(()=>localStorage.getItem('stone-skip.records.v2')),null);
  await r.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await finished(r);
  assert.equal(await r.locator('#distance-records .record-row').count(),1);await returning.context.close();pass('a suspended cached page resumes its flight and records the throw exactly once after return');

  const offline=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  await offline.addInitScript(()=>localStorage.setItem('playground.language.v1','en'));const o=await offline.newPage();o.on('pageerror',e=>errors.push(e.message));await o.goto(base);await o.evaluate(()=>navigator.serviceWorker.ready);await o.reload();
  await offline.setOffline(true);await o.reload();await o.clock.install();await o.clock.pauseAt(new Date(Date.now()+1000));await arm(o);await keyboard(o);await finished(o);assert.equal(await o.locator('#distance-records .record-row').count(),1);await offline.close();pass('cached fonts, river, input and scoring support a complete offline round');
  assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`\n${checks} Stone Skip browser checks passed.`);
}finally{await browser.close();}
