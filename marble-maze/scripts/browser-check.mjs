import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {LEVELS} from '../src/levels.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.MARBLE_MAZE_URL||'http://localhost:5173/marble-maze/';
let checks=0;const errors=[],pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup({language='en',permission='granted',motionPermission='granted',storage='normal',...options}={}){
  const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
  await context.addInitScript(({language,permission,motionPermission,storage})=>{
    Math.random=()=>.99;
    if(storage==='blocked')Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});else{localStorage.setItem('playground.language.v1',language);if(storage==='full')Storage.prototype.setItem=()=>{throw new Error('full');};}
    window.__orientationRequests=0;window.__motionRequests=0;
    if(permission==='missing')Object.defineProperty(window,'DeviceOrientationEvent',{value:undefined});
    else window.DeviceOrientationEvent=class extends Event{constructor(type,init){super(type);Object.assign(this,init);}static requestPermission(){window.__orientationRequests++;return permission==='pending'?new Promise(()=>{}):Promise.resolve(permission);}};
    window.DeviceMotionEvent=class extends Event{constructor(type,init){super(type);Object.assign(this,init);}static requestPermission(){window.__motionRequests++;return Promise.resolve(motionPermission);}};
  },{language,permission,motionPermission,storage});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));return {context,page};
}
async function start(p,level=1,mode='touch'){
  await p.locator(`input[name=level][value="${level}"]`).check();await p.locator(`input[name=mode][value="${mode}"]`).check();await p.locator('#start').click();if(mode==='touch')await p.clock.runFor(3200);
}
const position=async p=>{const values=(await p.locator('#position-status').textContent()).match(/\d+\.\d+/g);return {x:Number(values[0]),y:Number(values[1])};};
const seconds=async p=>{const [m,s]=(await p.locator('#time').textContent()).split(':');return Number(m)*60+Number(s);};
async function walk(p,level){
  const route=LEVELS[level-1].routes[1].filter((point,i,a)=>i===0||i===a.length-1||(a[i-1].x!==a[i+1].x&&a[i-1].y!==a[i+1].y));
  let waypoint=1,previous=await position(p);const held=new Set();
  for(let step=0;step<600;step++){
    if(await p.locator('#board-area').getAttribute('data-state')!=='playing')break;
    const current=await position(p),target=route[waypoint],dx=target.x+.5-current.x,dy=target.y+.5-current.y,vx=(current.x-previous.x)/.1,vy=(current.y-previous.y)/.1;previous=current;
    if(Math.hypot(dx,dy)<.25&&waypoint<route.length-1)waypoint++;
    let x=dx*3.5-vx*.8,y=dy*3.5-vy*.8;
    if(level===2&&waypoint===route.length-1&&await seconds(p)<12){x=0;y=0;}
    const wanted=new Set();if(x>.3)wanted.add('ArrowRight');if(x<-.3)wanted.add('ArrowLeft');if(y>.3)wanted.add('ArrowDown');if(y<-.3)wanted.add('ArrowUp');
    for(const key of held)if(!wanted.has(key)){await p.keyboard.up(key);held.delete(key);}for(const key of wanted)if(!held.has(key)){await p.keyboard.down(key);held.add(key);}
    await p.clock.runFor(100);
  }
  for(const key of held)await p.keyboard.up(key);await p.clock.runFor(1100);assert.equal(await p.locator('#result').isVisible(),true);assert.match(await p.locator('#result-title').textContent(),/found|出口/);
}
async function calibrate(p){
  await p.evaluate(()=>{clearInterval(window.__sensorTimer);window.__pose={gamma:0,beta:0};window.__accel={x:0,y:0,z:0};window.__sensorTimer=setInterval(()=>{window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',window.__pose));window.dispatchEvent(new DeviceMotionEvent('devicemotion',{acceleration:window.__accel}));},40);});await p.clock.runFor(3500);
}
async function burst(p,x){await p.evaluate(x=>window.__accel={x,y:0,z:0},x);await p.clock.runFor(90);await p.evaluate(()=>window.__accel={x:0,y:0,z:0});await p.clock.runFor(190);}
async function visibleInBoard(p,selector){const r=await p.locator(selector).boundingBox(),board=await p.locator('#board-area').boundingBox();assert.ok(r.y>=board.y&&r.y+r.height<=board.y+board.height+.5,`${selector} fits the scene`);assert.ok(await p.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}
try{
  await mkdir('/tmp/marble-maze-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page:p}=await setup({language});assert.equal(await p.locator('html').getAttribute('lang'),language);assert.equal(await p.locator('input[name=level]').count(),5);await p.screenshot({path:`/tmp/marble-maze-qa/setup-${language}.png`,fullPage:true});await start(p);await p.locator('#board').focus();await p.keyboard.down('ArrowUp');await p.clock.runFor(5000);await p.keyboard.up('ArrowUp');await p.clock.runFor(1000);assert.equal(await p.locator('#result').isVisible(),true);assert.equal(await p.locator('#records .record-row').count(),1);
    await p.locator('#again').click();await p.clock.runFor(3200);await p.keyboard.down('ArrowUp');await p.clock.runFor(600);await p.keyboard.up('ArrowUp');await p.locator('#pause').click();const time=await p.locator('#time').textContent();await p.clock.runFor(3000);assert.equal(await p.locator('#time').textContent(),time);await p.locator('#resume').click();await p.clock.runFor(3200);await p.keyboard.down('ArrowUp');await p.clock.runFor(5000);await p.keyboard.up('ArrowUp');await p.clock.runFor(1000);
    for(let i=0;i<2;i++){await p.locator('#again').click();await p.clock.runFor(3200);await p.keyboard.down('ArrowUp');await p.clock.runFor(5000);await p.keyboard.up('ArrowUp');await p.clock.runFor(1000);}assert.equal(await p.locator('#records .record-row').count(),3);const saved=await p.evaluate(()=>localStorage.getItem('marble-maze.records.v1'));await p.reload();assert.equal(await p.evaluate(()=>localStorage.getItem('marble-maze.records.v1')),saved);assert.equal(await p.locator('#records .record-row').count(),3);await p.locator('input[name=level][value="2"]').check();assert.equal(await p.locator('#records .record-row').count(),0);await context.close();pass(`${language}: five choices, real keyboard completion, pause/resume, fastest-three ranking, replay and per-level persistence`);
  }
  const all=await setup(),a=all.page;for(const level of [2,3,4,5]){await start(a,level);await walk(a,level);assert.equal(await a.locator('#records .record-row').count(),1);await a.screenshot({path:`/tmp/marble-maze-qa/level-${level}-complete.png`});await a.locator('#change').click();}await all.context.close();pass('all five distinct mazes finish through actual rolling controls and keep separate winning records');

  const mist=await setup(),f=mist.page;await start(f,5);await f.clock.runFor(11000);assert.match(await f.locator('#fog-label').textContent(),/mist/);await f.screenshot({path:'/tmp/marble-maze-qa/mist-and-bomb.png'});const before=await position(f);await f.locator('#shake').click();await f.clock.runFor(350);assert.equal(await f.locator('#shake-count').textContent(),'1 / 2');const nudged=await position(f);assert.ok(Math.hypot(nudged.x-before.x,nudged.y-before.y)>.05);await f.locator('#shake').click();await f.clock.runFor(350);assert.match(await f.locator('#fog-label').textContent(),/clear/);await f.screenshot({path:'/tmp/marble-maze-qa/mist-cleared.png'});await f.clock.runFor(49000);assert.equal(await f.locator('#result').isVisible(),true);assert.match(await f.locator('#result-title').textContent(),/Oops/);assert.equal(await f.locator('#records .record-row').count(),0);await mist.context.close();pass('mist thickens, two distinct taps both affect the marble and clear it, rolling bombs cause an unsaved loss');

  const sensor=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true}),s=sensor.page;await start(s,5,'motion');assert.equal(await s.evaluate(()=>window.__orientationRequests),1);assert.equal(await s.evaluate(()=>window.__motionRequests),1);await calibrate(s);assert.equal(await s.locator('#board-area').getAttribute('data-state'),'playing');assert.equal(await s.locator('#shake').isVisible(),false);await s.clock.runFor(6500);await burst(s,20);assert.equal(await s.locator('#fog-label').textContent(),'The mist is rolling in.');await burst(s,-20);assert.match(await s.locator('#fog-label').textContent(),/clear/);
  const previous=await position(s);await s.evaluate(()=>window.__pose={gamma:0,beta:-10});await s.clock.runFor(500);assert.ok((await position(s)).y<previous.y);await s.evaluate(()=>window.__pose={gamma:0,beta:0});await s.screenshot({path:'/tmp/marble-maze-qa/phone-tilt.png'});await s.evaluate(()=>clearInterval(window.__sensorTimer));await s.clock.runFor(2300);assert.equal(await s.locator('#pause-overlay').isVisible(),true);await s.locator('#paused-touch').click();await s.clock.runFor(3200);assert.equal(await s.locator('#direction-pad').isVisible(),true);await sensor.context.close();pass('dual sensor permission, four-axis calibration, real shake bursts clear fog with inertia, tilt movement and stale-reading touch recovery');

  for(const permission of ['denied','missing','silent','pending']){
    const fallback=await setup({permission:permission==='silent'?'granted':permission}),p=fallback.page;await start(p,1,'motion');if(permission==='silent')await p.clock.runFor(6500);if(permission==='pending')await p.clock.runFor(12500);assert.equal(await p.locator('#fallback').isVisible(),true);await p.locator('#fallback').click();await p.clock.runFor(3200);await p.keyboard.down('ArrowUp');await p.clock.runFor(5000);await p.keyboard.up('ArrowUp');await p.clock.runFor(1000);assert.equal(await p.locator('#result').isVisible(),true);await fallback.context.close();pass(`${permission} tilt access: a complete playable touch/keyboard fallback`);
  }
  const noShake=await setup({motionPermission:'denied'}),n=noShake.page;await start(n,1,'motion');await calibrate(n);assert.equal(await n.locator('#shake').isVisible(),true);assert.equal(await n.locator('#board-area').getAttribute('data-state'),'playing');await noShake.context.close();pass('declined shake access retains tilt play and exposes the two-tap shake alternative');
  for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024]]){
    const mobile=await setup({viewport:{width,height},isMobile:true,hasTouch:true,language:'zh-Hant'}),p=mobile.page;await start(p);const box=await p.locator('.play-panel').boundingBox();assert.ok(Math.abs(box.y)<1&&Math.abs(box.height-height)<1);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const protocol=await mobile.context.newCDPSession(p),up=await p.locator('[data-steer=up]').boundingBox();await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:up.x+up.width/2,y:up.y+up.height/2}]});await p.clock.runFor(5000);await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.clock.runFor(1000);assert.equal(await p.locator('#result').isVisible(),true);await visibleInBoard(p,'#again');await visibleInBoard(p,'#change');await p.screenshot({path:`/tmp/marble-maze-qa/phone-result-${width}.png`});await p.locator('#again').click();await p.clock.runFor(3200);await p.locator('#pause').click();await visibleInBoard(p,'#resume');await visibleInBoard(p,'#quit');await p.locator('#quit').click();assert.equal(await p.locator('body').evaluate(el=>el.classList.contains('play-locked')),false);await protocol.detach();await mobile.context.close();pass(`${width}×${height}: real touch rolling, usable results/pause actions and full play-view reset`);
  }
  for(const storage of ['blocked','full']){const fallback=await setup({storage}),p=fallback.page;await start(p);await p.keyboard.down('ArrowUp');await p.clock.runFor(5000);await p.keyboard.up('ArrowUp');await p.clock.runFor(1000);assert.equal(await p.locator('#records .record-row').count(),1);assert.match(await p.locator('#storage-note').textContent(),/這次|本次|visit/);await fallback.context.close();pass(`${storage} storage preserves successful visit-only times`);}
  const offline=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:1000},reducedMotion:'reduce'}),o=await offline.newPage();o.on('pageerror',e=>errors.push(e.message));await o.goto(base);await o.evaluate(()=>navigator.serviceWorker.ready);await o.reload();await offline.setOffline(true);await o.reload();await o.clock.install();await o.clock.pauseAt(new Date(Date.now()+1000));await start(o);await o.keyboard.down('ArrowUp');await o.clock.runFor(5000);await o.keyboard.up('ArrowUp');await o.clock.runFor(1000);assert.equal(await o.locator('#records .record-row').count(),1);await offline.close();pass('cached mazes, fonts, language, rolling and record logic support a full offline run');
  assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`\n${checks} Marble & Mist browser checks passed.`);
}finally{await browser.close();}
