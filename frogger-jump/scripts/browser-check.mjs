import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from '../src/game.js';import {RECORD_KEY} from '../src/records.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.FROGGER_URL||'http://localhost:5260/frogger-jump/',out='/tmp/frogger-browser';await mkdir(out,{recursive:true});
try{for(const [width,height,lang]of JSON.parse(process.env.FROGGER_VIEWPORTS||'[[320,568,"zh-Hant"],[390,844,"zh-Hant"],[812,375,"en"],[1280,900,"en"]]')){
 const c=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:width===812?'reduce':'no-preference',serviceWorkers:'block'});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await c.addInitScript(({lang})=>{localStorage.setItem('playground.language.v1',lang);let seed=7;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);window.frogFrames=0;const request=window.requestAnimationFrame;window.requestAnimationFrame=fn=>request.call(window,t=>{window.frogFrames++;fn(t);});},{lang});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);assert.equal(await p.locator('#play-shell').getAttribute('data-state'),'ready');assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await p.screenshot({path:`${out}/home-${width}.png`,fullPage:true});
 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').click();await p.clock.runFor(40);assert.equal(await p.locator('#play-shell').getAttribute('data-state'),'idle');assert.equal(await p.locator('#stage').count(),0);assert.equal(await p.locator('#route-description li').count(),3);
 let time=0,seed=7;const reference=new FroggerGame({random:()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32),now:()=>time});reference.start();
 const step=async ms=>{time+=ms;reference.update();await p.clock.runFor(ms);};
 // Head-level meter, distinct green/yellow/red power, cancellation, and no layout shift.
 const box=await p.locator('#hold-button').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;await p.mouse.move(x,y);await p.mouse.down();
 for(const [ms,name]of [[100,'green'],[375,'yellow'],[380,'red']]){await p.clock.runFor(ms);assert(await p.locator('#frog-charge').isVisible());const bounds=await p.locator('#frog-charge').boundingBox(),river=await p.locator('#river').boundingBox();assert(bounds.x>=river.x&&bounds.x+bounds.width<=river.x+river.width);assert(bounds.y>=river.y&&bounds.y+bounds.height<river.y+river.height*.9);const color=await p.locator('#frog-charge').evaluate(n=>n.style.getPropertyValue('--power-color'));assert.match(color,/rgb\(/);await p.screenshot({path:`${out}/charge-${name}-${width}.png`});}
 await p.locator('#hold-button').dispatchEvent('pointercancel',{pointerId:1});await p.mouse.up();assert.equal(await p.locator('#play-shell').getAttribute('data-state'),'idle');
 // Product clock advanced by the cancelled hold; keep the independent model aligned.
 time+=855;
 async function jump(kind='mouse',amount=null){const hold=amount??Math.round(distance(reference.current,reference.target)/MAX_JUMP*CHARGE_UP_MS);assert(reference.beginCharge());const b=await p.locator('#hold-button').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;let touch;
  if(kind==='touch'){touch=await c.newCDPSession(p);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x,y},{id:1,x:x+8,y}]});}else if(kind==='keyboard'){await p.locator('#jump-control').focus();await p.keyboard.down('Space');}else{await p.mouse.move(x,y);await p.mouse.down();}
  await step(hold);assert(reference.release());const duration=reference.jump.duration;
  if(kind==='touch'){await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();}else if(kind==='keyboard')await p.keyboard.up('Space');else await p.mouse.up();assert(!await p.locator('#frog-charge').isVisible());await step(Math.ceil(duration)+100);assert.equal(Number(await p.locator('#score').textContent()),reference.score);
 }
 const seen=new Set();let idleChecked=false;
 for(let i=0;i<40;i++){
  if(reference.targetIndex===2)seen.add('thorns');if(reference.target.small)seen.add('small');if(reference.target.sinking)seen.add('sink');if(reference.target.angler)seen.add('fish');
  await jump(width===390&&i===1?'touch':i===2?'keyboard':'mouse');
  if(reference.targetIndex===2)await p.screenshot({path:`${out}/thorns-${width}.png`});
  if(!idleChecked&&!reference.current.sinking&&!reference.current.angler){await step(800);const frames=await p.evaluate(()=>frogFrames);await step(3000);assert.equal(await p.evaluate(()=>frogFrames),frames,'normal idle logs stop requesting frames');idleChecked=true;}
  if(i>=18&&seen.size===4&&reference.current.angler)break;
 }
 assert.equal(seen.size,4);assert(reference.current.angler);assert(idleChecked);const score=reference.score;await p.screenshot({path:`${out}/fish-warning-${width}.png`});
 await p.locator('#pause').click();reference.pause();const pausedText=await p.locator('#hazard').textContent();await p.clock.fastForward(10000);time+=10000;assert.equal(await p.locator('#hazard').textContent(),pausedText);await p.locator('#resume').click();reference.resume();
 await step(Math.ceil(reference.fishRemaining)+150);assert.equal(await p.locator('#play-shell').getAttribute('data-state'),'drowning');await step(350);await p.screenshot({path:`${out}/angler-${width}.png`});await step(1500);assert(await p.locator('#result-dialog').isVisible());assert.equal(Number(await p.locator('#final-score').textContent()),score);assert.equal((await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),RECORD_KEY))[0].score,score);await p.screenshot({path:`${out}/result-${width}.png`});
 await p.locator('#again').click();await p.clock.runFor(100);assert.equal(await p.locator('#score').textContent(),'0');assert.equal(Number(await p.locator('#best').textContent()),score);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert(await p.locator('#pause-dialog').isVisible());await p.clock.fastForward(10000);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await p.locator('#resume').click();
 await p.locator('#jump-control').focus();await p.keyboard.down('Space');await p.clock.runFor(1);await p.keyboard.up('Space');await p.clock.runFor(950);await p.screenshot({path:`${out}/crocodile-${width}.png`});await p.clock.runFor(1600);assert(await p.locator('#result-dialog').isVisible());assert.equal(await p.locator('#final-score').textContent(),'0');assert.equal(Number(await p.locator('#result-best').textContent()),score);await p.locator('#result-home').click();await p.reload({waitUntil:'networkidle'});assert.equal(Number(await p.locator('#best').textContent()),score);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);
 console.log(`PASS ${width}×${height} ${lang}: head power meter, gradient, ${score} I/Z jumps, random small/sinking/thorn/fish logs, thorn skips, paused fish deadline, both predators, keyboard/touch, replay, records and idle frame suspension.`);await c.close();
}}finally{await browser.close();}
