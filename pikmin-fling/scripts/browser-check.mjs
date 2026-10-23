// Optional QA with an existing Playwright installation; no package installation.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const output=process.env.PIKMIN_FLING_SCREENSHOTS||'/tmp/pikmin-fling-qa';
const key='pikmin-fling.records.v1',errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},init) {
  const context=await browser.newContext({serviceWorkers:'block',...options});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  if(init)await context.addInitScript(init);
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#start:not(:disabled)').waitFor();
  return {context,page};
}
async function swipe(page,button,dx=0,dy=-70) {
  await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:4});await page.mouse.up();
}
async function finishByKeyboard(page) {
  const remaining=page.locator('.pikmin:not(:disabled)');
  while(await remaining.count()){await remaining.first().focus();await page.keyboard.press('Enter');}
  await page.locator('#results').waitFor({state:'visible'});
}
async function stored(page) {return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);}
async function touch(protocol,type,points) {await protocol.send('Input.dispatchTouchEvent',{type,touchPoints:points});}
async function centre(button,id=1){const b=await button.boundingBox();return{id,x:b.x+b.width/2,y:b.y+b.height/2};}
try{
  await mkdir(output,{recursive:true});
  const {context,page}=await setup({viewport:{width:1440,height:1050}});
  assert.equal(await page.title(),'Pikmin Fling · Sky’s Playground');
  await page.waitForTimeout(80);assert.equal(await page.locator('#timer').textContent(),'0.00');
  assert.equal(await page.locator('.pikmin').count(),20);
  assert.equal(await page.locator('.pikmin:not(:disabled)').count(),0);
  assert.equal(await page.locator('.pikmin img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
  await page.screenshot({path:`${output}/desktop-ready.png`,fullPage:true,animations:'disabled'});
  pass('idle timer stays stopped, all Pikmin artwork loads and the board is inactive before Start');
  for(const count of [20,30,40]) {
    await page.locator(`input[value="${count}"]`).check();
    assert.equal(await page.locator('.pikmin').count(),count);
    await page.locator('#start').click();assert.equal(await page.locator('#count-options input').first().isDisabled(),true);
    await page.waitForTimeout(60);assert.ok(Number(await page.locator('#timer').textContent())>0);
    const first=page.locator('.pikmin').first();
    await first.click();await first.dblclick();assert.equal(await page.locator('#fed').textContent(),'0');
    await swipe(page,first,65,15);await page.waitForTimeout(30);assert.equal(await page.locator('.flying-pikmin').count(),0);
    assert.equal(await page.locator('#fed').textContent(),'0');
    await swipe(page,first);
    assert.equal(await first.isDisabled(),true);assert.equal(await page.locator('#plant').evaluate(el=>el.classList.contains('is-open')),true);
    if(count===20)await page.screenshot({path:`${output}/desktop-flight.png`,fullPage:true});
    await finishByKeyboard(page);
    assert.equal(await page.locator('#fed').textContent(),String(count));
    assert.equal(await page.locator('.flying-pikmin').count(),0);
    assert.equal(await page.locator('#plant').evaluate(el=>el.classList.contains('is-open')),false);
    const final=await page.locator('#timer').textContent();
    await page.waitForTimeout(200);assert.equal(await page.locator('#timer').textContent(),final);
    assert.equal(await page.locator('#result-badge').textContent(),'NEW PERSONAL BEST!');
    assert.equal(await page.locator('.record.is-new').count(),1);
    const records=await stored(page);assert.equal(records[count].length,1);assert.ok(records[count][0].time>=480);
    assert.equal((records[count][0].time/1000).toFixed(2),final);
    pass(`${count} Pikmin: correct count, upward mouse fling, rejected taps/downward swipe, final-arrival timer and new persistent record`);
    await page.locator('#change-count').click();assert.equal(await page.locator('#timer').textContent(),'0.00');
    assert.equal(await page.locator('#fed').textContent(),'0');
  }
  await page.reload();await page.locator('#start:not(:disabled)').waitFor();
  for(const count of [20,30,40]) {await page.locator(`input[value="${count}"]`).check();assert.equal(await page.locator('.record').count(),1);}
  pass('20/30/40 records remain independent and survive a real page reload');
  await page.locator('input[value="20"]').check();
  for(let round=0;round<3;round++){await page.locator('#start').click();await finishByKeyboard(page);await page.locator('#change-count').click();}
  const top=await stored(page);assert.equal(top[20].length,3);
  assert.ok(top[20][0].time<=top[20][1].time&&top[20][1].time<=top[20][2].time);
  pass('repeated real games keep no more than three records, ordered fastest first');
  await page.locator('#start').click();await swipe(page,page.locator('.pikmin').first());
  await page.locator('#reset').click();await page.waitForTimeout(650);
  assert.equal(await page.locator('#timer').textContent(),'0.00');assert.equal(await page.locator('#fed').textContent(),'0');
  assert.equal(await page.locator('.flying-pikmin').count(),0);assert.equal(await page.locator('#results').isHidden(),true);
  assert.deepEqual(await stored(page),top);
  pass('reset during flight cancels old arrivals, stops the timer and never saves an unfinished round');
  await context.close();

  const mobile=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  const p=mobile.page,protocol=await mobile.context.newCDPSession(p);
  await p.locator('input[value="40"]').check();await p.locator('#start').tap();
  const first=p.locator('.pikmin').first();await first.scrollIntoViewIfNeeded();
  const origin=await centre(first);
  await touch(protocol,'touchStart',[origin]);await touch(protocol,'touchMove',[{...origin,y:origin.y-60}]);
  await touch(protocol,'touchCancel',[]);
  assert.equal(await p.locator('.flying-pikmin').count(),0);assert.equal(await p.locator('#fed').textContent(),'0');
  assert.equal(await first.locator('img').evaluate(el=>el.style.transform),'');
  pass('cancelled touch restores the character, with no phantom throw or progress');
  const second=p.locator('.pikmin').nth(1),a=await centre(first,1),b=await centre(second,2);
  const scroll=await p.evaluate(()=>scrollY);
  await touch(protocol,'touchStart',[a,b]);
  await touch(protocol,'touchMove',[{...a,y:a.y-70},{...b,y:b.y-70}]);
  assert.equal(await p.locator('.flying-pikmin').count(),0);
  await touch(protocol,'touchEnd',[]);
  assert.equal(await p.locator('.flying-pikmin').count(),2);
  assert.equal(await p.evaluate(()=>scrollY),scroll);
  await p.waitForTimeout(550);assert.equal(await p.locator('#fed').textContent(),'2');
  pass('two simultaneous touch swipes throw once each, count on arrival and do not scroll the board');
  const tap=p.locator('.pikmin:not(:disabled)').first();await tap.tap();
  assert.equal(await p.locator('#feed-selected').isDisabled(),false);await p.locator('#feed-selected').tap();
  await p.waitForTimeout(550);assert.equal(await p.locator('#fed').textContent(),'3');
  pass('tap plus Feed selected provides a complete alternative to dragging');
  for(const width of [320,375,430,600,768,1024,1440]) {
    await p.setViewportSize({width,height:900});await p.waitForTimeout(60);
    const layout=await p.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,buttons:[...document.querySelectorAll('.pikmin:not(:disabled)')].map(el=>{const r=el.getBoundingClientRect();return{width:r.width,height:r.height}}),back:document.querySelector('.playground-home').getBoundingClientRect().height}));
    assert.ok(layout.width<=layout.viewport,`page overflow at ${width}`);
    assert.ok(layout.buttons.every(b=>b.width>=44&&b.height>=44),`small touch target at ${width}`);assert.ok(layout.back>=44);
    assert.equal(await p.locator('.pikmin').count(),40);
    if([320,375,1440].includes(width))await p.screenshot({path:`${output}/playing-${width}.png`,fullPage:true,animations:'disabled'});
    pass(`${width}px: no horizontal overflow, 44px character targets and stable 40-Pikmin board`);
  }
  await finishByKeyboard(p);await p.screenshot({path:`${output}/completed.png`,fullPage:true,animations:'disabled'});
  await p.locator('#again').click();assert.equal(await p.locator('#fed').textContent(),'0');
  assert.equal(await p.locator('#results').isHidden(),true);assert.equal(await p.locator('.pikmin:not(:disabled)').count(),40);
  pass('Play again starts a fresh full round and clears the completion screen');
  await protocol.detach();await mobile.context.close();

  const reduced=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}},()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}});});
  await reduced.page.locator('#start').focus();await reduced.page.keyboard.press('Enter');
  assert.equal(await reduced.page.locator('.pikmin:focus').count(),1);
  await reduced.page.keyboard.press('ArrowUp');await reduced.page.waitForTimeout(100);
  const before=await reduced.page.locator('.flying-pikmin').evaluate(el=>({transform:el.style.transform,opacity:Number(el.style.opacity)}));
  await reduced.page.waitForTimeout(90);
  const after=await reduced.page.locator('.flying-pikmin').evaluate(el=>({transform:el.style.transform,opacity:Number(el.style.opacity)}));
  assert.equal(after.transform,before.transform);assert.ok(after.opacity<before.opacity);
  await finishByKeyboard(reduced.page);assert.match(await reduced.page.locator('#storage-status').textContent(),/unavailable/);
  assert.equal(await reduced.page.locator('.record').count(),1);
  pass('keyboard focus/ArrowUp/Enter work on a short phone, reduced motion fades in place, and blocked storage keeps in-memory records');
  await reduced.context.close();

  const corrupt=await setup({},()=>{if(location.protocol==='http:'||location.protocol==='https:')localStorage.setItem('pikmin-fling.records.v1','not JSON');});
  assert.equal(await corrupt.page.locator('.record').count(),0);await corrupt.page.locator('#start').click();await finishByKeyboard(corrupt.page);
  assert.equal((await stored(corrupt.page))[20].length,1);
  pass('corrupted browser storage recovers and saves the next completed game');await corrupt.context.close();

  const offline=await setup({serviceWorkers:'allow'});
  await offline.page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  const manifest=await offline.context.request.get(new URL('manifest.webmanifest',base).href).then(r=>r.json());
  assert.equal(manifest.short_name,'Pikmin Fling');
  for(const icon of manifest.icons)assert.equal((await offline.context.request.get(new URL(icon.src,base).href)).status(),200);
  await offline.context.setOffline(true);await offline.page.reload();await offline.page.locator('#start:not(:disabled)').waitFor();
  await offline.page.locator('#start').click();await finishByKeyboard(offline.page);
  assert.equal(await offline.page.locator('.pikmin img').evaluateAll(images=>images.every(i=>i.naturalWidth>0)),true);
  const fresh=await offline.context.newPage();await fresh.goto(base);await fresh.locator('#start:not(:disabled)').waitFor();
  pass('manifest/icons and every character support a full offline round and a fresh offline tab');
  await offline.context.setOffline(false);await offline.page.locator('.playground-home').click();await offline.page.waitForURL(new URL('../',base).href);
  assert.equal(await offline.page.locator('.card').count(),5);assert.equal(await offline.page.locator('a[href="pikmin-fling/"]').count(),1);
  pass('All games returns to the five-game landing page with its new Pikmin card');
  await offline.context.close();assert.deepEqual(errors,[]);pass('no uncaught browser errors across repeated games, gestures, storage failures or offline play');
  console.log(`\n${checks} Pikmin Fling browser checks passed. Screenshots: ${output}`);
}finally{await browser.close();}
