// Optional browser verification using the existing Playwright installation.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PLAYGROUND_URL||'http://localhost:5173/';
const output=process.env.PLAYGROUND_SCREENSHOTS||'/tmp/playground-favourites-qa';
const ids=['grid-rush','grid-rush-in-order','tap-and-spill','line-up','pikmin-fling'];
const errors=[];let checks=0;
const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(options={},init) {
  const context=await browser.newContext({serviceWorkers:'block',...options});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  if(init)await context.addInitScript(init);
  context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const page=await context.newPage();await page.goto(base);
  await page.locator('.favourite-button:not(:disabled)').first().waitFor();
  return {context,page};
}
const order=page=>page.locator('.game-card').evaluateAll(cards=>cards.map(card=>card.dataset.game));
const star=(page,id)=>page.locator(`.game-card[data-game="${id}"] .favourite-button`);
const settled=page=>page.waitForFunction(()=>[...document.querySelectorAll('.game-card')].every(card=>card.getAnimations({subtree:true}).length===0));
try {
  await mkdir(output,{recursive:true});
  const {context,page}=await setup({viewport:{width:1440,height:1050}});
  assert.deepEqual(await order(page),ids);
  assert.equal(await page.locator('.favourite-button').count(),5);
  assert.equal(await page.locator('a .favourite-button').count(),0,'buttons must not be nested in links');
  assert.equal(await page.getByRole('button',{name:'Favourite: Grid Rush',exact:true}).getAttribute('aria-pressed'),'false');
  const initialFill=await star(page,'pikmin-fling').locator('.star-shape').evaluate(path=>getComputedStyle(path).fill);
  const initialGridTop=await page.locator('.grid').evaluate(grid=>grid.offsetTop);
  pass('five native star toggles have game-specific names, unselected states and independent game links');

  await star(page,'pikmin-fling').click();
  assert.equal(page.url(),base);assert.equal((await order(page))[0],'pikmin-fling');
  assert.equal(await star(page,'pikmin-fling').getAttribute('aria-pressed'),'true');
  assert.match(await star(page,'pikmin-fling').getAttribute('title'),/Remove/);
  const animating=await star(page,'pikmin-fling').evaluate(button=>({
    card:button.closest('.game-card').getAnimations().length,icon:button.querySelector('svg').getAnimations().length,rays:button.querySelector('.star-rays').getAnimations().length,
  }));
  assert.ok(animating.card&&animating.icon&&animating.rays);
  await settled(page);
  assert.notEqual(await star(page,'pikmin-fling').locator('.star-shape').evaluate(path=>getComputedStyle(path).fill),initialFill);
  assert.match(await page.locator('#favourite-announcement').textContent(),/added to favourites and moved to the start/);
  assert.equal(await page.locator('.grid').evaluate(grid=>grid.offsetTop),initialGridTop,'status announcements must not move the grid');
  const statusBox=await page.locator('#favourite-announcement').boundingBox();assert.ok(statusBox.width<=1&&statusBox.height<=1);
  pass('starring moves the card first, fills the star, animates the icon/rays/card and announces the change without navigating');

  await star(page,'line-up').click();await settled(page);
  assert.deepEqual(await order(page),['line-up','pikmin-fling','grid-rush','grid-rush-in-order','tap-and-spill']);
  await star(page,'pikmin-fling').click();
  assert.equal(await star(page,'pikmin-fling').getAttribute('aria-pressed'),'false');
  assert.ok(await star(page,'pikmin-fling').locator('svg').evaluate(icon=>icon.getAnimations().length)>0);
  await settled(page);
  assert.deepEqual(await order(page),['line-up','grid-rush','grid-rush-in-order','tap-and-spill','pikmin-fling']);
  assert.equal(await star(page,'line-up').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#favourite-announcement').textContent(),/removed from favourites and moved to the end/);
  pass('multiple favourites use most-recent-first order; unstarring animates, moves last and preserves other favourites');

  const saved=await order(page);await page.reload();await settled(page);
  assert.deepEqual(await order(page),saved);assert.equal(await star(page,'line-up').getAttribute('aria-pressed'),'true');
  assert.equal(await star(page,'line-up').locator('svg').evaluate(icon=>icon.getAnimations().length),0);
  pass('refresh restores both favourites and the full card order without replaying a star-change animation');

  const rapid=star(page,'grid-rush-in-order');await rapid.focus();
  for(let i=0;i<6;i++)await page.keyboard.press('Space');
  await settled(page);
  assert.equal(await rapid.getAttribute('aria-pressed'),'false');
  assert.equal((await order(page)).at(-1),'grid-rush-in-order');
  assert.equal(await rapid.evaluate(button=>button===document.activeElement),true);
  assert.equal(await page.locator('.game-card').count(),5);
  await page.waitForFunction(()=>{const b=document.activeElement.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;});
  pass('rapid keyboard toggles cancel previous animations, preserve focus, keep one copy of every card and reveal the focused control');

  for(const width of [320,375,768,1440]) {
    await page.setViewportSize({width,height:900});await settled(page);
    const layout=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      columns:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length,
      buttons:[...document.querySelectorAll('.favourite-button')].map(button=>{const r=button.getBoundingClientRect(),card=button.closest('.game-card').getBoundingClientRect();return {w:r.width,h:r.height,x:r.x-card.x,y:r.y-card.y};}),
    }));
    assert.equal(layout.overflow,false);assert.equal(layout.columns,2);
    assert.ok(layout.buttons.every(b=>b.w>=44&&b.h>=44&&b.x>=8&&b.x<=13&&b.y>=8&&b.y<=13));
    if([375,1440].includes(width))await page.screenshot({path:`${output}/favourites-${width}.png`,fullPage:true,animations:'disabled'});
  }
  pass('stars stay at the card’s top-left with 44px targets, two columns and no overflow on phone, tablet and desktop');
  await page.locator('.game-card[data-game="line-up"] a.card').click();await page.waitForURL(new URL('line-up/',base).href);
  // Let the native inbound page transition reveal the game before returning.
  await page.waitForTimeout(650);
  await page.locator('.playground-home').click();await page.waitForURL(base);await settled(page);
  assert.equal(await star(page,'line-up').getAttribute('aria-pressed'),'true');
  pass('game links still navigate normally and favourites survive returning to the landing page');
  await context.close();

  const mobile=await setup({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  await star(mobile.page,'pikmin-fling').tap();await settled(mobile.page);
  assert.equal((await order(mobile.page))[0],'pikmin-fling');assert.equal(mobile.page.url(),base);
  await star(mobile.page,'pikmin-fling').tap();await settled(mobile.page);
  assert.equal((await order(mobile.page)).at(-1),'pikmin-fling');
  assert.equal(await star(mobile.page,'pikmin-fling').getAttribute('aria-pressed'),'false');
  pass('real touch taps toggle favourites and move cards to either end without opening a game');
  await mobile.context.close();

  const quiet=await setup({reducedMotion:'reduce',viewport:{width:320,height:568}});
  const keyboardStar=star(quiet.page,'line-up');await keyboardStar.focus();await quiet.page.keyboard.press('Enter');
  assert.equal((await order(quiet.page))[0],'line-up');assert.equal(await keyboardStar.getAttribute('aria-pressed'),'true');
  assert.equal(await quiet.page.locator('.game-card').evaluateAll(cards=>cards.some(card=>card.getAnimations({subtree:true}).length)),false);
  assert.equal(await keyboardStar.evaluate(button=>button===document.activeElement),true);
  await quiet.page.keyboard.press('Space');assert.equal((await order(quiet.page)).at(-1),'line-up');
  pass('Enter and Space toggle with visible state and retained focus while reduced motion skips all reorder/star animations');
  await quiet.context.close();

  const live=await setup();await star(live.page,'pikmin-fling').click();
  assert.ok(await live.page.evaluate(()=>{
    window.favouriteTestAnimations=[...document.querySelectorAll('.game-card')].flatMap(card=>card.getAnimations({subtree:true}));
    return window.favouriteTestAnimations.length;
  })>0);
  await live.page.emulateMedia({reducedMotion:'reduce'});
  // Media-query change events arrive asynchronously; require cancellation, not natural completion.
  await live.page.waitForFunction(()=>window.favouriteTestAnimations.every(animation=>animation.playState==='idle'));
  assert.equal(await live.page.locator('.game-card').evaluateAll(cards=>cards.some(card=>card.getAnimations({subtree:true}).length)),false);
  assert.equal((await order(live.page))[0],'pikmin-fling');
  assert.equal(await star(live.page,'pikmin-fling').getAttribute('aria-pressed'),'true');
  await star(live.page,'pikmin-fling').click();assert.equal((await order(live.page)).at(-1),'pikmin-fling');
  pass('enabling reduced motion during a change cancels card, star and ray animations without losing state');
  await live.context.close();

  for(const mode of ['corrupt','blocked','full']) {
    const fallback=await setup({},mode==='corrupt'?()=>{if(location.protocol.startsWith('http'))localStorage.setItem('playground.favourites.v1','{');}:mode==='blocked'?()=>{
      Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});
    }:()=>{Storage.prototype.setItem=()=>{throw new Error('full');};});
    assert.deepEqual(await order(fallback.page),ids);
    await star(fallback.page,'tap-and-spill').click();await settled(fallback.page);
    assert.equal((await order(fallback.page))[0],'tap-and-spill');
    assert.equal(await star(fallback.page,'tap-and-spill').getAttribute('aria-pressed'),'true');
    if(mode!=='corrupt')assert.match(await fallback.page.locator('#favourite-announcement').textContent(),/Saved for this visit/);
    await fallback.context.close();pass(`${mode} storage does not prevent starring, reordering or game links`);
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors during repeated toggles, navigation, touch or unavailable storage');
  console.log(`\n${checks} favourites browser checks passed. Screenshots: ${output}`);
}finally{await browser.close();}
