import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PLAYGROUND_URL||'http://localhost:5173/';
const routes=['','grid-rush/','grid-rush-in-order/','tap-and-spill/','line-up/','pikmin-fling/','just-a-sec/','roach-rush/','stone-skip/','balance-bridge/','pot-toss/','marble-maze/','floating-balance/','flick-force/','memory-trace/','dice-party/','poker-party/','mahjong-match/','beat-bad-luck/'];
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function tap(protocol,x,y){await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
try{
  await mkdir('/tmp/playground-touch-qa',{recursive:true});
  const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(()=>{try{localStorage.setItem('playground.language.v1','en');}catch{}Math.random=()=>.9;});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const protocol=await context.newCDPSession(page);
  for(const route of routes){
    await page.goto(new URL(route,base).href);const heading=page.locator('h1').first();await heading.scrollIntoViewIfNeeded();
    const r=await heading.boundingBox(),x=Math.min(350,r.x+r.width/2),y=r.y+r.height/2;
    const scale=await page.evaluate(()=>visualViewport.scale);await tap(protocol,x,y);await tap(protocol,x,y);
    assert.ok(Math.abs(await page.evaluate(()=>visualViewport.scale)-scale)<.01,route);
    const policy=await heading.evaluate(el=>[el,document.body,document.documentElement].map(node=>getComputedStyle(node).touchAction));assert.ok(policy.every(value=>value==='manipulation'),`${route}: ${policy}`);
    const viewport=await page.locator('meta[name=viewport]').getAttribute('content');assert.doesNotMatch(viewport,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\D|$)/i);
    pass(`${route||'landing'}: real touch double tap keeps the viewport scale, with zoom-permitting viewport settings`);
  }
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.fonts.check('500 24px Fredoka')));
  for(const width of [320,375,640,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const language of ['zh-Hant','en']){
      await page.locator(`[data-language="${language}"]`).click();const title=page.locator('h1');assert.equal(await title.textContent(),'Your Playground.');
      const style=await title.evaluate(el=>({family:getComputedStyle(el).fontFamily,line:parseFloat(getComputedStyle(el).lineHeight)/parseFloat(getComputedStyle(el).fontSize),fits:el.scrollWidth<=el.clientWidth}));
      assert.match(style.family,/Fredoka/);assert.ok(Math.abs(style.line-1.15)<.01);assert.equal(style.fits,true);
      assert.ok(await page.locator('.playground-brand').evaluate(el=>{const r=[...el.children].map(node=>node.getBoundingClientRect());return r.every(a=>Math.abs(a.y+a.height/2-r[0].y-r[0].height/2)<1);}));
    }
    if([375,1440].includes(width))await page.screenshot({path:`/tmp/playground-touch-qa/title-${width}.png`,fullPage:true});
  }
  pass('local Fredoka title keeps the logo, title and language controls on one row in both languages at five widths');
  await page.setViewportSize({width:375,height:812});await page.goto(base);
  const original=await page.evaluate(()=>visualViewport.scale);
  await protocol.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:125,y:100},{id:2,x:225,y:100}]});
  for(let i=1;i<=8;i++){await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:125-i*7,y:100},{id:2,x:225+i*7,y:100}]});await page.evaluate(()=>new Promise(requestAnimationFrame));}
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForFunction(original=>visualViewport.scale>original+.2,original);pass('intentional two-finger pinch zoom remains available');

  await page.goto(new URL('roach-rush/',base).href);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.locator('#start').click();
  const roach=page.locator('.critter[data-type=roach][data-size=big]').first(),r=await roach.boundingBox();
  await tap(protocol,r.x+r.width/2,r.y+r.height/2);assert.equal(await page.locator('#score').textContent(),'0');await page.clock.runFor(80);
  await tap(protocol,r.x+r.width/2,r.y+r.height/2);assert.equal(await page.locator('#score').textContent(),'2');assert.equal(await page.evaluate(()=>visualViewport.scale),1);
  assert.equal(await page.locator('#room').evaluate(el=>getComputedStyle(el).touchAction),'none');pass('a real double tap still eliminates a big ground roach for two points without zooming');

  await page.goto(new URL('stone-skip/',base).href);await page.locator('input[name=mode][value=gesture]').check();await page.locator('#start').click();
  const stone=await page.locator('#stone').boundingBox(),p={x:stone.x+stone.width/2,y:stone.y+stone.height/2};
  assert.equal(await page.locator('#stone').evaluate(el=>getComputedStyle(el).touchAction),'none');
  await protocol.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...p}]});await page.clock.runFor(40);
  await protocol.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:p.x+20,y:p.y-100}]});await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.locator('#flight-counter').isVisible(),true);assert.equal(await page.evaluate(()=>visualViewport.scale),1);pass('the stone swipe retains its custom gesture surface and starts a flight');
  assert.deepEqual(errors,[]);pass('no uncaught errors');await protocol.detach();await context.close();console.log(`\n${checks} touch and title browser checks passed.`);
}finally{await browser.close();}
