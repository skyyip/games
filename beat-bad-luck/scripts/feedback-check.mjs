import {endRitual} from './interaction-helpers.mjs';
import assert from 'node:assert/strict';
import {paperGesture} from './paper-gesture.mjs';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(language='zh-Hant',width=375,ios=false){
 const context=await browser.newContext({viewport:{width,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block',...(ios?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(language=>{
  localStorage.setItem('playground.language.v1',language);window.__audio=[];window.__media=[];const NativeMedia=window.Audio;window.Audio=function(...args){const node=new NativeMedia(...args);window.__media.push(node);return node;};Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'auto'}});
  const NativeAudio=window.AudioContext||window.webkitAudioContext;
  window.AudioContext=class extends NativeAudio{
   constructor(){super();window.__audio.push(this);this.gains=[];this.buffers=[];this.oscillators=0;}
   createGain(){const node=super.createGain();this.gains.push(node);return node;}
   createOscillator(){this.oscillators++;return super.createOscillator();}
   createDynamicsCompressor(){const node=super.createDynamicsCompressor(),connect=node.connect.bind(node);node.connect=destination=>{this.probe=this.createAnalyser();this.probe.fftSize=256;connect(this.probe);this.probe.connect(destination);return destination;};return node;}
   createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source),stop=source.stop.bind(source);source.active=false;source.start=(...args)=>{source.active=true;return start(...args);};source.stop=(...args)=>{source.active=false;return stop(...args);};source.addEventListener('ended',()=>source.active=false);this.buffers.push(source);return source;}
  };
 },language);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();return {context,page};
}
const audioState=p=>p.evaluate(()=>{const c=window.__audio[0];return {contexts:window.__audio.length,state:c?.state,gain:c?.gains[0].gain.value,loops:c?.buffers.filter(s=>s.loop&&s.active).length??0,notes:c?.oscillators??0};});
const ready=p=>p.waitForFunction(()=>window.__audio[0]?.state==='running'&&window.__audio[0].buffers.some(s=>s.loop&&s.active));
const click=(p,s)=>p.locator(s).evaluate(e=>e.click());
try{
 await mkdir('/tmp/bbl-feedback-qa',{recursive:true});
 for(const language of ['zh-Hant','en']){
  const {context,page}=await setup(language);assert.equal(await page.locator('#sound-setup').getAttribute('aria-pressed'),'true');assert.equal((await audioState(page)).contexts,0);
  await page.locator('#sound-setup').click();assert.equal(await page.locator('#sound-setup').getAttribute('aria-pressed'),'false');await page.waitForTimeout(80);assert.equal((await audioState(page)).gain,0);assert.equal((await audioState(page)).loops,0);
  await page.locator('#sound-setup').click();await ready(page);let state=await audioState(page);assert.equal(state.loops,1);assert.ok(state.notes>=5);assert.ok(Math.abs(state.gain-.34)<.0001);
  for(let i=0;i<4;i++){await page.locator('#sound-setup').click();assert.equal((await audioState(page)).loops,0);await page.locator('#sound-setup').click();await ready(page);assert.equal((await audioState(page)).loops,1);}
  await page.locator('#start').click();await ready(page);await page.locator('#pause').click();await page.waitForFunction(()=>window.__audio[0].state==='suspended');assert.equal((await audioState(page)).loops,0);
  await page.locator('#resume').click();await ready(page);await page.locator('#sound').click();assert.equal(await page.locator('#sound').textContent(),'🔇');assert.equal(await page.locator('#sound-setup').getAttribute('aria-pressed'),'false');assert.equal((await audioState(page)).gain,0);assert.equal((await audioState(page)).loops,0);
  await page.locator('#pause').click();await page.locator('#resume').click();await page.waitForTimeout(50);assert.equal((await audioState(page)).gain,0);assert.equal((await audioState(page)).loops,0);
  await page.locator('#sound').click();await ready(page);await page.locator('#pause').click();await endRitual(page);await ready(page);assert.equal((await audioState(page)).loops,1);assert.equal((await audioState(page)).contexts,1);
  await context.close();pass(`${language}: default on, first-click mute race, native music, repeated toggles, synchronized icons, pause/resume and lobby return`);
 }
 {
  const {context,page}=await setup('zh-Hant',375,true);await page.locator('#worry-input').tap();await ready(page);
  await page.waitForFunction(()=>{const c=window.__audio[0],data=new Float32Array(c.probe.fftSize);c.probe.getFloatTimeDomainData(data);return data.some(n=>Math.abs(n)>.00001);});
  assert.equal(await page.evaluate(()=>navigator.audioSession.type),'playback');assert.equal(await page.evaluate(()=>window.__media[0].paused),false);
  await page.locator('#start').tap();await ready(page);await page.evaluate(()=>window.__audio[0].suspend());await page.waitForFunction(()=>window.__audio[0].state==='suspended');assert.equal((await audioState(page)).loops,0);
  await page.locator('[data-stick="0"]').tap();await ready(page);assert.equal((await audioState(page)).loops,1);
  await page.locator('#sound').tap();await page.waitForTimeout(150);assert.equal((await audioState(page)).gain,0);assert.equal(await page.evaluate(()=>window.__media[0].paused),true);
  await page.locator('#sound').tap();await ready(page);await page.waitForFunction(()=>window.__media[0].paused===false);await context.close();pass('iPhone touch endings unlock the playback route with measured audio output; later taps recover a suspended context; mute stops the media bridge');
 }
 {
  const {context,page}=await setup('zh-Hant',320);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await click(page,'#start');for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.fastForward(2050);await click(page,'#confirm-worry');await page.clock.fastForward(2050);
  const paper=page.locator('#paper-doll');await paper.screenshot({path:'/tmp/bbl-feedback-qa/paper-fresh.png'});await page.clock.fastForward(9000);await click(page,'#hit-zone');await page.clock.runFor(20);await paper.screenshot({path:'/tmp/bbl-feedback-qa/paper-creased.png'});
  for(let i=0;i<30;i++){await page.clock.runFor(70);await paperGesture(page,'circle');}await page.clock.fastForward(17000);
  const before=await paper.evaluate(e=>Number(e.style.getPropertyValue('--paper-wear')));assert.ok(before>.7);assert.ok(await paper.locator('.paper-frayed-fibres').count());assert.ok(await paper.locator('.paper-patch').evaluate(e=>Number(getComputedStyle(e).opacity))>.5);assert.ok((await paper.locator('.paper-head-pose').evaluate(e=>getComputedStyle(e).transform))!=='none');await paper.screenshot({path:'/tmp/bbl-feedback-qa/paper-tattered.png'});
  await click(page,'#pause');await page.clock.fastForward(10000);assert.equal(await paper.evaluate(e=>Number(e.style.getPropertyValue('--paper-wear'))),before);await click(page,'#resume');await page.clock.fastForward(13000);await paperGesture(page,'heavy');await page.clock.runFor(20);await paper.screenshot({path:'/tmp/bbl-feedback-qa/paper-final-cry.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await context.close();pass('320px paper: fresh/creased/tattered crying states, staggered rips, fibres, folded layers, sagging head, pause and no overflow');
 }
 assert.deepEqual(errors,[]);console.log(`${checks} audio and paper browser scenarios passed.`);
}finally{await browser.close();}
