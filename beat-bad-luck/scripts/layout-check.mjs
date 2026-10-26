import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const browser=await chromium.launch({headless:true});const failures=[],errors=[];let cases=0;await mkdir('/tmp/bbl-layout-qa',{recursive:true});
const types=['tram','rain','wind','pigeon','receipt','auntie','blackout','minibus','sneeze'];
try{for(const [width,height]of (process.env.BBL_LAYOUT_SIZES?JSON.parse(process.env.BBL_LAYOUT_SIZES):[[320,568],[375,667],[390,844],[812,375],[1440,900]]))for(const lang of (process.env.BBL_LAYOUT_LANGS?.split(',')||['zh-Hant','en'])){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:'reduce',serviceWorkers:'block'});await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [index,type]of types.entries()){
  await page.addInitScript(({random,lang})=>{Math.random=()=>random;localStorage.setItem('playground.language.v1',lang);},{random:(index+.1)/9,lang});
  await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();await page.waitForTimeout(100);if(await page.locator('#ritual-loot-dialog[open]').count())await page.locator('#loot-close').click();await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  const click=s=>page.locator(s).evaluate(e=>e.click());await click('#start');for(let i=0;i<3;i++)await click(`[data-stick="${i}"]`);await click('#blow');await page.clock.fastForward(2050);await click('#confirm-worry');await page.clock.fastForward(2050);await page.clock.fastForward(12020);
  for(let i=0;i<4;i++){await click('#hit-zone');await page.clock.runFor(60);}
  assert.equal(await page.locator('#event-banner').getAttribute('data-event'),type);
  const result=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   const visible=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
   const selectors=['.ritual-top','.step-track','.beat-telemetry','#qte-call','#personality-hud','#hit-feedback','.gesture-controls','#phase-beat>.phase-instruction','.fong-bubble'];
   const text=selectors.map(s=>[s,document.querySelector(s)]).filter(([,e])=>visible(e)).map(([s,e])=>({id:s,...rect(e)}));
   const targets=[...document.querySelectorAll('.copy-target,.comic-event-prop,#wind-catch')].filter(visible).map(e=>{const r=rect(e),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:e.dataset.eventProp?e.dataset.eventProp+':'+e.dataset.token:e.dataset.copy?'copy:'+e.dataset.copy:e.id,...r,reachable:!!top&&(e===top||e.contains(top))};});
   return {text,targets,arena:rect(document.querySelector('#beat-arena')),paper:rect(document.querySelector('#hit-zone')),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;const issues=[];
  if(result.overflow)issues.push('horizontal overflow');for(const r of [...result.text,...result.targets])if(r.x<0||r.y<0||r.right>width+1||r.bottom>height+1)issues.push('offscreen '+r.id);
  for(let i=0;i<result.text.length;i++)for(let j=i+1;j<result.text.length;j++)if(overlap(result.text[i],result.text[j]))issues.push('text overlap '+result.text[i].id+' / '+result.text[j].id);
  for(const t of result.targets){if(!t.reachable)issues.push('unreachable '+t.id);for(const r of result.text)if(overlap(t,r))issues.push('target/text overlap '+t.id+' / '+r.id);}
  for(let i=0;i<result.targets.length;i++)for(let j=i+1;j<result.targets.length;j++)if(overlap(result.targets[i],result.targets[j]))issues.push('target overlap '+result.targets[i].id+' / '+result.targets[j].id);
  if(issues.length){failures.push({width,height,lang,type,issues,result});if(failures.length<8)await page.screenshot({path:`/tmp/bbl-layout-qa/fail-${width}-${lang}-${type}.png`});}
  if(lang==='zh-Hant'&&['rain','minibus','receipt'].includes(type))await page.screenshot({path:`/tmp/bbl-layout-qa/${width}-${type}.png`});cases++;
 }
 await context.close();console.log('CHECKED '+width+' '+lang+'; issues='+failures.length);
}
await writeFile('/tmp/bbl-layout-audit.json',JSON.stringify({cases,errors,failures},null,2));console.log(JSON.stringify({cases,errors,failures:failures.map(({width,lang,type,issues})=>({width,lang,type,issues}))}));assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
}finally{await browser.close();}
