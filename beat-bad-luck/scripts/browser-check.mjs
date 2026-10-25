import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
const click=(p,s)=>p.locator(s).evaluate(e=>e.click());
async function setup({language='en',width=375,height=812,offline=false,motion='reduce',seedState=null,init}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:motion,serviceWorkers:offline?'allow':'block'});
 await context.addInitScript(({language,seedState})=>{try{localStorage.setItem('playground.language.v1',language);if(seedState&&!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify(seedState));}catch{}Math.random=()=>.3;},{language,seedState});
 if(init)await context.addInitScript(init);await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);return {context,page};
}
async function clock(p){await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));}
async function phase(p,name){assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),name);}
async function reachBeat(p){await click(p,'#start');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);await click(p,'#blow');await p.clock.runFor(2050);await phase(p,'worry');await click(p,'#confirm-worry');await p.clock.runFor(2050);await phase(p,'beat');}
async function complete(p){await p.clock.runFor(45100);await phase(p,'tiger');await click(p,'#feed');await p.clock.runFor(1600);await phase(p,'blessing');await click(p,'#bless');await p.clock.runFor(1600);assert.equal(await p.locator('#result').isVisible(),true);}
async function touchPair(context,p){const r=await p.locator('#hit-zone').boundingBox(),session=await context.newCDPSession(p);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width*.38,y:r.y+r.height*.55},{id:2,x:r.x+r.width*.67,y:r.y+r.height*.55}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();await p.clock.runFor(70);}
async function heavy(p){const r=await p.locator('#hit-zone').boundingBox();await p.mouse.move(r.x+r.width*.5,r.y+r.height*.35);await p.mouse.down();await p.mouse.move(r.x+r.width*.5,r.y+r.height*.35+95,{steps:5});await p.mouse.up();await p.clock.runFor(70);}
async function noLeaks(p){const words=await p.evaluate(()=>{const out=[],w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.parentElement.closest('script,style,[translate="no"],[aria-hidden="true"],.site-copyright')&&/[a-z]{3,}/i.test(n.textContent)&&!['改咗N次嘅Requirement','又誤點嘅地鐵/Bus','Work-life 失衡！','遇到Kam友'].includes(n.textContent.trim()))out.push(n.textContent.trim());}return out;});assert.deepEqual(words,[]);}
try{
 await mkdir('/tmp/beat-bad-luck-qa',{recursive:true});
 for(const language of ['zh-Hant','en']){
  const {context,page}=await setup({language});await page.locator('#worry-input').fill('<script>Eight revisions & no sleep</script>');await clock(page);await reachBeat(page);
  assert.equal(await page.locator('#doll-label').textContent(),'<script>Eight revisions & no sleep</script>');assert.equal(await page.locator('#doll-label script').count(),0);
  await touchPair(context,page);for(let i=0;i<20;i++)await heavy(page);assert.ok(Number(await page.locator('#live-score').textContent())>500);assert.equal(Number(await page.locator('#live-combo').textContent()),22);
  await page.screenshot({path:`/tmp/beat-bad-luck-qa/${language}-beat.png`});
  await click(page,'#pause');const score=await page.locator('#live-score').textContent(),remaining=await page.locator('#phase-clock').textContent();await page.clock.runFor(60000);assert.equal(await page.locator('#phase-clock').textContent(),remaining);await phase(page,'beat');await click(page,'#resume');assert.equal(await page.locator('#live-score').textContent(),score);
  await complete(page);assert.equal(await page.locator('.champion-icon').count(),1);assert.equal(await page.locator('.victory-confetti').count(),0);
  assert.equal(await page.locator('#final-hits').textContent(),'22');assert.ok(Number(await page.locator('#coins').textContent())>30);assert.match(await page.locator('#friend-arrival').textContent(),language==='en'?/Waiter/:/伙計/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));assert.equal(saved.rituals,1);assert.equal(saved.records.length,1);assert.ok(!JSON.stringify(saved).includes('Eight revisions'));assert.ok(saved.friends.includes('waiter'));
  await page.clock.runFor(10000);assert.equal(await page.locator('#coins').textContent(),String(saved.coins));
  if(language==='zh-Hant')await noLeaks(page);await page.screenshot({path:`/tmp/beat-bad-luck-qa/${language}-result.png`,fullPage:true});await click(page,'#to-stall');assert.equal(await page.locator('#welcome').isVisible(),true);await page.reload();assert.equal(await page.locator('#coins').textContent(),String(saved.coins));assert.equal(await page.locator('#records .record-row').count(),1);
  await context.close();pass(`${language}: five steps, native two-finger taps/heavy swipes, pause, safe custom text, one reward, friend, records and reload`);
 }
 for(const [width,height]of [[320,568],[375,812],[430,932],[812,375],[768,1024],[1440,1050]]){
  const {context,page}=await setup({width,height,language:'zh-Hant'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await clock(page);await reachBeat(page);
  const layout=await page.evaluate(()=>{const zone=document.querySelector('#hit-zone'),r=zone.getBoundingClientRect(),panel=document.querySelector('#play-panel').getBoundingClientRect(),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {hitVisible:r.top>=0&&r.bottom<=innerHeight,inside:zone.contains(top),panelFits:panel.top>=0&&panel.bottom<=innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(layout.hitVisible,true,JSON.stringify({width,height,layout}));assert.equal(layout.inside,true,JSON.stringify({width,height,layout}));assert.equal(layout.panelFits,true);assert.equal(layout.overflow,false);await heavy(page);
  await page.screenshot({path:`/tmp/beat-bad-luck-qa/play-${width}x${height}.png`});await click(page,'#pause');await click(page,'#quit');assert.equal(await page.locator('#coins').textContent(),'0');await context.close();pass(`${width}×${height}: playable hit target, unobstructed fixed panel, no overflow and reward-free quit`);
 }
 {
  const seed={version:1,coins:100000,merit:10000,owned:['flipflop'],equipped:'flipflop',decor:{neon:0,cat:0,radio:0,incense:0},friends:[],records:[],lastSeen:Date.now(),idleCarry:0};
  const {context,page}=await setup({seedState:seed});await click(page,'[data-decor="neon"]');assert.equal(await page.locator('#coins').textContent(),'98855');assert.equal(await page.locator('#play-panel').evaluate(e=>e.classList.contains('has-neon')),true);
  for(const id of ['cat','radio','incense','tiger','aquarium','three-stars','money-tree','amethyst'])await click(page,`[data-decor="${id}"]`);
  assert.equal(await page.locator('#stall-furnishings .stall-piece').count(),9);assert.equal(await page.locator('#stall-empty').isVisible(),false);
  for(const id of ['neon','cat','radio','incense','tiger','aquarium','three-stars','money-tree','amethyst']){assert.equal(await page.locator(`[data-piece="${id}"]`).getAttribute('data-level'),'1');assert.equal(await page.locator(`[data-piece="${id}"] svg`).count(),1);}
  const pieceCount=await page.locator('.stall-piece').count();await click(page,'[data-decor="cat"]');assert.equal(await page.locator('[data-piece="cat"]').getAttribute('data-level'),'2');assert.equal(await page.locator('.stall-piece').count(),pieceCount);
  await page.reload();assert.equal(await page.locator('.stall-piece').count(),9);assert.equal(await page.locator('[data-piece="cat"]').getAttribute('data-level'),'2');
  await click(page,'#tab-kits');for(const id of ['paper','bag','stool','sword','stamp','mace','record','pinwheel','iron-hammer','fortune-child','triple-trio','marksix-snowball','rebirth-paper','flipflop']){await click(page,`[data-weapon="${id}"]`);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')).equipped),id);}
  await page.locator('#tab-kits').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#tab-friends').getAttribute('aria-selected'),'true');assert.equal(await page.locator('#panel-friends').isVisible(),true);await context.close();pass('all fourteen kits buy/equip, decor upgrades, visible stall changes, currency accounting and keyboard tabs');
 }
 {
  const now=Date.now(),seed={version:1,coins:0,merit:0,owned:['flipflop'],equipped:'flipflop',decor:{neon:1,cat:0,radio:0,incense:0},friends:[],records:[],lastSeen:now-12*3600000,idleCarry:0};
  const {context,page}=await setup({seedState:seed});assert.equal(await page.locator('#coins').textContent(),'16');await page.reload();assert.equal(await page.locator('#coins').textContent(),'16');await context.close();pass('offline income caps at eight hours and does not pay twice on reload');
 }
 {
  const {context,page}=await setup({init:()=>{window.__micCalls=0;Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>{window.__micCalls++;return Promise.reject(new DOMException('denied','NotAllowedError'));}}});}});await clock(page);await click(page,'#start');assert.equal(await page.evaluate(()=>window.__micCalls),0);await click(page,'#microphone');await page.clock.runFor(30);assert.equal(await page.evaluate(()=>window.__micCalls),1);assert.match(await page.locator('#mic-note').textContent(),/No microphone/);for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.runFor(2050);await phase(page,'worry');await context.close();pass('microphone is opt-in; denied permission keeps the normal button ritual playable');
 }
 {
  const {context,page}=await setup({init:()=>{window.__stopped=0;Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>new Promise(resolve=>{window.__grant=()=>resolve({getTracks:()=>[{stop(){window.__stopped++;}}]});})}});}});await clock(page);await click(page,'#start');await click(page,'#microphone');await page.clock.runFor(8100);await phase(page,'worry');await page.evaluate(()=>window.__grant());await page.clock.runFor(30);assert.equal(await page.evaluate(()=>window.__stopped),1);await context.close();pass('a late microphone grant releases its stream after the incense step has ended');
 }
 {
  const {context,page}=await setup();await clock(page);await reachBeat(page);await page.clock.runFor(45050);await phase(page,'tiger');const pork=await page.locator('#pork-piece').boundingBox(),mouth=await page.locator('#paper-tiger .tiger-mouth').boundingBox();await page.mouse.move(pork.x+pork.width/2,pork.y+pork.height/2);await page.mouse.down();await page.mouse.move(mouth.x+mouth.width/2,mouth.y+mouth.height/2,{steps:10});assert.equal(await page.locator('#paper-tiger').evaluate(e=>e.classList.contains('is-ready')),true);await page.mouse.up();assert.equal(await page.locator('#phase-tiger').evaluate(e=>e.classList.contains('is-fed')),true);await page.clock.runFor(1600);await phase(page,'blessing');await context.close();pass('pork follows the pointer, attracts to the mouth, opens the tiger and feeds successfully');
 }
 {
  const {context,page}=await setup({offline:true,motion:'no-preference'});await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await context.setOffline(true);await page.reload();await clock(page);await click(page,'#start');await page.clock.runFor(73000);assert.equal(await page.locator('#result').isVisible(),true);assert.equal(await page.locator('#final-hits').textContent(),'0');assert.equal(await page.locator('.champion-icon').count(),1);await page.clock.runFor(400);assert.equal(await page.locator('.victory-confetti i').count(),36);await context.close();pass('offline reload caches the complete game and a gently assisted 72-second ritual celebrates normally');
 }
 {
  const {context,page}=await setup({init:()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}})});await clock(page);await click(page,'#start');await page.clock.runFor(73000);assert.equal(await page.locator('#result').isVisible(),true);assert.ok(Number(await page.locator('#coins').textContent())>0);await context.close();pass('blocked storage still permits a whole ritual and in-memory rewards');
 }
 assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`${checks} Beat the Bad Luck browser checks passed.`);
}finally{await browser.close();}
