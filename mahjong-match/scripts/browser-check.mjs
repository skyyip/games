import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.MAHJONG_MATCH_URL||'http://localhost:5173/mahjong-match/';
let checks=0;
const errors=[],pass=text=>{checks++;console.log(`PASS ${text}`);};
const click=(page,selector)=>page.locator(selector).evaluate(element=>element.click());
const pick=(page,tile)=>click(page,`.mahjong-tile[data-id="${tile.id}"]`);
async function setup({language='en',width=375,height=812,offline=false,seed=.3,motion='reduce'}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:width!==1440,hasTouch:width!==1440,reducedMotion:motion,serviceWorkers:offline?'allow':'block'});
  await context.addInitScript(({language,seed})=>{localStorage.setItem('playground.language.v1',language);window.__randomChoice=seed;Math.random=()=>window.__randomChoice;},{language,seed});
  await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.locator('#start').waitFor();await page.evaluate(()=>document.fonts.ready);
  return {context,page};
}
async function tiles(page,seed=.3){
  return page.evaluate(async seed=>{
    const {shuffleTiles,matchingTiles,tileOrder}=await import('./src/tiles.js');
    const all=shuffleTiles(()=>seed),target=all[0],rest=all.slice(1);
    return {target,rank:tileOrder(target),matches:rest.filter(t=>matchingTiles(t,target)),misses:rest.filter(t=>!matchingTiles(t,target))};
  },seed);
}
async function changeMode(page){
  await click(page,'#change');
  await page.waitForFunction(()=>{const mode=document.querySelector('#mode'),r=mode.closest('.select-row').getBoundingClientRect();return document.activeElement===mode&&r.top>=0&&r.bottom<=innerHeight;});
  assert.equal(await page.locator('#table').getAttribute('data-state'),'setup');
}
try{
  await mkdir('/tmp/mahjong-match-qa',{recursive:true});
  for(const language of ['zh-Hant','en']){
    const {context,page}=await setup({language});await page.locator('#name-0').fill('Jade & Cloud');
    const data=await tiles(page),player2=language==='en'?'Player 2':'玩家 2';
    for(const firstMatches of [false,true]){
      await click(page,'#start');assert.equal(await page.locator('#ready').count(),0);
      const first=firstMatches?data.matches[0]:data.misses[0],second=firstMatches?data.misses[0]:data.matches[0];
      await page.locator(`.mahjong-tile[data-id="${first.id}"]`).tap();
      assert.equal(await page.locator('#table').getAttribute('data-state'),'choosing');
      assert.equal(await page.locator('#results').isVisible(),false);
      assert.equal(await page.locator('#active-player').textContent(),player2);
      await pick(page,first);assert.equal(await page.locator('.opened').count(),1);
      await pick(page,second);assert.equal(await page.locator('#winner-name').textContent(),firstMatches?'Jade & Cloud':player2);
      assert.equal(await page.locator('#result-first-name').textContent(),'Jade & Cloud');
      assert.equal(await page.locator('#result-last-name').textContent(),player2);
      assert.equal(await page.locator('#result-first-wrap').isVisible(),true);
      assert.equal(await page.locator('#result-compare').isVisible(),false);
      await page.locator('.champion-icon').waitFor();
      assert.equal(await page.locator('#change').textContent(),language==='en'?'Change game mode':'更改遊戲模式');
      await page.screenshot({path:`/tmp/mahjong-match-qa/${language}-player-${firstMatches?1:2}-wins.png`,fullPage:true});
      await changeMode(page);
    }
    pass(`${language}: wait for both reveals, either sole matcher wins, both result tiles, renamed mode button and scroll/focus`);
    await click(page,'#start');
    await pick(page,data.misses[0]);await pick(page,data.misses[1]);
    assert.equal(await page.locator('#table').getAttribute('data-state'),'choosing');
    assert.equal(await page.locator('#active-player').textContent(),'Jade & Cloud');
    assert.match(await page.locator('#pair-label').textContent(),/2/);
    await pick(page,data.matches[0]);await pick(page,data.matches[1]);
    assert.equal(await page.locator('#table').getAttribute('data-state'),'choosing');
    assert.match(await page.locator('#pair-label').textContent(),/3/);
    assert.equal(await page.locator('#active-player').textContent(),'Jade & Cloud');
    await pick(page,data.misses[2]);await pick(page,data.matches[2]);
    assert.equal(await page.locator('#winner-name').textContent(),player2);
    assert.equal(await page.locator('.opened').count(),6);
    await click(page,'#again');assert.equal(await page.locator('.opened').count(),0);assert.match(await page.locator('#pair-label').textContent(),/1/);
    await click(page,'#end-round');
    pass(`${language}: two misses and two matches start fresh pairs with Player 1; old tiles stay used and replay resets`);
    await page.locator('#mode').selectOption('sudden');await click(page,'#start');
    await pick(page,data.misses[0]);await pick(page,data.matches[0]);
    assert.equal(await page.locator('#winner-name').textContent(),'Jade & Cloud');
    assert.equal(await page.locator('#result-first-wrap').isVisible(),false);
    assert.equal(await page.locator('#result-compare').textContent(),'=');
    await changeMode(page);
    if(language==='zh-Hant'){
      const leak=await page.evaluate(()=>{const out=[],walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement.closest('script,style,[translate="no"],.site-copyright')&&/[a-z]{3,}/i.test(n.textContent))out.push(n.textContent.trim());}return out;});
      assert.deepEqual(leak,[]);
    }
    await context.close();pass(`${language}: sudden-death loss logic, bilingual instructions and result labels`);
  }
  for(const [width,height] of [[320,568],[375,812],[430,932],[568,320],[812,375],[768,1024],[1440,1050]]){
    const {context,page}=await setup({width,height,language:'zh-Hant'});await click(page,'#start');await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const sizes=await page.locator('.mahjong-tile').evaluateAll(elements=>elements.map(e=>e.getBoundingClientRect()));assert.ok(sizes.every(r=>r.width>=43.9&&r.height>=59.9),'every tile has a finger-sized target');
    assert.equal(await page.locator('.mahjong-tile').count(),143);
    await context.close();pass(`${width}×${height}: large tiles remain reachable in the scrolling table`);
  }
  {
    const {context,page}=await setup();await page.locator('#mode').selectOption('sudden');
    for(const seed of [.3,.8,.3]){
      await page.evaluate(seed=>window.__randomChoice=seed,seed);
      await click(page,await page.locator('#results').isVisible()?'#again':'#start');
      const starter=seed<.5?1:2,data=await tiles(page,seed);
      assert.equal(await page.locator('#active-player').textContent(),`Player ${starter}`);
      assert.match(await page.locator('#pair-label').textContent(),new RegExp(`${starter} → ${3-starter}`));
      await pick(page,data.matches[0]);assert.equal(await page.locator('#winner-name').textContent(),`Player ${3-starter}`);
    }
    await context.close();pass('sudden-death starts/replays redraw the order; either starter can lose on the first tile');
  }
  {
    const {context,page}=await setup({seed:.19,language:'zh-Hant'});await page.locator('#mode').selectOption('sudden');await click(page,'#start');
    const data=await tiles(page,.19);assert.equal(data.target.group,5);assert.equal(await page.locator('#target-name').textContent(),'春');
    await pick(page,data.matches.find(t=>t.kind!==data.target.kind));assert.equal(await page.locator('#winner-name').textContent(),'玩家 2');
    await context.close();pass('single-copy Spring target still matches other rank-one faces');
  }
  {
    const {context,page}=await setup({offline:true});await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>{}));await context.setOffline(true);await page.reload();await click(page,'#start');
    const data=await tiles(page);await pick(page,data.matches[0]);assert.equal(await page.locator('#results').isVisible(),false);await pick(page,data.misses[0]);assert.equal(await page.locator('#winner-name').textContent(),'Player 1');
    await context.close();pass('offline paired comparison waits for Player 2 and awards Player 1 correctly');
  }
  {
    const {context,page}=await setup({motion:'no-preference'});await page.locator('#name-0').fill('<Jade & Cloud>');await click(page,'#start');
    const data=await tiles(page);await pick(page,data.matches[0]);await pick(page,data.misses[0]);await page.locator('.victory-confetti').waitFor();
    assert.equal(await page.locator('#winner-name').textContent(),'<Jade & Cloud>');assert.equal(await page.locator('.victory-confetti i').count(),36);
    await page.screenshot({path:'/tmp/mahjong-match-qa/paired-celebration.png'});
    await changeMode(page);assert.equal(await page.locator('.victory-confetti').count(),0);
    await context.close();pass('paired winner celebration preserves literal names; normal-motion mode change scrolls and cleans up');
  }
  {
    const {context,page}=await setup({motion:'no-preference'});await click(page,'#start');const data=await tiles(page);
    const sequence=[...data.misses.slice(0,data.misses.length-data.misses.length%2),...data.matches.slice(0,data.matches.length-data.matches.length%2)].map(t=>t.id);
    await page.evaluate(ids=>{for(const id of ids)document.querySelector(`.mahjong-tile[data-id="${id}"]`).click();},sequence);
    await page.locator('#results').waitFor();assert.equal(await page.locator('#results').getAttribute('data-victory-outcome'),'draw');
    assert.equal(await page.locator('.opened').count(),142);assert.equal(await page.locator('[data-winner-name]').isVisible(),false);
    await page.waitForTimeout(450);assert.equal(await page.locator('.victory-confetti').count(),0);assert.equal(await page.locator('.champion-icon').count(),0);
    await context.close();pass('exhausted tied table ends in a draw without a false winner or celebration');
  }
  assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`${checks} Mahjong Match browser checks passed.`);
}finally{await browser.close();}
