import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {EVENTS,EVENT_MOVES} from '../src/ritual-flavour.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const selectors=['.ritual-top','.step-track','.beat-telemetry','#qte-call','#personality-hud','#beat-arena','#hit-zone','.beat-reaction','.gesture-controls','.fong-bubble'];
const errors=[];let cases=0;
async function boxes(page){return page.evaluate(selectors=>Object.fromEntries(selectors.map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return [selector,[r.x,r.y,r.width,r.height]];})),selectors);}
function unchanged(before,after,label){for(const selector of selectors)for(let i=0;i<4;i++)assert.ok(Math.abs(before[selector][i]-after[selector][i])<=.6,`${label}: ${selector} moved/resized: ${before[selector]} → ${after[selector]}`);}
async function eventFits(page,label){
 const state=await page.locator('#event-banner').evaluate(e=>{const r=e.getBoundingClientRect(),text=e.querySelector('#event-label').getBoundingClientRect();return {fits:e.scrollHeight<=e.clientHeight+1&&text.top>=r.top&&text.bottom<=r.bottom,buttons:[...e.querySelectorAll('button')].filter(b=>!b.hidden).map(b=>{const t=b.getBoundingClientRect(),hit=document.elementFromPoint(t.x+t.width/2,t.y+t.height/2);return {fits:t.top>=r.top&&t.bottom<=r.bottom,hit:!!hit&&(b===hit||b.contains(hit))};})};});
 assert.ok(state.fits,`${label}: event text clipped`);assert.ok(state.buttons.every(b=>b.fits&&b.hit),`${label}: event control clipped/covered`);
}
try{
 await mkdir('/tmp/bbl-stable-events',{recursive:true});
 for(const [width,height]of [[320,568],[390,844],[812,375]])for(const lang of ['zh-Hant','en'])for(const [index,event]of EVENTS.entries()){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'no-preference',serviceWorkers:'block'});
  await context.addInitScript(({random,lang})=>{Math.random=()=>random;localStorage.setItem('playground.language.v1',lang);},{random:(index+.1)/9,lang});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();await page.waitForTimeout(100);if(await page.locator('#ritual-loot-dialog[open]').count())await page.locator('#loot-close').click();await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  const click=s=>page.locator(s).evaluate(e=>e.click());await click('#start');for(let i=0;i<3;i++)await click(`[data-stick="${i}"]`);await click('#blow');await page.clock.fastForward(2050);await click('#confirm-worry');await page.clock.fastForward(2050);
  const before=await boxes(page),label=`${width} ${lang} ${event.id}`;let elapsed=0;
  const advance=async target=>{await page.clock.fastForward(target-elapsed);elapsed=target;unchanged(before,await boxes(page),`${label} at ${target}ms`);};
  for(const time of [2000,4500,5500,9000,11800,12000])await advance(time);
  assert.equal(await page.locator('#event-banner').getAttribute('data-event'),event.id);await eventFits(page,label);
  if(event.id==='tram'){for(let i=0;i<4;i++){await advance(12000+i*700);await click('#hit-zone');await page.clock.fastForward(20);elapsed+=20;unchanged(before,await boxes(page),label+' bell/progress');}}
  else if(event.id==='rain'||event.id==='wind')for(let i=0;i<(event.id==='rain'?3:2);i++){await click(event.id==='rain'?'#rain-cover':'#wind-catch');await page.clock.fastForward(350);elapsed+=350;unchanged(before,await boxes(page),label+' catch/shelter progress');}
  else if(event.id==='minibus'){for(let i=0;i<3;i++){await click(`[data-event-prop="minibus"][data-next="true"]`);await page.clock.fastForward(220);elapsed+=220;unchanged(before,await boxes(page),label+' coin/progress');}}
  else for(let i=0;i<EVENT_MOVES[event.id][1];i++){await click('#event-move');await page.clock.fastForward(220);elapsed+=220;unchanged(before,await boxes(page),label+' move/progress');}
  await page.clock.fastForward(20);elapsed+=20;assert.match(await page.locator('#event-label').textContent(),/事件處理好|Event handled/);unchanged(before,await boxes(page),label+' handled');await eventFits(page,label);
  for(const time of [14500,17400,17600,19500,25000,31900,32000,37400,49900,50000,55400,55800,59900]){await advance(time);if(await page.locator('#event-banner').isVisible())await eventFits(page,label);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(['rain','sneeze'].includes(event.id))await page.screenshot({path:`/tmp/bbl-stable-events/${width}-${lang}-${event.id}.png`});
  await context.close();cases++;console.log(`PASS ${label}: fixed geometry through QTE, event entry/progress/completion/expiry and later events`);
 }
 assert.deepEqual(errors,[]);console.log(`${cases} animated event stability scenarios passed with no page errors.`);
}finally{await browser.close();}
