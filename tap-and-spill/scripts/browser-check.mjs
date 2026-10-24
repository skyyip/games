// Cartoon layout and gameplay QA using the existing optional Playwright setup.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.TAP_AND_SPILL_URL||'http://localhost:5173/tap-and-spill/';
const output=process.env.TAP_AND_SPILL_SCREENSHOTS||'/tmp/tap-cartoon-qa';
const errors=[];let checks=0;
const pass=message=>{checks++;console.log(`PASS ${message}`);};
async function tearPixels(page) {
 return page.locator('#cv').evaluate(canvas=>{
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  let count=0;
  for(let i=0;i<pixels.length;i+=4)if(pixels[i]<95&&pixels[i+1]<195&&pixels[i+2]>225&&pixels[i+3]>200)count++;
  return count;
 });
}
async function layout(page) {
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const result=await page.evaluate(()=>{
  const rect=id=>document.querySelector(id).getBoundingClientRect();
  const scene=rect('#cv'),hud=rect('#hud'),bottom=rect('#bottom'),who=rect('#who'),mute=rect('#mute');
  const apart=(a,b)=>a.bottom<=b.top||b.bottom<=a.top||a.right<=b.left||b.right<=a.left;
  return {
   textOutsideScene:apart(hud,scene)&&apart(bottom,scene),
   playerTextFits:who.top>=hud.top&&who.bottom<=hud.bottom&&who.right<=mute.left,
   sceneVisible:scene.width>0&&scene.height>0,
   soundTarget:mute.width>=44&&mute.height>=44,
   noOverflow:document.documentElement.scrollWidth<=innerWidth,
  };
 });
 assert.ok(Object.values(result).every(Boolean),JSON.stringify(result));
}
try {
 await mkdir(output,{recursive:true});
 for(const language of ['zh-Hant','en']) {
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.addInitScript(lang=>{localStorage.setItem('playground.language.v1',lang);Math.random=()=>.5;},language);
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const [width,height] of [[320,568],[375,667],[375,812],[430,932],[1440,900],[812,375]]) {
   await page.setViewportSize({width,height});await page.goto(base);
   await page.locator('#rows input').first().fill('Bubble1234');
   await page.locator('#start').click();await layout(page);
   assert.equal(await page.locator('#mute svg').count(),1);
   await page.locator('#mute').focus();await page.keyboard.press('Space');
   assert.equal(await page.locator('#mute').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#mute').getAttribute('aria-label'),language==='zh-Hant'?'開啟音效':'Unmute sound');
   await page.keyboard.press('Space');assert.equal(await page.locator('#mute').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('#mute svg').count(),1);
   await page.locator('#go').click();
   const target=await page.locator('#touch').boundingBox();
   await page.mouse.move(target.x+target.width*.7,target.y+target.height*.6);await page.mouse.down();
   await page.waitForTimeout(300);await layout(page);
   assert.ok((await page.locator('#mode').textContent()).length>0);
   if(width===375&&height===812)await page.screenshot({path:`${output}/${language}-pouring.png`});
   await page.mouse.up();await page.locator('#go').waitFor({state:'visible'});
   assert.ok(!(await page.locator('#whoName').textContent()).includes('Bubble1234'));
   pass(`${language} ${width}x${height}: text clear of cup/spout, cartoon sound toggle and valid turn handoff`);
  }
  await page.setViewportSize({width:375,height:812});await page.goto(base);
  await page.locator('#start').click();await page.locator('#go').click();
  await page.waitForFunction(()=>document.querySelector('#cv').dataset.expression==='happy');
  const target=await page.locator('#touch').boundingBox();
  await page.mouse.move(target.x+target.width*.7,target.y+target.height*.6);await page.mouse.down();
  await page.waitForFunction(()=>document.querySelector('#cv').dataset.expression==='worried',null,{timeout:15000});
  assert.match(await page.locator('#cv').getAttribute('aria-label'),language==='zh-Hant'?/擔心/:/worried/);
  assert.equal(await page.locator('#result').isHidden(),true);
  const sweat=await tearPixels(page);
  await page.locator('#cv').screenshot({path:`${output}/${language}-worried.png`});
  await page.waitForFunction(()=>document.querySelector('#cv').dataset.expression==='crying',null,{timeout:5000});
  assert.match(await page.locator('#cv').getAttribute('aria-label'),language==='zh-Hant'?/哭/:/crying/);
  assert.ok(await tearPixels(page)>Math.max(100,sweat*3),'overflow must visibly draw two streams of tears');
  await page.locator('#cv').screenshot({path:`${output}/${language}-crying.png`});
  pass(`${language}: near-full worried face changes to visible tears on overflow, including reduced motion`);
  await page.locator('#result').waitFor({state:'visible',timeout:18000});await page.mouse.up();
  assert.match(await page.locator('#roundInfo').textContent(),/1750/);
  assert.equal(await page.locator('#stats>div').count(),2);
  await page.locator('#again').click();await page.locator('#go').waitFor({state:'visible'});await layout(page);
  await page.waitForFunction(()=>document.querySelector('#cv').dataset.expression==='happy');
  assert.match(await page.locator('#cv').getAttribute('aria-label'),language==='zh-Hant'?/笑臉/:/smiling/);
  pass(`${language}: overflow, ranking and replay retain the original game rules`);
  await page.goto(base);await page.setViewportSize({width:375,height:568});
  for(let i=0;i<4;i++)await page.locator('#plus').click();
  assert.equal(await page.locator('#rows input').count(),6);
  await page.locator('#rows input').last().fill('Six');await page.locator('#start').click();
  assert.equal(await page.locator('#hud').isVisible(),true);
  pass(`${language}: six-player setup stays scrollable on short phones`);
  await context.close();
 }
 assert.deepEqual(errors,[]);pass('no uncaught errors across cartoon rendering, sound controls and gameplay');
 console.log(`\n${checks} Tap & Spill browser checks passed.`);
} finally {await browser.close();}
