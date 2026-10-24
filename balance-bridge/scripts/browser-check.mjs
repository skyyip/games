import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BALANCE_BRIDGE_URL||'http://localhost:5173/balance-bridge/';
let checks=0;const errors=[],pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup({language='en',permission='granted',blocked=false,...options}={}){
  const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
  await context.addInitScript(({language,permission,blocked})=>{
    if(blocked)Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});else localStorage.setItem('playground.language.v1',language);
    Math.random=()=>.4;
    window.__permissions=0;
    if(permission==='missing')Object.defineProperty(window,'DeviceOrientationEvent',{value:undefined});
    else window.DeviceOrientationEvent=class extends Event{
      constructor(type,init){super(type);Object.assign(this,init);}
      static requestPermission(){window.__permissions++;return permission==='pending'?new Promise(()=>{}):Promise.resolve(permission);}
    };
  },{language,permission,blocked});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));return {context,page};
}
async function startTouch(p){await p.locator('input[value=touch]').check();await p.locator('#start').evaluate(el=>el.click());assert.equal(await p.locator('#ready-overlay').isVisible(),true);await p.clock.runFor(3200);assert.equal(await p.locator('#world').getAttribute('data-state'),'playing');}
const lean=async p=>Number(await p.locator('#balance-meter').getAttribute('aria-valuenow'))/100*.94;
async function steer(p,seconds,{motion=false}={}){
  let previous=await lean(p);const seen=new Set();
  for(let i=0;i<seconds*10;i++){
    const angle=await lean(p),velocity=(angle-previous)/.1;previous=angle;const target=Math.max(-1,Math.min(1,-angle*1.6-velocity*.85));
    if(motion)await emit(p,target*17+Math.sign(target)*.7);else await p.locator('#steering').fill(String(Math.round(target*100)));
    await p.clock.runFor(100);const level=await p.locator('#event-banner').getAttribute('data-level');if(level&&await p.locator('#event-banner').isVisible())seen.add(level);
    assert.equal(await p.locator('#world').getAttribute('data-state'),'playing');
  }return seen;
}
async function emit(p,gamma=0,beta=0){await p.evaluate(({gamma,beta})=>{window.__gamma=gamma;window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{gamma,beta}));},{gamma,beta});}
async function calibrate(p){await p.evaluate(()=>{clearInterval(window.__sensor);window.__gamma=0;window.__sensor=setInterval(()=>window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{gamma:window.__gamma,beta:0})),50);});await p.clock.runFor(3500);}
try{
  await mkdir('/tmp/balance-bridge-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page:p}=await setup({language});assert.equal(await p.locator('html').getAttribute('lang'),language);assert.match(await p.title(),language==='en'?/Little Balance/:/火柴人走獨木橋/);assert.equal(await p.locator('.event-guide article').count(),5);
    await p.screenshot({path:`/tmp/balance-bridge-qa/setup-${language}.png`,fullPage:true});await startTouch(p);assert.equal(await p.locator('#records .record-row').count(),0);
    await p.clock.runFor(14000);assert.equal(await p.locator('#result').isVisible(),true);assert.equal(await p.locator('#records .record-row').count(),1);const time=await p.locator('#final-time').textContent();assert.match(time,/^\d+:\d{2}\.\d{2}$/);
    await p.screenshot({path:`/tmp/balance-bridge-qa/result-${language}.png`});
    for(let i=0;i<3;i++){await p.locator('#again').click();await p.clock.runFor(17000);assert.equal(await p.locator('#result').isVisible(),true);}
    assert.equal(await p.locator('#records .record-row').count(),3);const saved=await p.evaluate(()=>localStorage.getItem('balance-bridge.records.v1'));await p.reload();assert.equal(await p.evaluate(()=>localStorage.getItem('balance-bridge.records.v1')),saved);assert.equal(await p.locator('#records .record-row').count(),3);
    await context.close();pass(`${language}: five hazards, countdown, real fall, frozen survival time, top three, replay and reload persistence`);
  }
  const controlled=await setup({reducedMotion:'no-preference'}),p=controlled.page;await startTouch(p);await p.locator('body').focus();await p.keyboard.down('ArrowRight');await p.clock.runFor(250);await p.keyboard.up('ArrowRight');assert.ok(await lean(p)>0);
  const before=await p.locator('#walker-lean').getAttribute('transform');await p.keyboard.down('ArrowLeft');await p.clock.runFor(300);await p.keyboard.up('ArrowLeft');assert.notEqual(await p.locator('#walker-lean').getAttribute('transform'),before);
  await p.locator('#pause').click();const paused=await p.locator('#time').textContent();await p.clock.runFor(20000);assert.equal(await p.locator('#time').textContent(),paused);await p.locator('#resume').click();await p.clock.runFor(3100);assert.equal(await p.locator('#world').getAttribute('data-state'),'playing');
  await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await p.locator('#pause-overlay').isVisible(),true);await p.locator('#quit').click();assert.equal(await p.locator('#records .record-row').count(),0);
  await startTouch(p);const levels=await steer(p,40);assert.ok(levels.has('1')&&levels.has('3'));await p.screenshot({path:'/tmp/balance-bridge-qa/walking-event.png'});
  await p.locator('#pause').click();await p.locator('#quit').click();await controlled.context.close();pass('keyboard direction, held input release, pause/resume, blur pause, abandoned scores and forty seconds of interactive hazard recovery');

  const sensor=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true}),s=sensor.page;
  await s.locator('input[value=motion]').check();await s.locator('#start').click();assert.equal(await s.evaluate(()=>window.__permissions),1);await calibrate(s);assert.equal(await s.locator('#world').getAttribute('data-state'),'playing');
  await emit(s,12);await s.clock.runFor(300);assert.ok(await lean(s)>0);await s.locator('#pause').click();await s.locator('#resume').click();await calibrate(s);assert.equal(await s.evaluate(()=>window.__permissions),2);
  await steer(s,12,{motion:true});assert.equal(await s.locator('#touch-controls').isVisible(),false);await s.screenshot({path:'/tmp/balance-bridge-qa/phone-sensor.png'});await s.evaluate(()=>clearInterval(window.__sensor));await s.clock.runFor(2000);assert.equal(await s.locator('#pause-overlay').isVisible(),true);
  await s.locator('#paused-touch').click();await s.clock.runFor(3100);assert.equal(await s.locator('#touch-controls').isVisible(),true);await sensor.context.close();pass('phone permission, eight-sample calibration, directional sensor input, sensor recovery, missing-data pause and touch handover');

  for(const permission of ['denied','missing','pending','granted']){
    const fallback=await setup({permission}),f=fallback.page;await f.locator('input[value=motion]').check();await f.locator('#start').click();if(permission==='pending')await f.clock.runFor(12500);if(permission==='granted')await f.clock.runFor(6500);
    assert.equal(await f.locator('#fallback').isVisible(),true);await f.locator('#fallback').click();await f.clock.runFor(3100);assert.equal(await f.locator('#world').getAttribute('data-state'),'playing');await f.clock.runFor(14000);assert.equal(await f.locator('#result').isVisible(),true);await fallback.context.close();pass(`${permission}: unavailable, silent or unresolved sensor access offers a playable touch fallback`);
  }
  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024]]){
    const mobile=await setup({viewport:{width,height},isMobile:true,hasTouch:true,language:'zh-Hant'}),m=mobile.page;await startTouch(m);
    const box=await m.locator('.play-panel').boundingBox();assert.ok(Math.abs(box.y)<1&&Math.abs(box.height-height)<1);assert.ok(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const protocol=await mobile.context.newCDPSession(m),r=await m.locator('#right').boundingBox();await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2}]});await m.clock.runFor(250);await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await lean(m)>0);
    await m.locator('#pause').click();await m.locator('#quit').click();assert.equal(await m.locator('body').evaluate(el=>el.classList.contains('play-locked')),false);await startTouch(m);await m.clock.runFor(14000);assert.equal(await m.locator('#result').isVisible(),true);const again=await m.locator('#again').boundingBox();assert.ok(again.y>=0&&again.y+again.height<=height);
    await m.screenshot({path:`/tmp/balance-bridge-qa/phone-result-${width}.png`});await m.locator('#again').click();await m.clock.runFor(3100);assert.ok((await m.locator('.play-panel').boundingBox()).y>=0);await protocol.detach();await mobile.context.close();pass(`${width}×${height}: real touch steering, usable play/result controls and replay without viewport offsets`);
  }
  const blocked=await setup({blocked:true}),z=blocked.page;await startTouch(z);await z.clock.runFor(14000);assert.equal(await z.locator('#records .record-row').count(),1);assert.match(await z.locator('#storage-note').textContent(),/儲存|visit|裝置/);await blocked.context.close();pass('blocked storage still permits play and keeps records for the current visit');
  const offline=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:1000}}),o=await offline.newPage();o.on('pageerror',e=>errors.push(e.message));await o.goto(base);await o.evaluate(()=>navigator.serviceWorker.ready);await o.reload();await offline.setOffline(true);await o.reload();await o.clock.install();await o.clock.pauseAt(new Date(Date.now()+1000));await startTouch(o);await o.clock.runFor(14000);assert.equal(await o.locator('#result').isVisible(),true);await offline.close();pass('cached scenes, fonts, language and game modules complete a full offline round');
  assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`\n${checks} Little Balance browser checks passed.`);
}finally{await browser.close();}
