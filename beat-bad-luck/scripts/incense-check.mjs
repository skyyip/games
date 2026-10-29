import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),errors=[];
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const invoke=(p,s)=>p.locator(s).evaluate(node=>node.click());
const phase=p=>p.locator('#play-panel').getAttribute('data-phase');
async function centre(p,s){const r=await p.locator(s).boundingBox();assert.ok(r,s);return [r.x+r.width/2,r.y+r.height/2];}
async function swipe(p){const r=await p.locator('#incense-zone').boundingBox();await p.mouse.move(r.x+20,r.y+r.height*.5);await p.mouse.down();await p.mouse.move(r.x+r.width-20,r.y+r.height*.5,{steps:8});assert.equal(await p.locator('#incense-zone').evaluate(node=>node.classList.contains('is-kindling')),true);await p.mouse.up();}
async function reachable(p,s){assert.equal(await p.locator(s).evaluate(node=>{const r=node.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&(hit===node||node.contains(hit));}),true,s);}

try{
 await mkdir('/tmp/incense-comic-qa',{recursive:true});
 for(const [width,height,lang,mode,reduced]of [[320,568,'zh-Hant','denied',false],[390,844,'en','listen',false],[812,375,'zh-Hant','late',true],[1440,900,'en','auto',false]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:reduced?'reduce':'no-preference',serviceWorkers:'block'});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  await context.addInitScript(({lang,mode})=>{
   localStorage.setItem('playground.language.v1',lang);localStorage.setItem('beat-bad-luck.preferences.v1',JSON.stringify({version:1,sound:false}));Math.random=()=>.3;
   window.__stopped=0;window.__breath=0;window.__requests=0;
   const NativeAudio=window.AudioContext||window.webkitAudioContext;
   window.AudioContext=class extends NativeAudio{createMediaStreamSource(stream){return stream.__mock?{connect(){}}:super.createMediaStreamSource(stream);}createAnalyser(){const a=super.createAnalyser();a.getFloatTimeDomainData=data=>data.fill(window.__breath);return a;}};
   const stream=()=>({__mock:true,getTracks:()=>[{stop(){window.__stopped++;}}]});
   Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:()=>{window.__requests++;return mode==='denied'?Promise.reject(new DOMException('Denied for test','NotAllowedError')):mode==='late'?new Promise(resolve=>window.__grantMic=()=>resolve(stream())):Promise.resolve(stream());}});
  },{lang,mode});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.stack));await p.goto(base);await p.locator('#daily-reward-note').waitFor();await p.locator('#worry-select').selectOption('work');await p.evaluate(()=>document.fonts.ready);await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').click();assert.equal(await phase(p),'incense');assert.equal(await p.locator('#incense-progress').textContent(),'0/3');assert.equal(await p.locator('#blow').isDisabled(),true);
  assert.equal(await p.evaluate(()=>window.__requests),0,'microphone is opt-in');const initial=await p.locator('#incense-zone').boundingBox();for(const s of ['[data-stick="0"]','[data-stick="1"]','[data-stick="2"]','#microphone'])await reachable(p,s);await p.screenshot({path:`/tmp/incense-comic-qa/start-${width}.png`});
  // Pointer interruption must not light a stick or leave a match attached.
  await p.mouse.move(...await centre(p,'[data-stick="0"]'));await p.mouse.down();await invoke(p,'#pause');await p.mouse.up();await p.clock.fastForward(4000);assert.equal(await phase(p),'incense');assert.equal(await p.locator('#incense-progress').textContent(),'0/3');assert.equal(await p.locator('#incense-zone').evaluate(node=>node.classList.contains('is-kindling')),false);await p.locator('#resume').click();await p.clock.runFor(20);
  await p.locator('#microphone').click();
  if(mode==='denied'){await p.locator('#phase-incense[data-mic="error"]').waitFor();assert.equal(await p.locator('#microphone').isDisabled(),false);assert.equal(await p.locator('#microphone .incense-button-icon svg').count(),1);await p.locator('#microphone').click();await p.locator('#phase-incense[data-mic="error"]').waitFor();assert.equal(await p.evaluate(()=>window.__requests),2);for(let i=0;i<3;i++)await p.locator(`[data-stick="${i}"]`).tap();}
  else if(mode==='late'){
   assert.equal(await p.locator('#microphone').isDisabled(),true);await p.locator('#pause').click();await p.evaluate(()=>window.__grantMic());await p.waitForFunction(()=>window.__stopped===1);assert.equal(await p.locator('#phase-incense').getAttribute('data-mic'),'idle');await p.locator('#resume').click();await p.clock.runFor(20);
   for(let i=0;i<3;i++){await p.locator(`[data-stick="${i}"]`).focus();await p.keyboard.press('Enter');}
  }else{
   await p.locator('#phase-incense[data-mic="listening"]').waitFor();assert.equal(await p.locator('#microphone').getAttribute('aria-pressed'),'true');await p.clock.runFor(50);
   if(mode==='auto'){
    await p.locator('#microphone').click();assert.equal(await p.evaluate(()=>window.__stopped),1);assert.equal(await p.locator('#phase-incense').getAttribute('data-mic'),'idle');await p.locator('#microphone').click();await p.locator('#phase-incense[data-mic="listening"]').waitFor();await p.clock.fastForward(8100);assert.equal(await phase(p),'worry');assert.equal(await p.evaluate(()=>window.__stopped),2);assert.equal(await p.locator('.incense-comic-layer > *').count(),0);await context.close();console.log(`PASS ${width} ${lang}: microphone on/off, assisted timeout and stream cleanup`);continue;
   }
   await p.evaluate(()=>window.__breath=.2);await p.clock.runFor(250);assert.equal(await p.locator('#phase-incense').evaluate(node=>node.classList.contains('is-blown')),false,'mic cannot blow unlit incense');await p.evaluate(()=>window.__breath=0);await swipe(p);
  }
  assert.equal(await p.locator('#incense-progress').textContent(),'3/3');assert.equal(await p.locator('[data-stick][aria-pressed="true"]').count(),3);assert.equal(await p.locator('#blow').isDisabled(),false);await reachable(p,'#blow');
  const after=await p.locator('#incense-zone').boundingBox();for(const key of ['x','y','width','height'])assert.ok(Math.abs(after[key]-initial[key])<.6,`incense zone changed ${key}`);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:`/tmp/incense-comic-qa/lit-${width}.png`});
  await p.locator('#pause').click();const flames=await p.locator('.incense-flame-friend svg').first().evaluate(node=>getComputedStyle(node).animationPlayState);assert.equal(flames,'paused');await p.clock.fastForward(3000);assert.equal(await p.locator('#incense-progress').textContent(),'3/3');await p.locator('#resume').click();await p.clock.runFor(20);
  if(mode==='listen'){
   // Pause stops microphone access; starting again explicitly resumes listening.
   assert.equal(await p.locator('#phase-incense').getAttribute('data-mic'),'idle');await p.locator('#microphone').click();await p.locator('#phase-incense[data-mic="listening"]').waitFor();await p.evaluate(()=>window.__breath=.2);await p.clock.runFor(300);assert.equal(await p.evaluate(()=>window.__stopped),2);
  }else await p.locator('#blow').click();
  assert.equal(await p.locator('#phase-incense').evaluate(node=>node.classList.contains('is-blown')),true);assert.equal(await p.locator('#blow').isDisabled(),true);assert.equal(await p.locator('#microphone').isDisabled(),true);assert.equal(await p.locator('.incense-button-icon svg').count(),2);await p.screenshot({path:`/tmp/incense-comic-qa/blown-${width}.png`});
  await p.clock.fastForward(2100);assert.equal(await phase(p),'worry');assert.equal(await p.locator('.incense-comic-layer > *').count(),0);await invoke(p,'#confirm-worry');await p.clock.fastForward(2050);assert.equal(await phase(p),'beat');await invoke(p,'#hit-zone');
  if(width===320){await p.clock.fastForward(90100);await invoke(p,'#feed');await invoke(p,'#feed');await p.clock.fastForward(1600);await invoke(p,'#purify-next');await p.clock.fastForward(1000);await invoke(p,'#throw-blocks');await p.clock.fastForward(2600);assert.equal(await p.locator('#result').isVisible(),true);await p.locator('#loot-close').click();await p.locator('#again').click();assert.equal(await p.locator('#incense-progress').textContent(),'0/3');await invoke(p,'[data-stick="0"]');assert.ok(await p.locator('.incense-comic-layer > *').count()>0,'new ritual replays the lighting effect');assert.equal(await p.locator('#incense-progress').textContent(),'1/3');}
  await context.close();console.log(`PASS ${width} ${lang}: ${mode}, native light/blow, cancelled pointer, stable targets, paused motion, progress and phase/replay cleanup`);
 }
 assert.deepEqual(errors,[]);console.log('All four comic incense profiles passed; microphone streams and breath levels are simulated.');
}finally{await browser.close();}
