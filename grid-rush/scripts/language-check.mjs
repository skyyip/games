// End-to-end language QA using the repository's optional Playwright installation.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PLAYGROUND_URL||'http://localhost:5173/';
const routes=['grid-rush/','grid-rush-in-order/','line-up/','pikmin-fling/','tap-and-spill/','just-a-sec/','roach-rush/', 'stone-skip/','balance-bridge/','pot-toss/','marble-maze/','floating-balance/'];
const errors=[];let checks=0;
const pass=message=>{checks++;console.log(`PASS ${message}`);};
const url=path=>new URL(path,base).href;
async function setup(options={},init) {
 const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',...options});
 await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
 if(init)await context.addInitScript(init);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 return {context,page};
}
const text=async(page,selector,value)=>assert.equal((await page.locator(selector).innerText()).trim(),value);
async function englishTap(page) {
 assert.equal(await page.title(),'Tap & Spill · Sky’s Playground');
 const chinese=await page.evaluate(()=>{
  const found=[],walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) {
   const node=walker.currentNode;
   if(!node.parentElement.closest('script,style,noscript') && /[\p{Script=Han}]/u.test(node.textContent))found.push(node.textContent);
  }
  for(const el of document.querySelectorAll('[aria-label],[title],input')) {
   for(const value of [el.getAttribute('aria-label'),el.getAttribute('title'),el.value])
    if(value && /[\p{Script=Han}]/u.test(value))found.push(value);
  }
  return found;
 });
 assert.deepEqual(chinese,[],'Tap & Spill English UI must contain no Chinese text');
}
const order=page=>page.locator('.game-card').evaluateAll(cards=>cards.map(card=>card.dataset.game));
try {
 const {context,page}=await setup();
 await page.goto(base);
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');
 await text(page,'[data-language="zh-Hant"]','中');
 await text(page,'[data-language="en"]','EN');
 await page.getByRole('button',{name:'繁體中文',exact:true}).focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');
 assert.equal(await page.title(),'Your Playground.');
 await text(page,'h1','Your Playground.');
 assert.equal(await page.locator('[data-language="zh-Hant"]').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'收藏：方格快手',exact:true}).click();
 assert.match(await page.locator('#favourite-announcement').textContent(),/已收藏方格快手並移至最前/);
 const saved=await order(page);await page.reload();
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');assert.deepEqual(await order(page),saved);
 await page.getByRole('button',{name:'English',exact:true}).click();
 await text(page,'h1','Your Playground.');assert.equal(await page.title(),'Your Playground.');
 assert.deepEqual(await order(page),saved);
 assert.equal(await page.getByRole('button',{name:'Favourite: Grid Rush',exact:true}).getAttribute('aria-pressed'),'true');
 pass('keyboard switch, document language/title, translated favourites, reload and English restoration');
 for(const language of ['zh-Hant','en']) {
  const zh=language==='zh-Hant';
  await page.goto(base);await page.locator(`[data-language="${language}"]`).click();
  await text(page,'.game-card[data-game="tap-and-spill"] h2',zh?'水滿則溢':'Tap & Spill');
  for(const width of [320,375,640,768,1440]) {
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await page.locator('.game-card').count(),12);
   assert.ok(await page.locator('.playground-brand').evaluate(header=>{
    const rects=[...header.children].map(el=>el.getBoundingClientRect());
    const title=header.querySelector('h1');
    return rects.every(r=>Math.abs(r.top+r.height/2-(rects[0].top+rects[0].height/2))<1)
      && title.scrollWidth<=title.clientWidth;
   }),'logo, title and language controls must fit on one row');
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.game-card[data-game="grid-rush"] a').click();await page.waitForURL(url('grid-rush/'));await page.waitForLoadState();
  assert.equal(await page.locator('html').getAttribute('lang'),language);
  await text(page,'#start',zh?'開始遊戲':'Start Game');await page.locator('#start').click();
  for(let i=0;i<9;i++)await page.locator('.tile').nth(i).click();
  assert.match(await page.locator('#result-title').textContent(),zh?/紀錄|痛快/:/Best|rush/);
  assert.match(await page.locator('.tile').first().getAttribute('aria-label'),zh?/已清除/:/cleared/);
  const records=await page.evaluate(()=>localStorage.getItem('grid-rush.records.v1'));
  await page.locator('#install-app').click();
  await text(page,'#install-dialog-title',zh?'你的挑戰，一按即到。':'Your rush. One tap away.');
  await page.keyboard.press('Escape');await page.locator('.playground-home').click();await page.waitForURL(base);await page.waitForLoadState();
  assert.equal(await page.evaluate(()=>localStorage.getItem('grid-rush.records.v1')),records);
  pass(`${language}: responsive landing, navigation, complete Grid Rush round, labels and installation help`);

  await page.goto(url('grid-rush-in-order/'));
  for(const mode of ['number-range','lowercase','uppercase','mixed','alphanumeric','colors','numbers']) {
   await page.locator(`input[name="game-mode"][value="${mode}"]`).check();
   if(mode!=='colors')await page.locator('#sort-order').selectOption('descending');
   if(mode==='number-range')assert.match(await page.locator('#mode-note').textContent(),zh?/不重複整數/:/Unique random/);
   if(mode==='colors')assert.match(await page.locator('#mode-note').textContent(),zh?/顏色順序/:/colour key/);
  }
  await page.locator('#sort-order').selectOption('ascending');await page.locator('#start').click();
  await page.locator('.tile[data-value="2"]').click();await text(page,'#progress','0');
  assert.match(await page.locator('#next-description').textContent(),zh?/還未輪到/:/Not yet/);
  for(let i=1;i<=9;i++)await page.locator(`.tile[data-value="${i}"]`).click();
  assert.equal(await page.locator('#result').isVisible(),true);
  assert.match(await page.locator('#result-title').textContent(),zh?/紀錄|痛快/:/Best|rush/);
  pass(`${language}: all ordered modes, sort directions, wrong-input feedback and completed sequence`);

  await page.goto(url('line-up/'));
  await page.locator('#rows input').nth(0).fill('Start Game');await page.locator('#rows input').nth(1).fill('<b>玩家</b>');
  await page.locator('#start').click();
  for(let turn=0;turn<2;turn++) {
   await text(page,'#next-player',turn===0?'Start Game':'<b>玩家</b>');
   await page.locator('#ready').click();
   await page.locator('#edit-start').click();await page.keyboard.press('Home');
   await page.locator('#edit-end').click();await page.keyboard.press('End');
   await page.locator('#lock').click();
  }
  assert.equal(await page.locator('#result').isVisible(),true);
  const winners=await page.locator('#result-title').textContent();
  assert.ok(winners.includes('Start Game')&&winners.includes('<b>玩家</b>'));
  assert.equal(await page.locator('.result-person > strong').first().evaluate(el=>el.firstChild.textContent),'Start Game');
  assert.equal(await page.locator('.result-person b').count(),0);
  assert.match(await page.locator('.win-tag').first().textContent(),zh?/勝出/:/WINNER/);
  pass(`${language}: full Line Up multiplayer round preserves literal player names`);

  await page.goto(url('pikmin-fling/'));await page.locator('#start:not(:disabled)').waitFor();
  for(const timed of [false,true]) {
   if(timed){await page.locator('#change-mode').click();await page.locator('input[value="timed"]').check();await text(page,'#time-label',zh?'剩餘時間':'TIME LEFT');}
   await page.locator('#start').click();
   for(let i=0;i<35;i++)await page.locator('.pikmin').nth(i).press('Enter');
   await page.locator('#results').waitFor({state:'visible'});
   await text(page,'#result-title',zh?'花園已清空。':'Garden cleared.');
   assert.match(await page.locator('#result-note').textContent(),zh?/皮克鈍/:/Pikmax fed/);
   if(timed){assert.ok(Number(await page.locator('#final-time').textContent())>=45);await text(page,'#result-unit',zh?'分':'pts');}
  }
  pass(`${language}: complete normal and timed Pikmax rounds, dynamic prompts, scores and records`);

  await page.goto(url('tap-and-spill/'));if(!zh)await englishTap(page);
  await page.locator('#rows input').first().fill('Start Game');
  await page.locator('#start').click();
  assert.match(await page.locator('#whoName').textContent(),zh?/當前輪到：Start Game/:/Current turn: Start Game/);
  if(!zh)await englishTap(page);
  await page.locator('#go').click();if(!zh)await englishTap(page);const target=await page.locator('#touch').boundingBox();
  await page.mouse.move(target.x+target.width/2,target.y+target.height*.6);
  await page.mouse.down();await page.mouse.up();
  assert.match(await page.locator('#hint').textContent(),zh?/太短了/:/Too short!/);
  if(!zh)await englishTap(page);
  await page.mouse.down();
  await page.locator('#result').waitFor({state:'visible',timeout:20000});await page.mouse.up();
  await text(page,'#loser > span','Start Game');
  assert.match(await page.locator('#loser').textContent(),zh?/溢出了/:/spilled the glass/);
  assert.match(await page.locator('#roundInfo').textContent(),zh?/杯子容量/:/Glass capacity/);
  if(!zh)await englishTap(page);
  pass(`${language}: Tap & Spill handoff, pouring and overflow results preserve player names`);
 }
 await context.close();
 for(const mode of ['blocked','full','invalid']) {
  const fallback=await setup({},mode==='blocked'?()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});}:mode==='full'?()=>{Storage.prototype.setItem=()=>{throw new Error('full');};}:()=>{
   if(!sessionStorage.getItem('invalid-language-seeded')){
    localStorage.setItem('playground.language.v1','unsupported');
    sessionStorage.setItem('invalid-language-seeded','true');
   }
  });
  await fallback.page.goto(base);assert.equal(await fallback.page.locator('html').getAttribute('lang'),'zh-Hant');
  await fallback.page.getByRole('button',{name:'繁體中文',exact:true}).click();
  await fallback.page.locator('.game-card[data-game="grid-rush"] a').click();await fallback.page.waitForLoadState();await fallback.page.locator('#start').waitFor();
  assert.equal(await fallback.page.locator('html').getAttribute('lang'),'zh-Hant');
  await fallback.page.locator('.playground-home').click();await fallback.page.locator('.language-switch:not([hidden])').waitFor();assert.equal(await fallback.page.locator('html').getAttribute('lang'),'zh-Hant');
  await fallback.page.getByRole('button',{name:'English',exact:true}).click();await text(fallback.page,'h1','Your Playground.');
  await fallback.context.close();pass(`${mode} storage: defaults, switching and round-trip language persistence`);
 }
 const offline=await setup({serviceWorkers:'allow'});
 await offline.page.goto(base);await offline.page.getByRole('button',{name:'繁體中文',exact:true}).click();
 for(const path of routes.slice(0,4)) {
  await offline.page.goto(url(path));
  await offline.page.waitForFunction(()=>document.querySelector('#offline-status').textContent.includes('可以離線遊玩了'));
  await offline.page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 }
 await offline.context.setOffline(true);
 for(const path of routes.slice(0,4)) {
  await offline.page.goto(url(path));assert.equal(await offline.page.locator('html').getAttribute('lang'),'zh-Hant');
  assert.match(await offline.page.title(),/你的遊樂場/);
  await offline.page.locator('#start:not(:disabled)').waitFor();
 }
 await offline.context.close();pass('four installable games restore Chinese UI and language modules offline');
 assert.deepEqual(errors,[]);pass('no uncaught errors across language switches, gameplay, unavailable storage and offline launches');
 console.log(`\n${checks} language browser checks passed.`);
} finally {await browser.close();}
