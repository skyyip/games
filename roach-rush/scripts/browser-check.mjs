import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const output='/tmp/roach-rush-qa',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function boundedGuide(page){
 const sizes=await page.locator('.guide-art svg').evaluateAll(els=>els.map(el=>{
  const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();
  return {width:r.width,height:r.height,parentWidth:p.width,parentHeight:p.height,position:getComputedStyle(el).position};
 }));
 assert.equal(sizes.length,5);
 assert.ok(sizes.every(r=>r.width>0&&r.width<=r.parentWidth+.1&&r.height<=r.parentHeight+.1&&r.width<=44&&r.height<=55&&r.position==='static'),JSON.stringify(sizes));
}
async function cornerHoles(page){
 const holes=await page.locator('.hole').evaluateAll(els=>els.map(el=>{
  const r=el.getBoundingClientRect(),f=el.parentElement.getBoundingClientRect();
  return {text:el.textContent.trim(),x:Math.min(r.left-f.left,f.right-r.right),y:Math.min(r.top-f.top,f.bottom-r.bottom)};
 }));
 assert.equal(holes.length,4);assert.ok(holes.every(h=>h.text===''&&h.x>=1&&h.x<=3&&h.y>=1&&h.y<=3),JSON.stringify(holes));
}
async function setup(options={},language='en',random=.2){
 const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce',...options});
 await context.addInitScript(({language,random})=>{try{localStorage.setItem('playground.language.v1',language);}catch{}window.__qaRandom=random;Math.random=()=>window.__qaRandom;},{language,random});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);return {context,page};
}
async function freeze(page){await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));}
const selector=(type='roach',mode='ground',size='small')=>`.critter[data-type="${type}"][data-mode="${mode}"][data-size="${size}"]:not(:disabled)`;
const centre=async locator=>{const r=await locator.boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};};
async function stable(page,locator){const id=await locator.getAttribute('data-id'),target=page.locator(`.critter[data-id="${id}"]`);await target.focus();return target;}
async function start(page,duration=120){
 await page.locator(`input[value="${duration}"]`).check();await page.locator('#start').click();
 const distances=await page.locator('.critter').evaluateAll(els=>els.map((el,index)=>{
  const a=el.getBoundingClientRect(),b=document.querySelectorAll('.hole')[index].getBoundingClientRect();
  return Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2);
 }));
 assert.ok(distances.every(distance=>distance<1),'new creatures must emerge from the visible edge holes');
}
async function dragMouse(page,hold=500,drop=true){
 const mouse=await stable(page,page.locator('.critter[data-type="mouse"]').first()),id=await mouse.getAttribute('data-id'),at=await centre(mouse);
 await page.mouse.move(at.x,at.y);await page.mouse.down();await page.clock.runFor(hold);
 const target=drop?await centre(page.locator('#cage')):{x:at.x+35,y:at.y+10};
 await page.mouse.move(target.x,target.y,{steps:3});await page.mouse.up();return id;
}
try{
 await mkdir(output,{recursive:true});
 for(const language of ['zh-Hant','en']){
  const {context,page}=await setup({},language);await freeze(page);
  await boundedGuide(page);
  await cornerHoles(page);
  assert.equal(await page.locator('.wall').count(),4);assert.equal(await page.locator('.hole').count(),4);assert.equal(await page.locator('#timer').textContent(),'2:00');
  await start(page);assert.equal(await page.locator('.critter').count(),4);assert.equal(await page.locator('.critter[data-mode="flying"]').count(),0);
  const small=page.locator(selector()).first();await small.click();assert.equal(await page.locator('#score').textContent(),'1');
  await page.evaluate(()=>{window.__qaRandom=.8;});await page.clock.runFor(850);
  const big=await stable(page,page.locator(selector('roach','ground','big')).first());await big.click();assert.equal(await page.locator('#score').textContent(),'1');
  assert.equal(await big.evaluate(el=>el.classList.contains('is-primed')),true);
  await page.clock.runFor(351);await big.click();assert.equal(await page.locator('#score').textContent(),'1');
  await page.clock.runFor(100);await big.click();assert.equal(await page.locator('#score').textContent(),'3');
  await page.evaluate(()=>{window.__qaRandom=.2;});await page.clock.runFor(7000);
  const flyer=await stable(page,page.locator('.critter[data-mode="flying"]').first()),at=await centre(flyer),id=await flyer.getAttribute('data-id');
  await flyer.click();assert.equal(await page.locator('#score').textContent(),'3');
  await page.mouse.move(at.x-40,at.y);await page.mouse.down();await page.mouse.move(at.x+40,at.y);await page.mouse.up();
  assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);assert.ok(Number(await page.locator('#score').textContent())>=6);
  const before=Number(await page.locator('#score').textContent());
  const mouseId=await dragMouse(page,499,true);assert.equal(await page.locator(`.critter[data-id="${mouseId}"]`).count(),1);assert.equal(Number(await page.locator('#score').textContent()),before);
  await dragMouse(page,500,false);assert.equal(Number(await page.locator('#score').textContent()),before);
  await dragMouse(page,500,true);assert.equal(Number(await page.locator('#score').textContent()),before+6);
  await page.clock.runFor(10000);
  const active=page.locator('.critter[data-type="mouse"]').first();await active.focus();await page.keyboard.down('Space');await page.clock.runFor(500);await page.keyboard.up('Space');
  assert.equal(await page.locator('#cage').isDisabled(),false);const score=Number(await page.locator('#score').textContent());await page.keyboard.press('Enter');assert.equal(Number(await page.locator('#score').textContent()),score+6);
  await page.clock.fastForward(121000);assert.equal(await page.locator('#result').isVisible(),true);assert.equal(await page.locator('#timer').textContent(),'0:00');assert.equal(await page.locator('.critter:not(:disabled)').count(),0);
  assert.equal(Number(await page.locator('#final-score').textContent()),Number(await page.locator('#score').textContent()));
  await page.screenshot({path:`${output}/results-${language}.png`,fullPage:true});
  await page.locator('#again').click();assert.equal(await page.locator('#score').textContent(),'0');assert.equal(await page.locator('.critter').count(),4);assert.equal(await page.locator('#timer').textContent(),'2:00');
  await page.locator('#end').click();assert.equal(await page.locator('#idle-note').isVisible(),true);
  await boundedGuide(page);
  await page.locator('input[value="180"]').check();assert.equal(await page.locator('#timer').textContent(),'3:00');
  await start(page,180);await page.clock.fastForward(121000);assert.equal(await page.locator('#result').isHidden(),true);await page.clock.fastForward(60000);assert.equal(await page.locator('#result').isVisible(),true);
  await context.close();pass(`${language}: four walls/four holes, tap/double-tap expiry, flying swipe, 499/500ms mouse capture, failed drop, keyboard cage, deadlines and replay`);
 }
 const largeFly=await setup({},'zh-Hant',.8),lp=largeFly.page;await freeze(lp);await start(lp);
 await lp.evaluate(()=>{window.__qaRandom=.2;});await lp.clock.runFor(6000);
 const bigFly=await stable(lp,lp.locator('.critter[data-mode="flying"][data-size="big"]').first()),bigFlyId=await bigFly.getAttribute('data-id');
 assert.match(await bigFly.getAttribute('aria-label'),/4 分/);
 const hinges=await bigFly.evaluate(el=>{
  const svg=el.querySelector('svg'),result=[];
  for(const phase of [-1,0,1]){
   el.style.setProperty('--flap',phase);
   for(const [side,x] of [['left',24],['right',40]]){
    const wing=el.querySelector(`.wing-${side}`),point=new DOMPoint(x,33),a=point.matrixTransform(wing.getScreenCTM()),b=point.matrixTransform(svg.getScreenCTM());
    result.push(Math.hypot(a.x-b.x,a.y-b.y));
   }
  }
  return result;
 });
 assert.ok(hinges.every(distance=>distance<.1),'wing roots must stay attached throughout the flap');
 const otherFlyers=await lp.locator(`.critter[data-mode="flying"]:not([data-id="${bigFlyId}"])`).evaluateAll(els=>els.map(el=>el.dataset.id));
 for(const id of otherFlyers)await lp.locator(`.critter[data-id="${id}"]`).press('Enter');
 const largeScore=Number(await lp.locator('#score').textContent()),at=await centre(bigFly);
 await lp.mouse.move(at.x,at.y);await lp.mouse.down();await lp.mouse.move(at.x+70,at.y);await lp.mouse.up();
 assert.equal(Number(await lp.locator('#score').textContent()),largeScore+4);assert.equal(await lp.locator(`.critter[data-id="${bigFlyId}"]`).count(),0);
 await largeFly.context.close();pass('large flying roaches award four points on a swipe; both wing hinges remain attached across their flap poses');

 const late=await setup();await freeze(late.page);await start(late.page);await late.page.clock.fastForward(119000);
 const heldMouse=await stable(late.page,late.page.locator('.critter[data-type="mouse"]').first()),heldAt=await centre(heldMouse);
 await late.page.mouse.move(heldAt.x,heldAt.y);await late.page.mouse.down();await late.page.clock.fastForward(1100);
 const dropAt=await centre(late.page.locator('#cage'));await late.page.mouse.move(dropAt.x,dropAt.y);await late.page.mouse.up();
 assert.equal(await late.page.locator('#final-score').textContent(),'0');assert.equal(await late.page.locator('.critter.is-held').count(),0);
 await late.context.close();pass('the deadline cancels a held mouse; dropping after time is up adds no points');

 for(const [width,height] of [[320,568],[375,812],[812,375],[768,1024],[1440,1100]]){
  const {context,page}=await setup({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000},'zh-Hant');await freeze(page);await boundedGuide(page);
  await cornerHoles(page);
  if(width===375||width===1440)await page.screenshot({path:`${output}/idle-${width}.png`,fullPage:true});
  await start(page);await page.clock.runFor(8500);
  await cornerHoles(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const layout=await page.evaluate(()=>{const p=document.querySelector('.play-panel').getBoundingClientRect(),r=document.querySelector('#room').getBoundingClientRect(),c=document.querySelector('#cage').getBoundingClientRect();return {full:!document.body.classList.contains('play-locked')||Math.abs(p.height-innerHeight)<1&&p.top===0,room:r.height>150,cage:c.top>=r.top-4&&c.bottom<=r.bottom};});
  assert.ok(Object.values(layout).every(Boolean),JSON.stringify(layout));
  await page.screenshot({path:`${output}/playing-${width}x${height}.png`,fullPage:width===1440});
  const protocol=await context.newCDPSession(page);
  if(width===375){
   const target=await stable(page,page.locator('.critter[data-mode="ground"][data-type="roach"]').first()),id=await target.getAttribute('data-id'),p=await centre(target);
   await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...p}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.locator(`.critter[data-id="${id}"]`).count(),0);
   const mouse=await stable(page,page.locator('.critter[data-type="mouse"]').first()),m=await centre(mouse),c=await centre(page.locator('#cage')),before=Number(await page.locator('#score').textContent());
   await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...m}]});await page.clock.runFor(500);
   await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,...c}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(Number(await page.locator('#score').textContent()),before+6);
   const flying=await stable(page,page.locator('.critter[data-mode="flying"]').first()),flyId=await flying.getAttribute('data-id'),f=await centre(flying),swipeScore=Number(await page.locator('#score').textContent());
   await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:f.x-35,y:f.y}]});
   await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:f.x+35,y:f.y}]});
   await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.locator(`.critter[data-id="${flyId}"]`).count(),0);assert.ok(Number(await page.locator('#score').textContent())>=swipeScore+3);
  }
  await protocol.detach();
  for(let round=0;round<2;round++){await page.clock.fastForward(121000);await page.locator('#again').click();assert.equal(await page.locator('#result').isHidden(),true);assert.equal(await page.locator('.critter').count(),4);}
  await page.locator('#end').click();assert.equal(await page.locator('#mode-options').isDisabled(),false);
  await context.close();pass(`${width}x${height}: responsive room, visible cage, repeated timeout/replay and screen-lock cleanup${width===375?', real touch tap and mouse drag':''}`);
 }
 const offline=await setup({serviceWorkers:'allow'});await offline.page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
 await offline.context.setOffline(true);await offline.page.reload();await freeze(offline.page);await start(offline.page);await offline.page.locator(selector()).first().press('Enter');
 assert.equal(await offline.page.locator('#score').textContent(),'1');await offline.page.clock.fastForward(121000);assert.equal(await offline.page.locator('#final-score').textContent(),'1');await offline.context.close();pass('offline round supports sprites, controls, score and results');
 assert.deepEqual(errors,[]);pass('no uncaught browser errors');console.log(`\n${checks} Roach Rush browser checks passed.`);
}finally{await browser.close();}
