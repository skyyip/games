import {launchSkill} from './interaction-helpers.mjs';
import {EXTRA_KITS} from '../src/kit-catalog.js';
import {WEAPONS} from '../src/catalog.js';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const directory=resolve(process.argv[2]||join(tmpdir(),'playground-previews')),browser=await chromium.launch({headless:true});
const demo=await readFile(join(directory,'beat-bad-luck-skills-demo.html'),'utf8'),regular=await readFile(join(directory,'beat-bad-luck.html'),'utf8');
for(const html of [demo,regular]){assert.ok(Buffer.byteLength(html)<2_000_000);assert.ok(!html.includes('data:text/javascript'));assert.ok(!html.includes("Object.defineProperty(window,'localStorage'"));assert.match(html,/<script data-preview-bundle>/);}
let checks=0;
async function open(html,locked=false,virtualClock=false){
 if(virtualClock)html=html.replace('<head>',`<head><script>let previewAt=0;const nativeRaf=requestAnimationFrame.bind(window);Object.defineProperty(performance,'now',{value:()=>previewAt});window.requestAnimationFrame=callback=>nativeRaf(()=>callback(previewAt));window.previewAdvance=ms=>{previewAt+=ms;return new Promise(resolve=>nativeRaf(()=>nativeRaf(resolve)));};Math.random=()=>.1;</script>`);
 const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce',serviceWorkers:'allow'});
 if(locked)await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{configurable:false,get(){throw new DOMException('Preview storage is unavailable','SecurityError');}});Object.defineProperty(navigator,'serviceWorker',{get(){throw new DOMException('Preview blocks service workers','SecurityError');}});});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://preview.test/**',route=>route.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none';"},body:'<body style="margin:0"><iframe sandbox="allow-scripts" style="width:100vw;height:100vh;border:0"></iframe></body>'}));
 await page.goto('https://preview.test/');await page.locator('iframe').evaluate((iframe,html)=>iframe.srcdoc=html,html);
 const frame=page.frameLocator('iframe');await frame.locator('#start:not(:disabled)').waitFor();await frame.locator('body').evaluate(()=>new Promise(r=>setTimeout(r,0)));if(await frame.locator('#ritual-loot-dialog[open]').count())await frame.locator('#loot-close').click();return {context,page,frame,errors};
}
try{
 // No rewritten clock or test helper is injected for the reported opening/start path.
 for(const [name,html]of [['regular',regular],['all-kit',demo]])for(const locked of [false,true]){
  const {context,frame,errors}=await open(html,locked);assert.equal(await frame.locator('#kit-preview').isVisible(),true);await frame.locator('#start').click();await frame.locator('#play-panel[data-phase="incense"]').waitFor();assert.deepEqual(errors,[]);await context.close();checks++;console.log(`PASS real open and Start: ${name}; storage ${locked?'locked':'default'}; CSP forbids data scripts`);
 }
 for(const weapon of process.env.PREVIEW_KIT_IDS?.split(',')||WEAPONS.map(w=>w.id)){
  const {context,page,frame,errors}=await open(demo,true,true),click=s=>frame.locator(s).evaluate(e=>e.click()),advance=ms=>frame.locator('body').evaluate((body,ms)=>window.previewAdvance(ms),ms);
  assert.equal(await frame.locator('#preview-kit-select option').count(),WEAPONS.length);if(weapon!=='flipflop')await frame.locator('#preview-kit-select').selectOption(weapon);
  await click('#start');for(let i=0;i<3;i++)await click(`[data-stick="${i}"]`);await click('#blow');await advance(2050);await click('#confirm-worry');await advance(2050);
  for(let i=0;i<12;i++){await click('#hit-zone');await advance(80);}await launchSkill(frame,{native:false});assert.equal(await frame.locator('#kit-stage').isVisible(),true);assert.equal(await frame.locator('#preview-kit-select').isDisabled(),true);
  if(EXTRA_KITS[weapon])for(const step of EXTRA_KITS[weapon].steps){
   if(step.type==='beat')await advance(step.period);else await advance(120);
   if(['hold','aim'].includes(step.type)){await click('[data-expanded="begin"]');await advance(step.ms+80);await click('[data-expanded="release"]');}else await click('[data-expanded="assist"]');
  }
  if(weapon==='flying-dagger')for(let i=0;i<3;i++){await advance(900);await click('#knife-'+i);}
  if(weapon==='plunger-nunchucks')for(const id of ['pull-left','pull-right','pull-release'])await click('#'+id);
  if(weapon==='beauty-fist'){for(let i=0;i<5;i++){await click('#makeup-tap');await advance(120);}await click('#makeup-mirror');}
  if(weapon==='solar-torch'){await click('#solar-place');await advance(1000);await click('#solar-shine');}
  if(weapon==='immunity-token')for(let i=0;i<2;i++){await click('#token-aside');await click('#stamp-here');}
  if(weapon==='flipflop')for(const side of ['left','right','left','right']){await advance(600);await click('#slap-'+side);}
  assert.equal(await frame.locator('#kit-stage').evaluate(e=>e.classList.contains('is-win')),true,weapon);
  await advance(90100);await click('#feed');await click('#feed');await advance(1600);for(let i=0;i<3;i++)await click('#purify-next');await advance(1000);await click('#throw-blocks');await advance(2600);
  assert.equal(await frame.locator('#result').isVisible(),true);assert.match(await frame.locator('#kit-result').textContent(),/1\/1/);assert.ok(await frame.locator('#personal-postcard svg').count()>0);assert.deepEqual(errors,[]);if(await frame.locator('#ritual-loot-dialog[open]').count())await click('#loot-close');await click('#to-stall');assert.equal(await frame.locator('#preview-kit-select').isDisabled(),false);await context.close();checks++;console.log('PASS locked opaque preview: complete '+weapon+' skill, ritual and fortune');
 }
 console.log(`${checks} compact preview compatibility checks passed.`);
}finally{await browser.close();}
