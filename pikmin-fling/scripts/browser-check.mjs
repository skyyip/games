// Optional QA with an existing Playwright installation; no package installation.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const output=process.env.PIKMIN_FLING_SCREENSHOTS||'/tmp/pikmin-fling-qa';
const key='pikmin-fling.records.v3',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},init=()=>{Math.random=()=>0;},initArg) {
  const context=await browser.newContext({serviceWorkers:'block',...options});
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  if(init)await context.addInitScript(init,initArg);
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#start:not(:disabled)').waitFor();return {context,page};
}
const pikmin=(page,growth)=>page.locator(`.pikmin[data-growth="${growth}"]:not(:disabled)`);
async function stable(page,button) {
  const id=await button.getAttribute('data-id'),target=page.locator(`.pikmin[data-id="${id}"]`);
  await target.focus();await target.scrollIntoViewIfNeeded();return target;
}
async function centre(button,id=1){const b=await button.boundingBox();return{id,x:b.x+b.width/2,y:b.y+b.height/2};}
async function swipe(page,button,hold=0,dy=-70,dx=0) {
  button=await stable(page,button);const p=await centre(button);
  await page.mouse.move(p.x,p.y);await page.mouse.down();
  if(hold)await page.waitForTimeout(hold);
  await page.mouse.move(p.x+dx,p.y+dy,{steps:4});await page.mouse.up();return button;
}
async function finishByKeyboard(page) {
  const remaining=page.locator('.pikmin:not(:disabled)');
  while(await remaining.count()){await remaining.first().focus();await page.keyboard.press('Enter');}
  await page.locator('#results').waitFor({state:'visible'});
}
async function stored(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);}
async function touch(protocol,type,points){await protocol.send('Input.dispatchTouchEvent',{type,touchPoints:points});}
try{
  await mkdir(output,{recursive:true});
  for(const [type,label,random] of [['red','Red',.01],['yellow','Yellow',.16],['blue','Blue',.3],['ice','Ice',.45],['rock','Rock',.6],['winged','Winged',.75],['white','White',.9]]) {
    const variant=await setup({viewport:{width:375,height:900},reducedMotion:'reduce'},value=>{Math.random=()=>value;},random);
    await variant.page.locator('#start').click();
    assert.equal(await variant.page.locator(`.pikmin[data-type="${type}"]`).count(),30);
    await variant.page.locator('#world').screenshot({path:`${output}/${type}-crowd-mobile.png`,animations:'disabled'});
    for(const growth of ['leaf','bud','flower']) {
      const unit=await stable(variant.page,pikmin(variant.page,growth).first());
      assert.match(await unit.getAttribute('aria-label'),new RegExp(`${label} .*Pikmin`));
      assert.equal(await unit.locator('.pikmin-art').getAttribute('data-sprite'),type);
      assert.equal(await unit.locator('.pikmin-art').getAttribute('data-stage'),growth);
      if(growth==='bud')await unit.dblclick();
      else await swipe(variant.page,unit,growth==='flower'?650:0);
      assert.equal(await unit.isDisabled(),true,`${type} ${growth} should launch after its valid gesture`);
      assert.equal(await variant.page.locator(`.flying-pikmin[data-sprite="${type}"][data-stage="${growth}"]`).count(),1);
      await variant.page.waitForTimeout(550);
    }
    assert.equal(await variant.page.locator('#fed').textContent(),'3');
    await finishByKeyboard(variant.page);
    assert.equal(await variant.page.locator('#fed').textContent(),'30');
    await variant.context.close();
    pass(`${label}: leaf/bud/flower artwork and labels load, correct gestures launch matching sprites, and the round completes`);
  }
  const {context,page}=await setup({viewport:{width:1440,height:1100}});
  assert.equal(await page.title(),'Pikmin Fling · Sky’s Playground');
  await page.waitForTimeout(80);assert.equal(await page.locator('#timer').textContent(),'0.00');
  assert.equal(await page.locator('.pikmin').count(),30);assert.equal(await page.locator('.pikmin:not(:disabled)').count(),0);
  for(const [growth,count] of [['leaf',20],['bud',5],['flower',5]])assert.equal(await page.locator(`.pikmin[data-growth="${growth}"]`).count(),count);
  assert.equal(await page.locator('.pikmin .pikmin-art').count(),30);
  await page.screenshot({path:`${output}/desktop-ready.png`,fullPage:true,animations:'disabled'});
  pass('idle board has 20 normal, 5 bud, 5 flower Pikmin, correct artwork and a stopped timer');
  await page.locator('#pen').scrollIntoViewIfNeeded();
  const fenceBounds=await page.locator('#pen').boundingBox();
  await page.mouse.click(fenceBounds.x+4,fenceBounds.y+40,{clickCount:3});
  assert.notEqual(await page.evaluate(()=>getSelection().type),'Range','the browser must not select the fenced region');
  const nativeSelection=await page.locator('#pen').evaluate(pen=>({
    styles:[pen,pen.querySelector('#units'),pen.querySelector('.fence'),pen.querySelector('.pikmin .pikmin-art')].map(el=>{
      const style=getComputedStyle(el);return {select:style.userSelect,tap:style.webkitTapHighlightColor};
    }),
    blocked:['selectstart','dragstart','contextmenu'].every(type=>!pen.querySelector('.fence').dispatchEvent(new Event(type,{bubbles:true,cancelable:true})))
  }));
  assert.ok(nativeSelection.styles.every(style=>style.select==='none'&&style.tap==='rgba(0, 0, 0, 0)'));
  assert.equal(nativeSelection.blocked,true);
  assert.equal(await page.locator('.keyboard-help').evaluate(el=>el.dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true}))),true);
  pass('the entire fence prevents native selection, ancestor tap highlighting, artwork dragging and long-press menus');
  const sway=await page.locator('.plant-sway').evaluate(async el=>{
    const animation=el.getAnimations()[0],mouth=document.querySelector('#mouth-target');
    animation.pause();animation.currentTime=0;await new Promise(requestAnimationFrame);
    const left=mouth.getBoundingClientRect();
    animation.currentTime=3000;await new Promise(requestAnimationFrame);
    const right=mouth.getBoundingClientRect();animation.play();
    return {dx:right.x-left.x,inside:el.contains(mouth)};
  });
  assert.ok(Math.abs(sway.dx)>10);assert.equal(sway.inside,true);
  pass('the cartoon plant sways slowly and its automatic-flight mouth target follows the sway');


  await page.locator('#start').click();assert.equal(await page.locator('#mode-options input').first().isDisabled(),true);
  const positions=await page.locator('.pikmin').evaluateAll(items=>items.map(b=>b.style.transform));
  await page.waitForTimeout(250);
  const moving=await page.locator('.pikmin').evaluateAll(items=>items.map(b=>b.style.transform));assert.notDeepEqual(moving,positions);
  assert.equal(await page.locator('.pikmin .rig-leg').count(),60);
  assert.equal(await page.locator('.pikmin .rig-arm').count(),60);
  pass('Pikmin wander through the larger garden with body bobbing and alternating footsteps');
  let leaf=await stable(page,pikmin(page,'leaf').first());
  await leaf.click();await leaf.dblclick();assert.equal(await leaf.isDisabled(),false);
  await swipe(page,leaf,0,30,60);assert.equal(await leaf.isDisabled(),false);
  await swipe(page,leaf);assert.equal(await leaf.isDisabled(),true);
  assert.equal(await page.locator('#plant').evaluate(el=>el.classList.contains('is-open')),true);
  await page.waitForTimeout(550);assert.equal(await page.locator('#fed').textContent(),'1');
  pass('normal Pikmin requires an upward fling, rejects taps and wrong directions, and counts once on arrival');
  const bud=await stable(page,pikmin(page,'bud').first());
  await swipe(page,bud);assert.equal(await bud.isDisabled(),false);
  await bud.click();assert.equal(await bud.isDisabled(),false);await page.waitForTimeout(400);
  await bud.click();assert.equal(await bud.isDisabled(),false);await bud.click();assert.equal(await bud.isDisabled(),true);
  pass('buds reject swipes and expired taps; two quick taps launch the same bud');
  const flower=await stable(page,pikmin(page,'flower').first());
  await swipe(page,flower);assert.equal(await flower.isDisabled(),false);
  await swipe(page,flower,350);assert.equal(await flower.isDisabled(),false);
  await swipe(page,flower,650);assert.equal(await flower.isDisabled(),true);
  pass('flowers reject immediate/350ms flings and launch after a stationary 0.6-second charge');
  const first=await stable(page,pikmin(page,'bud').first()),a=await centre(first);
  await page.mouse.move(a.x,a.y);await page.mouse.down();await page.waitForTimeout(240);
  assert.equal(await first.evaluate(b=>b.classList.contains('is-linked')),true);
  const firstId=await first.getAttribute('data-id');
  const secondId=await pikmin(page,'bud').evaluateAll((items,id)=>items.find(b=>b.dataset.id!==id).dataset.id,firstId);
  const target=page.locator(`.pikmin[data-id="${secondId}"]`),b=await centre(target);
  await page.mouse.move(b.x,b.y,{steps:5});
  assert.equal(await target.evaluate(el=>el.classList.contains('is-linked')),true);
  const wrong=await centre(pikmin(page,'flower').first());
  await page.mouse.move(wrong.x,wrong.y,{steps:5});
  assert.equal(await page.locator('.pikmin[data-growth="flower"].is-linked').count(),0);
  assert.ok(await page.locator('#chains polyline').count()>0);
  await page.screenshot({path:`${output}/desktop-chain.png`,fullPage:false});
  await page.mouse.move(wrong.x,wrong.y-70,{steps:4});await page.mouse.up();
  assert.equal(await first.isDisabled(),true);assert.equal(await target.isDisabled(),true);
  assert.equal(await page.locator('.is-linked').count(),0);
  pass('a short press traces same-stage buds, ignores flowers, draws a chain and launches the group with a final upward flick');
  const cancelUnit=await stable(page,pikmin(page,'leaf').first());
  await page.locator('#reset').focus();const cancelOrigin=await centre(cancelUnit);
  await page.mouse.move(cancelOrigin.x,cancelOrigin.y);await page.mouse.down();await page.waitForTimeout(240);
  assert.equal(await cancelUnit.evaluate(b=>b.classList.contains('is-linked')),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.is-held,.is-linked').count(),0);
  await page.mouse.move(cancelOrigin.x,cancelOrigin.y-70,{steps:4});await page.mouse.up();
  assert.equal(await cancelUnit.isDisabled(),false);assert.equal(await page.locator('#chains polyline').count(),0);
  pass('Escape cancels a pointer chain even when keyboard focus is outside the garden');
  await finishByKeyboard(page);const final=await page.locator('#timer').textContent();
  await page.waitForTimeout(150);assert.equal(await page.locator('#timer').textContent(),final);
  assert.equal(await page.locator('#fed').textContent(),'30');assert.equal(await page.locator('.flying-pikmin').count(),0);
  assert.equal(await page.locator('.record.is-new').count(),1);assert.equal((await stored(page)).normal.length,1);
  await page.locator('#again').click();assert.equal(await page.locator('.pikmin:not(:disabled)').count(),30);
  assert.equal(await page.locator('#fed').textContent(),'0');
  await swipe(page,pikmin(page,'leaf').first());await page.locator('#reset').click();await page.waitForTimeout(600);
  assert.equal(await page.locator('#timer').textContent(),'0.00');assert.equal(await page.locator('#fed').textContent(),'0');
  assert.equal(await page.locator('.flying-pikmin').count(),0);assert.equal((await stored(page)).normal.length,1);
  pass('completion freezes the timer, saves a highlighted record, replay restores 30, and reset cancels stale arrivals');
  await page.locator('input[value="challenge"]').check();await page.locator('#start').click();await finishByKeyboard(page);
  assert.equal((await stored(page)).challenge.length,1);
  await page.reload();await page.locator('#start:not(:disabled)').waitFor();assert.equal(await page.locator('.record').count(),1);
  await page.locator('input[value="challenge"]').check();assert.equal(await page.locator('.record').count(),1);
  pass('normal and challenge records stay separate and survive a page reload');
  for(let i=0;i<3;i++){await page.locator('#start').click();await finishByKeyboard(page);await page.locator('#change-mode').click();}
  const top=(await stored(page)).challenge;assert.equal(top.length,3);assert.ok(top[0].time<=top[1].time&&top[1].time<=top[2].time);
  pass('repeated completed rounds retain only the fastest three records');await context.close();

  const challenge=await setup({viewport:{width:1440,height:1100}},()=>{Math.random=()=>0;});
  const c=challenge.page;await c.clock.install();await c.locator('input[value="challenge"]').check();await c.locator('#start').click();
  const held=await stable(c,pikmin(c,'bud').first()),origin=await centre(held);
  await c.mouse.move(origin.x,origin.y);await c.mouse.down();await c.clock.fastForward(3100);
  assert.match(await c.locator('#cycle-status').textContent(),/Growth wave 1/);assert.equal(await held.getAttribute('data-growth'),'bud');
  assert.equal(await c.locator('.pikmin[data-growth="leaf"]').count(),20);
  assert.equal(await c.locator('.pikmin[data-growth="bud"]').count(),5);
  await c.mouse.up();assert.equal(await held.isDisabled(),false);assert.equal(await c.locator('.is-linked').count(),0);
  await c.clock.fastForward(3100);assert.match(await c.locator('#cycle-status').textContent(),/Growth wave 2/);
  await c.locator('#reset').click();await c.clock.fastForward(10000);assert.equal(await c.locator('#timer').textContent(),'0.00');
  assert.equal(await c.locator('.pikmin[data-growth="bud"]').count(),5);
  pass('challenge cycles continue at 3s with simultaneous transitions, protect held Pikmin, cancel unfinished chains and stop on reset');
  await challenge.context.close();

  const mobile=await setup({viewport:{width:375,height:900},isMobile:true,hasTouch:true});
  const p=mobile.page,protocol=await mobile.context.newCDPSession(p);await p.locator('#start').tap();
  const touchLeaf=await stable(p,pikmin(p,'leaf').first()),touchOrigin=await centre(touchLeaf);
  await touch(protocol,'touchStart',[touchOrigin]);await touch(protocol,'touchMove',[{...touchOrigin,y:touchOrigin.y-60}]);await touch(protocol,'touchCancel',[]);
  assert.equal(await p.locator('.flying-pikmin').count(),0);assert.equal(await p.locator('.is-held').count(),0);
  assert.equal(await touchLeaf.locator('.pikmin-art').evaluate(el=>el.style.transform),'');
  pass('touch cancellation releases capture, restores the sprite and never throws');
  const tapBud=await stable(p,pikmin(p,'bud').first());await tapBud.tap();await tapBud.tap();assert.equal(await tapBud.isDisabled(),true);
  const touchFlower=await stable(p,pikmin(p,'flower').first()),f=await centre(touchFlower);
  await touch(protocol,'touchStart',[f]);await p.waitForTimeout(1080);await touch(protocol,'touchMove',[{...f,y:f.y-65}]);await touch(protocol,'touchEnd',[]);
  assert.equal(await touchFlower.isDisabled(),true);
  const l1=await stable(p,pikmin(p,'leaf').first()),l2id=await pikmin(p,'leaf').nth(1).getAttribute('data-id');
  const l2=p.locator(`.pikmin[data-id="${l2id}"]`),t1=await centre(l1,1),t2=await centre(l2,2),scroll=await p.evaluate(()=>scrollY);
  await touch(protocol,'touchStart',[t1,t2]);await touch(protocol,'touchMove',[{...t1,y:t1.y-70},{...t2,y:t2.y-70}]);await touch(protocol,'touchEnd',[]);
  assert.equal(await l1.isDisabled(),true);assert.equal(await l2.isDisabled(),true);assert.equal(await p.evaluate(()=>scrollY),scroll);
  pass('real touch input supports double-tap buds, press-and-fling flowers and simultaneous normal flings without scrolling');
  const tap=await stable(p,pikmin(p,'flower').first());await tap.tap();await p.locator('#feed-selected').tap();assert.equal(await tap.isDisabled(),true);
  pass('tap plus Feed selected provides a drag-free alternative for every growth state');
  for(const growth of ['leaf','bud','flower']) {
    await p.waitForTimeout(550);
    const fedBefore=Number(await p.locator('#fed').textContent()),scrollBefore=await p.evaluate(()=>scrollY);
    const chainStart=await stable(p,pikmin(p,growth).first()),ca=await centre(chainStart);
    const chainStartId=await chainStart.getAttribute('data-id');
    const chainTargetId=await pikmin(p,growth).evaluateAll((items,id)=>items.find(b=>b.dataset.id!==id).dataset.id,chainStartId);
    const chainTarget=p.locator(`.pikmin[data-id="${chainTargetId}"]`);
    await touch(protocol,'touchStart',[ca]);await p.waitForTimeout(240);
    const cb=await centre(chainTarget);
    await touch(protocol,'touchMove',[{...ca,x:cb.x,y:cb.y}]);
    assert.equal(await chainTarget.evaluate(b=>b.classList.contains('is-linked')),true);
    assert.equal(await p.locator(`.pikmin.is-linked:not([data-growth="${growth}"])`).count(),0);
    assert.ok(await p.locator('#chains polyline').count()>0);
    if(growth==='flower')await p.screenshot({path:`${output}/short-flower-chain-touch.png`});
    await p.waitForTimeout(250); // A new flick must work after pausing the drag, too.
    await touch(protocol,'touchMove',[{...ca,x:cb.x,y:cb.y-70}]);await touch(protocol,'touchEnd',[]);
    assert.equal(await chainStart.isDisabled(),true);assert.equal(await chainTarget.isDisabled(),true);
    const count=await p.locator('.flying-pikmin').count();assert.ok(count>=2);
    assert.equal(await p.locator('.flying-pikmin').evaluateAll((images,growth)=>images.every(image=>image.getAttribute('data-stage')===growth),growth),true);
    await p.waitForTimeout(550);assert.equal(Number(await p.locator('#fed').textContent()),fedBefore+count);
    assert.equal(await p.evaluate(()=>scrollY),scrollBefore);
    pass(`${growth}: a finger can short-press 240ms, drag-link, pause and flick the full matching chain into the mouth without scrolling`);
  }
  await p.locator('#pen').scrollIntoViewIfNeeded();
  await p.waitForTimeout(100);
  const blank=await p.locator('#pen').boundingBox(),scrollBefore=await p.evaluate(()=>scrollY);
  const blankTouch={id:1,x:blank.x+3,y:blank.y+180};
  await touch(protocol,'touchStart',[blankTouch]);
  for(let step=1;step<=5;step++){
    await touch(protocol,'touchMove',[{...blankTouch,y:blankTouch.y-step*20}]);await p.waitForTimeout(50);
  }
  await touch(protocol,'touchEnd',[]);await p.waitForTimeout(100);
  const scrollAfter=await p.evaluate(()=>scrollY);
  assert.equal(scrollAfter,scrollBefore,JSON.stringify({scrollBefore,scrollAfter,blank}));
  assert.notEqual(await p.evaluate(()=>getSelection().type),'Range');
  pass('the fixed mobile play view blocks scrolling when a finger starts in the blank fence');

  for(const width of [320,375,430,600,768,1024,1440]) {
    await p.setViewportSize({width,height:1000});await p.waitForTimeout(80);
    const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      targets:[...document.querySelectorAll('.pikmin:not(:disabled)')].map(b=>{const r=b.getBoundingClientRect(),pen=document.querySelector('#pen').getBoundingClientRect();return{w:r.width,h:r.height,inside:r.x>=pen.x&&r.right<=pen.right&&r.y>=pen.y&&r.bottom<=pen.bottom}})}));
    assert.equal(layout.overflow,false);assert.ok(layout.targets.every(b=>b.w>=43.99&&b.h>=43.99&&b.inside),`targets at ${width}`);
    if([320,375,1440].includes(width))await p.screenshot({path:`${output}/playing-${width}.png`,fullPage:true,animations:'disabled'});
    pass(`${width}px: no overflow, 44px touch targets and all roaming Pikmin stay within the fence`);
  }
  await finishByKeyboard(p);await p.screenshot({path:`${output}/completed.png`,fullPage:true,animations:'disabled'});
  await protocol.detach();await mobile.context.close();

  const reduced=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}},()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}});});
  await reduced.page.locator('#start').focus();await reduced.page.keyboard.press('Enter');
  assert.equal(await reduced.page.locator('.pikmin:focus').count(),1);
  assert.equal(await reduced.page.locator('.plant-sway').evaluate(el=>el.getAnimations().length),0);
  assert.equal(await reduced.page.locator('.pikmin').first().evaluate(el=>el.style.getPropertyValue('--stride')),'0deg');
  const before=await reduced.page.locator('.pikmin').evaluateAll(items=>items.map(b=>b.style.transform));
  await reduced.page.waitForTimeout(200);assert.deepEqual(await reduced.page.locator('.pikmin').evaluateAll(items=>items.map(b=>b.style.transform)),before);
  await reduced.page.keyboard.press('ArrowUp');await reduced.page.waitForTimeout(80);
  const flight=await reduced.page.locator('.flying-pikmin').evaluate(el=>({transform:el.style.transform,opacity:Number(el.style.opacity)}));
  await reduced.page.waitForTimeout(90);const later=await reduced.page.locator('.flying-pikmin').evaluate(el=>({transform:el.style.transform,opacity:Number(el.style.opacity)}));
  assert.equal(later.transform,flight.transform);assert.ok(later.opacity<flight.opacity);
  await finishByKeyboard(reduced.page);assert.match(await reduced.page.locator('#storage-status').textContent(),/unavailable|無法/);
  assert.equal(await reduced.page.locator('.record').count(),1);await reduced.context.close();
  pass('reduced motion disables roaming/bobbing, fades flights, supports keyboard completion and works with blocked storage');
  const corrupt=await setup({},()=>{if(location.protocol.startsWith('http')){localStorage.setItem('pikmin-fling.records.v2','not JSON');localStorage.setItem('pikmin-fling.records.v1','old records');}});
  await corrupt.page.locator('#start').click();await finishByKeyboard(corrupt.page);
  assert.equal((await stored(corrupt.page)).normal.length,1);assert.equal(await corrupt.page.evaluate(()=>localStorage.getItem('pikmin-fling.records.v1')),'old records');
  await corrupt.context.close();pass('corrupted new records recover without deleting old count-based records');
  const offline=await setup({serviceWorkers:'allow'});
  await offline.page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  await offline.context.setOffline(true);await offline.page.reload();await offline.page.locator('#start:not(:disabled)').waitFor();
  const cachedArtwork=await offline.page.evaluate(async()=>{
    const {createSprite}=await import('./src/sprites.js');
    return ['red','yellow','blue','ice','rock','winged','white'].flatMap(type=>['leaf','bud','flower'].map(growth=>createSprite(type,growth).querySelectorAll('.rig-leg').length===2));
  });
  assert.equal(cachedArtwork.length,21);assert.ok(cachedArtwork.every(Boolean));
  await offline.page.locator('input[value="challenge"]').check();await offline.page.locator('#start').click();await finishByKeyboard(offline.page);
  const fresh=await offline.context.newPage();await fresh.goto(base);await fresh.locator('#start:not(:disabled)').waitFor();
  assert.equal(await fresh.locator('.pikmin .pikmin-art').count(),30);
  pass('both modes and all growth artwork work offline after installation, including a fresh offline tab');
  await offline.context.setOffline(false);await offline.page.locator('.playground-home').click();await offline.page.waitForURL(new URL('../',base).href);
  assert.equal(await offline.page.locator('.card').count(),5);await offline.context.close();
  assert.deepEqual(errors,[]);pass('All games navigation works and no uncaught browser errors occur');
  console.log(`\n${checks} Pikmin Fling browser checks passed. Screenshots: ${output}`);
}finally{await browser.close();}
