import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
import {paperGesture} from './paper-gesture.mjs';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
async function setup(language='zh-Hant',width=375,height=812,motion='reduce'){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:true,reducedMotion:motion,serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/beat-bad-luck/?lang='+language,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 const click=s=>page.locator(s).evaluate(e=>e.click());await click('#start');for(let i=0;i<3;i++)await click(`[data-stick="${i}"]`);await click('#blow');await page.clock.runFor(2050);await click('#confirm-worry');await page.clock.runFor(2050);
 return {context,page,click};
}
try{
 await mkdir('/tmp/bbl-gestures',{recursive:true});
 for(const language of ['zh-Hant','en']){
  const {context,page,click}=await setup(language),session=await context.newCDPSession(page),zone=page.locator('#hit-zone'),r=await zone.boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height*.45;
  const touch=(type,points)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y}))});
  const last=async type=>{await page.clock.runFor(80);assert.equal(await zone.getAttribute('data-last-gesture'),type);};
  await touch('touchStart',[[1,cx-40,cy],[2,cx+40,cy]]);await touch('touchEnd',[]);await last('tap');assert.equal(await page.locator('#live-combo').textContent(),'2');
  await touch('touchStart',[[1,cx-36,cy]]);for(const x of [cx+36,cx-36,cx+36,cx-36])await touch('touchMove',[[1,x,cy]]);await touch('touchEnd',[]);await last('rub');
  const radius=Math.min(r.width,r.height)*.3;assert.ok(radius>=24);
  await touch('touchStart',[[1,cx+radius,cy]]);for(let i=1;i<=40;i++){const a=i/40*Math.PI*2;await touch('touchMove',[[1,cx+radius*Math.cos(a),cy+radius*Math.sin(a)]]);}await touch('touchEnd',[]);await last('circle');
  await touch('touchStart',[[1,cx-50,cy],[2,cx+50,cy]]);for(let d=45;d>=25;d-=5)await touch('touchMove',[[1,cx-d,cy],[2,cx+d,cy]]);await touch('touchEnd',[]);await last('pinch');assert.equal(await page.locator('#live-combo').textContent(),'5');
  await touch('touchStart',[[1,cx,cy-35]]);await touch('touchMove',[[1,cx,cy+35]]);await touch('touchEnd',[]);await last('heavy');
  const before=await page.locator('#live-score').textContent();await touch('touchStart',[[1,cx,cy]]);await touch('touchMove',[[1,cx+20,cy+10]]);await touch('touchCancel',[]);await page.clock.runFor(100);assert.equal(await page.locator('#live-score').textContent(),before);assert.equal(await page.locator('#gesture-trail-path').getAttribute('d'),'');
  await touch('touchStart',[[1,cx,cy]]);await touch('touchMove',[[1,cx+20,cy]]);await click('#pause');await touch('touchEnd',[]);await page.clock.runFor(500);assert.equal(await page.locator('#live-score').textContent(),before);await click('#resume');
  const hintState=await page.locator('[data-gesture]').evaluateAll(nodes=>nodes.every(e=>e.tagName==='SPAN'&&e.tabIndex===-1&&!e.hasAttribute('role')));assert.equal(hintState,true);
  const untouched=await page.locator('#live-score').textContent();for(const hint of await page.locator('[data-gesture]').all()){await hint.click();await hint.evaluate(e=>{e.click();e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));e.dispatchEvent(new KeyboardEvent('keyup',{key:' ',bubbles:true}));e.focus();});assert.equal(await hint.evaluate(e=>e===document.activeElement),false);}await page.clock.runFor(80);assert.equal(await page.locator('#live-score').textContent(),untouched);
  await zone.focus();await page.keyboard.press('Space');await last('tap');assert.ok(Number(await page.locator('#live-score').textContent())>Number(untouched));
  if(language==='zh-Hant')await page.screenshot({path:'/tmp/bbl-gestures/touch-moves.png'});
  await context.close();console.log(`PASS ${language}: native gestures, cancel/pause, display-only hints and keyboard tap on paper`);
 }
 {
  const {context,page,click}=await setup();await page.clock.runFor(17550);assert.match(await page.locator('#qte-call').textContent(),/搓/);assert.equal(await page.locator('[data-gesture="rub"]').evaluate(e=>e.classList.contains('is-prompted')),true);
  await paperGesture(page,'circle');await page.clock.runFor(80);assert.equal(await page.locator('#qte-call').isVisible(),true);await paperGesture(page,'rub');await page.clock.runFor(80);assert.equal(await page.locator('#qte-call').isVisible(),false);
  await page.clock.runFor(6000);assert.match(await page.locator('#qte-call').textContent(),/圓圈/);await paperGesture(page,'circle');await page.clock.runFor(5600);assert.match(await page.locator('#qte-call').textContent(),/夾擊/);await paperGesture(page,'pinch');await page.clock.runFor(80);assert.equal(await page.locator('#qte-call').isVisible(),false);
  await context.close();console.log('PASS gesture-specific rhythm prompts, matching hint highlight and native-move completion');
 }
 for(const [width,height]of [[320,568],[375,812],[430,932],[812,375],[768,1024],[1440,1050]]){
  const {context,page,click}=await setup('zh-Hant',width,height,'no-preference');assert.equal(await page.locator('#gesture-tools').isVisible(),true);await page.clock.runFor(220);
  const layout=await page.evaluate(()=>{const zone=document.querySelector('#hit-zone'),r=zone.getBoundingClientRect(),tools=document.querySelector('.gesture-tools').getBoundingClientRect(),point=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {inside:zone.contains(point),hitHeight:r.height,fit:tools.top>=0&&tools.bottom<=innerHeight,overlap:tools.top<r.bottom-1,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('[data-gesture]')].map(e=>e.getBoundingClientRect().height)};});
  assert.equal(layout.inside,true,JSON.stringify(layout));assert.ok(layout.hitHeight>=80);assert.equal(layout.fit,true,JSON.stringify(layout));assert.equal(layout.overlap,false,JSON.stringify(layout));assert.equal(layout.overflow,false);assert.ok(layout.buttons.every(height=>height>=44));
  await page.screenshot({path:`/tmp/bbl-gestures/layout-${width}-${height}.png`});await context.close();console.log(`PASS ${width}×${height}: clear paper target, readable hints and no overlap/overflow`);
 }
 assert.deepEqual(errors,[]);console.log('9 gesture browser checks passed; no uncaught errors.');
}finally{await browser.close();}
