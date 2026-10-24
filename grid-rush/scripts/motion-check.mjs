// Optional interaction regressions; uses the existing Playwright installation.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel:'chrome',headless:true });
const base = process.env.PLAYGROUND_URL || 'http://localhost:5173/';
const errors = [];
let checks = 0;
const pass = message => { checks++; console.log(`PASS ${message}`); };
const contextFor = async options => {
  const context = await browser.newContext({ serviceWorkers:'block',...options });
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**', route => route.fulfill({contentType:'text/javascript',body:''}));
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  return context;
};
const near = (a,b,tolerance=0.5) => assert.ok(Math.abs(a-b)<tolerance, `${a} differs from ${b}`);
const unchanged = (a,b) => ['x','y','width','height'].forEach(key => near(a[key],b[key]));
const url = path => new URL(path,base).href;
const settle = page => page.waitForTimeout(800);
try {
  await mkdir('/tmp/playground-motion-qa',{recursive:true});
  const desktop = await contextFor({viewport:{width:1440,height:1050}});
  const page = await desktop.newPage();
  await page.goto(base); await settle(page);
  const card = page.locator('.card').first(), surface = card.locator('.card-surface');
  const fixed = await card.boundingBox();
  await page.mouse.move(fixed.x+fixed.width*.8,fixed.y+fixed.height*.35);
  await settle(page);
  unchanged(await card.boundingBox(),fixed);
  const layers = await card.evaluate(card => ({
    surface:getComputedStyle(card.querySelector('.card-surface')).transform,
    foreground:getComputedStyle(card.querySelector('.art svg')).transform,
    middle:getComputedStyle(card.querySelector('.body')).transform,
    background:getComputedStyle(card.querySelector('.art'),'::before').translate,
  }));
  assert.notEqual(layers.surface,'none');
  assert.notEqual(layers.foreground,layers.middle);
  assert.notEqual(layers.background,'0px');
  pass('parallax moves separate visual layers while native card hit areas stay fixed');

  const x=fixed.x+fixed.width/2,y=fixed.y+90;
  await page.mouse.move(x,y); await page.mouse.down();
  await page.mouse.move(x+90,y+45,{steps:6});
  assert.equal(await card.evaluate(el=>el.classList.contains('is-tugging')),true);
  assert.ok(parseFloat(await surface.evaluate(el=>el.style.getPropertyValue('--bend')))>0);
  unchanged(await card.boundingBox(),fixed);
  await page.screenshot({path:'/tmp/playground-motion-qa/card-tug.png'});
  await page.mouse.up(); await page.mouse.move(0,0); await settle(page);
  assert.equal(page.url(),base);
  assert.equal(await card.evaluate(el=>el.classList.contains('is-tugging')),false);
  const matrix = await surface.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).toFloat64Array());
  near(matrix[12],0); near(matrix[13],0);
  await page.mouse.move(x,y); await page.mouse.down();
  await page.mouse.move(x,y+80,{steps:5});
  assert.ok(parseFloat(await surface.evaluate(el=>el.style.getPropertyValue('--bend')))<0, 'vertical tugs stretch along their travel direction');
  await page.mouse.up(); await page.mouse.move(0,0); await settle(page);
  assert.equal(page.url(),base);
  pass('card tugs deform, stay bounded, rebound, and suppress accidental launches');
  await card.focus(); await page.keyboard.press('Enter');
  await page.waitForURL(url('grid-rush/')); await settle(page);
  pass('cards retain keyboard navigation and native game launch after a drag');

  for (const size of [6,3,5,4]) await page.locator(`.grid-option:has(input[value="${size}"])`).click();
  assert.equal(await page.locator('.grid-option input:checked').inputValue(),'4');
  await page.mouse.move(0,0); await settle(page);
  const ink=await page.locator('#grid-options>.choice-ink').boundingBox();
  const selected=await page.locator('.grid-option input:checked+span').boundingBox();
  unchanged(ink,selected);
  pass('liquid selection outline settles over the latest native radio choice');
  await page.locator('#start').click();
  assert.equal(await page.locator('.tile').count(),16);
  assert.equal(await page.locator('#grid-options>.choice-ink').isVisible(),false);
  const tile=page.locator('.tile').first(),before=await tile.boundingBox();
  await tile.click(); unchanged(await tile.boundingBox(),before);
  assert.equal(await page.locator('#progress').textContent(),'1');
  for(let i=1;i<16;i++) await page.locator('.tile').nth(i).click();
  assert.equal(await page.locator('#result').isVisible(),true);
  assert.equal(await page.locator('#play-again').evaluate(el=>el===document.activeElement),true);
  await page.locator('#play-again').click();
  assert.equal(await page.locator('#progress').textContent(),'0');
  pass('tile feedback preserves geometry and completed/replay actions remain immediate');
  await page.locator('.playground-home').click(); await page.waitForURL(base); await settle(page);
  await page.screenshot({path:'/tmp/playground-motion-qa/landing-desktop.png',fullPage:true});

  const mobile = await contextFor({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  const touch=await mobile.newPage(); await touch.goto(base); await settle(touch);
  const protocol = await mobile.newCDPSession(touch);
  const swipe=async(x,y,distance,{cancel=false,hold=0}={})=>{
    await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=5;i++) {
      await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+distance*i/5}]});
      await touch.waitForTimeout(20);
    }
    if(hold) await touch.waitForTimeout(hold);
    await protocol.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
  };
  const bounds=await touch.locator('.card').last().boundingBox();
  await swipe(bounds.x+40,Math.min(700,bounds.y+80),-220);
  assert.ok(await touch.evaluate(()=>scrollY)>50);
  assert.equal(await touch.locator('.is-tugging').count(),0);
  assert.equal(await touch.locator('.grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);
  await settle(touch);
  await touch.screenshot({path:'/tmp/playground-motion-qa/landing-mobile.png',fullPage:true});
  pass('mobile cards preserve native vertical scrolling and the two-column layout');

  await touch.goto(url('grid-rush-in-order/'));
  const dialog=touch.locator('#install-dialog');
  const open=async()=>{await dialog.evaluate(el=>el.showModal());await touch.waitForTimeout(400);};
  const drag=async(distance,options)=>{
    const grip=await touch.locator('.sheet-grip').boundingBox();
    await swipe(grip.x+grip.width/2,grip.y+grip.height/2,distance,options);
  };
  await open(); await drag(20); await settle(touch);
  assert.equal(await dialog.evaluate(el=>el.open),true);
  near(parseFloat(await dialog.evaluate(el=>getComputedStyle(el).getPropertyValue('--sheet-y'))),0);
  await drag(75,{hold:150}); await settle(touch);
  assert.equal(await dialog.evaluate(el=>el.open),true);
  pass('short and held sheet drags spring back rather than using stale flick velocity');
  await drag(160,{cancel:true}); await settle(touch);
  assert.equal(await dialog.evaluate(el=>el.open),true);
  await drag(160);
  assert.equal(await dialog.evaluate(el=>el.open),false);
  assert.equal(await touch.locator('.tile:disabled').count(),9, 'releasing the dismiss gesture must not start a game underneath');
  await dialog.waitFor({state:'hidden'});
  pass('cancelled gestures restore the sheet; committed gestures close it');
  await open(); await touch.getByRole('button',{name:'Close installation instructions'}).tap();
  assert.equal(await dialog.evaluate(el=>el.open),false); await dialog.waitFor({state:'hidden'});
  await open(); await touch.keyboard.press('Escape');
  assert.equal(await dialog.evaluate(el=>el.open),false); await dialog.waitFor({state:'hidden'});
  await open(); await touch.getByRole('button',{name:'Got it'}).tap(); await dialog.waitFor({state:'hidden'});
  await touch.setViewportSize({width:320,height:568}); await open();
  const d=await dialog.boundingBox(); assert.ok(d.x>=0 && d.x+d.width<=320 && d.y>=0 && d.y+d.height<=568);
  assert.ok(await dialog.evaluate(el=>el.scrollHeight>=el.clientHeight));
  await touch.screenshot({path:'/tmp/playground-motion-qa/install-mobile.png'});
  await touch.keyboard.press('Escape');
  pass('sheets have close-button, Escape and confirmation alternatives and fit short phones');

  await page.goto(base); await settle(page);
  const first=await page.locator('.card').first().boundingBox();
  await page.mouse.move(first.x+20,first.y+20);
  await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(100);
  for(const element of ['.card-surface','.art svg','.card .body']) assert.equal(await page.locator(element).first().evaluate(el=>getComputedStyle(el).transform),'none');
  assert.equal(await page.locator('.card-surface').first().evaluate(el=>el.getAnimations().length),0);
  await page.locator('.card').first().click(); await page.waitForURL(url('grid-rush/'));
  assert.equal(await page.locator('.choice-ink').isVisible(),false);
  await page.locator('#install-dialog').evaluate(el=>el.showModal());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#install-dialog').isHidden(),true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#start').click();
  assert.equal(await page.locator('#progress').textContent(),'0');
  pass('live reduced-motion changes cancel optional motion and preserve controls and navigation');

  await page.addInitScript(()=>{Math.random=()=>0.5;});
  await page.goto(url('tap-and-spill/'));
  await page.locator('#start').click(); await page.locator('#go').click();
  const tap=await page.locator('#touch').boundingBox();
  await page.mouse.move(tap.x+tap.width/2,tap.y+tap.height*.6); await page.mouse.down();
  await page.locator('#result').waitFor({state:'visible',timeout:16000});
  await page.mouse.up();
  assert.match(await page.locator('#roundInfo').textContent(),/1750/);
  assert.equal(await page.locator('#stats>div').count(),2);
  await page.locator('#again').click();
  assert.equal(await page.locator('#go').isVisible(),true);
  await page.locator('#go').click();
  assert.equal(await page.locator('#touch').isVisible(),true);
  pass('Tap & Spill spring visuals and droplet rebounds preserve overflow results and replay');

  await protocol.detach(); await mobile.close(); await desktop.close();
  assert.deepEqual(errors,[]);
  pass('no uncaught browser errors across motion, navigation, games and preference changes');
  console.log(`\n${checks} motion interaction checks passed. Screenshots: /tmp/playground-motion-qa`);
} finally {await browser.close();}
