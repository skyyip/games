// Optional QA using an existing Playwright installation; no runtime dependencies.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {SHAPES, SHAPE_NAMES} from '../src/geometry.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.LINE_UP_URL||'http://localhost:5173/line-up/';
const output=process.env.LINE_UP_SCREENSHOTS||'/tmp/line-up-qa';
const errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},kind=0,target=.36) {
  const context=await browser.newContext({serviceWorkers:'block',...options});
  await context.addInitScript(() => { try { localStorage.setItem('playground.language.v1', 'en'); } catch { /* Storage-denial tests use the default language. */ } });
  await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await context.addInitScript(({kind,target,count})=>{
    let draw=0;const values=[target,(kind+.1)/count,.7,.6,.5];
    Math.random=()=>values[draw++%values.length];
  },{kind,target,count:SHAPES.length});
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  return {context,page};
}
async function point(page,fraction) {
  return page.locator('#line-base').evaluate((path,fraction)=>{
    const p=path.getPointAtLength(path.getTotalLength()*fraction),m=path.getScreenCTM();
    return {x:p.x*m.a+p.y*m.c+m.e,y:p.x*m.b+p.y*m.d+m.f};
  },fraction);
}
async function choose(page,a,b,drag=false) {
  await page.locator('#line-svg').scrollIntoViewIfNeeded();
  const first=await point(page,a),last=await point(page,b);
  // Cross the endpoint caps so device-pixel rounding cannot shorten a full-line guess.
  if(a===0 || a===1)first.x+=a===0?-2:2;
  if(b===0 || b===1)last.x+=b===0?-2:2;
  if(drag){await page.mouse.move(first.x,first.y);await page.mouse.down();await page.mouse.move(last.x,last.y,{steps:8});await page.mouse.up();}
  else{await page.mouse.click(first.x,first.y);await page.mouse.click(last.x,last.y);}
  assert.equal(await page.locator('#lock').isDisabled(),false);
  const ratio=await page.evaluate(()=>document.querySelector('#line-selection').getTotalLength()/document.querySelector('#line-base').getTotalLength());
  assert.ok(Math.abs(ratio-Math.abs(a-b))<.0001,'highlight must match actual selected arc length');
}
async function keyboardGuess(page,percent) {
  await page.locator('#edit-start').focus();await page.keyboard.press('Enter');await page.keyboard.press('Home');
  assert.equal(await page.locator('#start-point').evaluate(el=>el===document.activeElement),true);
  await page.locator('#edit-end').focus();await page.keyboard.press('Enter');await page.keyboard.press('Home');
  for(let i=0;i<percent;i++)await page.keyboard.press('ArrowRight');
  await page.locator('#lock').focus();await page.keyboard.press('Enter');
}
async function touchPoint(protocol,page,fraction,type='touchStart') {
  const p=await point(page,fraction);
  await protocol.send('Input.dispatchTouchEvent',{type,touchPoints:[{id:1,x:p.x,y:p.y}]});
}
try{
  await mkdir(output,{recursive:true});
  for(const [kind,label] of SHAPES.entries()){
    const {context,page}=await setup({viewport:{width:1440,height:1050}},kind);
    assert.equal(await page.title(),'Line Up · Sky’s Playground');
    await page.locator('#player-0').fill('Alice');await page.locator('#player-1').fill('Bob');
    await page.locator('#start').click();assert.equal(await page.locator('#target').textContent(),'37');
    assert.match(await page.locator('#shape-name').textContent(),new RegExp(SHAPE_NAMES[label]));
    const path=await page.locator('#line-base').getAttribute('d');
    await page.locator('#ready').click();assert.equal(await page.locator('#lock').isDisabled(),true);
    await choose(page,.1,.5,kind%2===0);await page.locator('#lock').click();
    assert.equal(await page.locator('#standings>li').count(),0);
    assert.equal(await page.locator('#play').isHidden(),true);
    assert.equal(await page.locator('#start-point').inputValue(),'0');assert.equal(await page.locator('#end-point').inputValue(),'100');
    assert.equal(await page.locator('#target').textContent(),'37');assert.equal(await page.locator('#line-base').getAttribute('d'),path);
    await page.locator('#ready').click();await choose(page,.2,.57,kind%2!==0);
    const lengthHint=await page.locator('#selection-help').textContent();assert.ok(!lengthHint.includes('%'));
    await page.locator('#lock').click();
    assert.match(await page.locator('#result-title').textContent(),/Bob wins/);
    assert.equal(await page.locator('.result-row').count(),2);
    const targetRatio=await page.locator('#result-preview').evaluate(svg=>svg.querySelector('.path-selection').getTotalLength()/svg.querySelector('.path-base').getTotalLength());
    assert.ok(Math.abs(targetRatio-.37)<.0001,'reference highlight must be exactly the target percentage');
    assert.ok(Math.abs(parseFloat(await page.locator('.result-row .result-score strong').first().textContent())-37)<.03);
    await page.waitForTimeout(550);
    await page.screenshot({path:`${output}/${label}-results.png`,fullPage:true,animations:'disabled'});
    pass(`${label}: shared target/path, tap and drag selection, hidden guesses and correct arc-length winner`);
    await page.locator('#again').click();assert.equal(await page.locator('#handoff').isVisible(),true);
    assert.equal(await page.locator('#next-player').textContent(),'Alice');assert.equal(await page.locator('#lock').isDisabled(),true);
    pass(`${label}: another round resets every guess and starts the first player`);
    await context.close();
  }

  const closed=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true},4);
  await closed.page.locator('#start').tap();await closed.page.locator('#ready').tap();
  assert.equal(await closed.page.locator('#closed-controls').isVisible(),true);
  assert.equal(await closed.page.locator('#other-side').isDisabled(),true);
  const closedProtocol=await closed.context.newCDPSession(closed.page);
  await closed.page.locator('#line-svg').scrollIntoViewIfNeeded();
  await touchPoint(closedProtocol,closed.page,.1);
  await closedProtocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await touchPoint(closedProtocol,closed.page,.73);
  await closedProtocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await closed.page.locator('#other-side').tap();
  assert.equal(await closed.page.locator('#other-side').getAttribute('aria-pressed'),'true');
  let closedRatio=await closed.page.evaluate(()=>document.querySelector('#line-selection').getTotalLength()/document.querySelector('#line-base').getTotalLength());
  assert.ok(Math.abs(closedRatio-.37)<.0001,'the other arc crosses the closing join and measures 37%');
  pass('closed circle accepts separate touch points and switches to the complementary arc across the join');
  const closedBefore=[await closed.page.locator('#start-point').inputValue(),await closed.page.locator('#end-point').inputValue()];
  for(const width of [320,375,600,768,1024,1440]) {
    await closed.page.setViewportSize({width,height:900});await closed.page.waitForTimeout(80);
    const layout=await closed.page.evaluate(()=>{
      const path=document.querySelector('#line-base'),box=path.getBBox(),m=path.getScreenCTM();
      return {overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,width:box.width*m.a,height:box.height*m.d,
        controls:[...document.querySelectorAll('.closed-controls button,.marker')].map(el=>el.getBoundingClientRect().height)};
    });
    assert.equal(layout.overflow,false);assert.ok(Math.abs(layout.width-layout.height)<.1,'a circle stays circular');
    assert.ok(layout.controls.every(height=>height>=44));
    assert.deepEqual([await closed.page.locator('#start-point').inputValue(),await closed.page.locator('#end-point').inputValue()],closedBefore);
    const p=await point(closed.page,Number(closedBefore[0])/100),marker=await closed.page.locator('#start-marker').boundingBox();
    assert.ok(Math.abs(marker.x+marker.width/2-p.x)<.6);assert.ok(Math.abs(marker.y+marker.height/2-p.y)<.6);
    if([375,1440].includes(width))await closed.page.screenshot({path:`${output}/circle-choosing-${width}.png`,fullPage:true,animations:'disabled'});
  }
  pass('closed shapes stay proportional with aligned 44px markers and no overflow at six phone/tablet/desktop widths');
  await closed.page.locator('#lock').click();
  assert.equal(await closed.page.locator('#other-side').getAttribute('aria-pressed'),'false');
  await closed.page.locator('#ready').click();
  await closed.page.locator('#whole-outline').click();
  closedRatio=await closed.page.evaluate(()=>document.querySelector('#line-selection').getTotalLength()/document.querySelector('#line-base').getTotalLength());
  assert.ok(Math.abs(closedRatio-1)<.0001);
  await closed.page.locator('#clear').click();assert.equal(await closed.page.locator('#lock').isDisabled(),true);
  await choose(closed.page,.1,.5);await closed.page.locator('#lock').click();
  assert.match(await closed.page.locator('#result-title').textContent(),/Player 1 wins/);
  assert.match(await closed.page.locator('.result-score strong').first().textContent(),/37\.00%/);
  pass('closed-shape scoring uses the chosen arc, hides it at handoff, and clears a whole-outline selection');
  await closedProtocol.detach();await closed.context.close();

  const full=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}},5,.999999);
  await full.page.locator('#start').click();
  for(let player=0;player<2;player++) {
    await full.page.locator('#ready').click();
    if(player===0){await full.page.locator('#whole-outline').focus();await full.page.keyboard.press('Enter');await full.page.locator('#lock').click();}
    else await keyboardGuess(full.page,100);
  }
  assert.match(await full.page.locator('#result-title').textContent(),/share the win/);
  assert.equal(await full.page.locator('.result-row.winner').count(),2);
  assert.equal(await full.page.locator('#result').evaluate(el=>el.getAnimations().length),0);
  pass('100% closed outlines work with a button and endpoint keyboard controls, including reduced motion');
  await full.context.close();

  const {context,page}=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true},2);
  await page.locator('#start').tap();await page.locator('#ready').tap();
  await page.locator('#line-svg').scrollIntoViewIfNeeded();
  const protocol=await context.newCDPSession(page);
  await touchPoint(protocol,page,.2);
  for(let i=1;i<=8;i++)await touchPoint(protocol,page,.2+i*.37/8,'touchMove');
  assert.equal(await page.locator('#lock').isDisabled(),true,'guess cannot submit during a drag');
  await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.locator('#lock').isDisabled(),false);
  const before=[await page.locator('#start-point').inputValue(),await page.locator('#end-point').inputValue()];
  await touchPoint(protocol,page,.3);await touchPoint(protocol,page,.8,'touchMove');
  await protocol.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  assert.deepEqual([await page.locator('#start-point').inputValue(),await page.locator('#end-point').inputValue()],before);
  pass('touch follows the curved path, locks only after release and restores a cancelled drag');
  const path=await page.locator('#line-base').getAttribute('d');
  for(const width of [320,375,600,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.waitForTimeout(100);
    const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,back:document.querySelector('.playground-home').getBoundingClientRect().height}));
    assert.ok(layout.width<=layout.viewport,`overflow at ${width}`);assert.ok(layout.back>=44);
    assert.equal(await page.locator('#line-base').getAttribute('d'),path);
    assert.deepEqual([await page.locator('#start-point').inputValue(),await page.locator('#end-point').inputValue()],before);
    const p=await point(page,Number(before[0])/100),marker=await page.locator('#start-marker').boundingBox();
    assert.ok(Math.abs(marker.x+marker.width/2-p.x)<.6);assert.ok(Math.abs(marker.y+marker.height/2-p.y)<.6);
    if([375,1440].includes(width))await page.screenshot({path:`${output}/choosing-${width}.png`,fullPage:true,animations:'disabled'});
    pass(`${width}px: responsive layout, 44px controls, stable percentage and markers on the actual curve`);
  }
  await page.locator('#lock').click();await page.locator('#ready').click();
  await page.locator('#line-svg').scrollIntoViewIfNeeded();
  await touchPoint(protocol,page,.1);await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await touchPoint(protocol,page,.5);await protocol.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.locator('#lock').click();assert.match(await page.locator('#result-title').textContent(),/Player 1 wins/);
  pass('two separate touch taps place endpoints and complete a pass-and-play round');
  await protocol.detach();await context.close();

  const keyboard=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}},3);
  for(let i=0;i<4;i++)await keyboard.page.locator('#plus').click();
  assert.equal(await keyboard.page.locator('#plus').isDisabled(),true);
  assert.equal(await keyboard.page.locator('#rows input').count(),6);
  await keyboard.page.locator('#player-0').fill('<b>Alice</b>');
  await keyboard.page.locator('#start').focus();await keyboard.page.keyboard.press('Enter');
  assert.equal(await keyboard.page.locator('#next-player').textContent(),'<b>Alice</b>');assert.equal(await keyboard.page.locator('#next-player b').count(),0);
  for(let i=0;i<6;i++){
    await keyboard.page.locator('#ready').focus();await keyboard.page.keyboard.press('Enter');
    await keyboardGuess(keyboard.page,(i+1)*10);
  }
  assert.match(await keyboard.page.locator('#result-title').textContent(),/Player 4 wins/);
  assert.equal(await keyboard.page.locator('.result-row').count(),6);
  assert.equal(await keyboard.page.locator('#result').evaluate(el=>el.getAnimations().length),0);
  pass('six players complete by keyboard on a short phone screen, with reduced motion and safe literal names');
  await keyboard.page.locator('#change-players').click();
  for(let i=0;i<4;i++)await keyboard.page.locator('#minus').click();
  assert.equal(await keyboard.page.locator('#minus').isDisabled(),true);assert.equal(await keyboard.page.locator('#rows input').count(),2);
  await keyboard.context.close();

  const tie=await setup({},0);await tie.page.locator('#start').click();
  for(const guess of [40,34]){await tie.page.locator('#ready').click();await keyboardGuess(tie.page,guess);}
  assert.match(await tie.page.locator('#result-title').textContent(),/share the win/);assert.equal(await tie.page.locator('.result-row.winner').count(),2);
  pass('equally close guesses above and below the target share the win');await tie.context.close();

  for(const [random,target] of [[0,1],[.999999,100]]){
    const edge=await setup({viewport:{width:320,height:812},isMobile:true,hasTouch:true},0,random);
    await edge.page.locator('#start').tap();assert.equal(await edge.page.locator('#target').textContent(),String(target));
    await edge.page.locator('#ready').tap();
    if(target===1){
      const p=await edge.context.newCDPSession(edge.page);await edge.page.locator('#line-svg').scrollIntoViewIfNeeded();
      await touchPoint(p,edge.page,.4);await p.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await touchPoint(p,edge.page,.41);await p.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.equal(await edge.page.locator('#lock').isDisabled(),false);await edge.page.locator('#lock').tap();await p.detach();
    }else{await choose(edge.page,1,0,true);await edge.page.locator('#lock').click();}
    assert.equal(await edge.page.locator('#handoff').isVisible(),true);
    pass(`${target}% target: ${target===1?'nearby touch endpoints':'full-length reverse selection'} can be locked`);
    await edge.context.close();
  }

  const offline=await setup({serviceWorkers:'allow'},1);
  await offline.page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  });
  const manifest=await offline.context.request.get(new URL('manifest.webmanifest',base).href).then(r=>r.json());
  assert.equal(manifest.name,'Line Up · Sky’s Playground');
  for(const icon of manifest.icons)assert.equal((await offline.context.request.get(new URL(icon.src,base).href)).status(),200);
  await offline.context.setOffline(true);await offline.page.reload();
  await offline.page.locator('#start').click();
  for(const guess of [30,40]){await offline.page.locator('#ready').click();await keyboardGuess(offline.page,guess);}
  assert.equal(await offline.page.locator('#result').isVisible(),true);
  const fresh=await offline.context.newPage();fresh.on('pageerror',e=>errors.push(e.message));await fresh.goto(base);assert.equal(await fresh.locator('#setup').isVisible(),true);
  pass('manifest/icons load and cached code supports a complete offline round and a fresh offline tab');
  await offline.context.setOffline(false);await offline.page.locator('.playground-home').click();
  await offline.page.waitForURL(new URL('../',base).href);assert.equal(await offline.page.locator('.card').count(),5);
  pass('All games returns to the five-game landing page');await offline.context.close();
  assert.deepEqual(errors,[]);pass('no uncaught browser errors during setup, selection, results, replay or offline play');
  console.log(`\n${checks} Line Up browser checks passed. Screenshots: ${output}`);
}finally{await browser.close();}
