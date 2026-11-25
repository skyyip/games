import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const factions=['women','men','dog','cat','duo'];
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
try{
 for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(installBrowserFirebaseFixture);
  await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');
  await page.locator('[data-faction="cat"]').click();
  await page.evaluate(()=>{__yrgtFirebase.leaderboardRows=[{displayName:'<b>街坊讀心師</b>',bestHp:90,bestCorrect:10}];globalThis.testLeaderboardEvents=[];document.querySelector('#leaderboardBtn').addEventListener('click',e=>testLeaderboardEvents.push(e.constructor.name))});
  await page.locator('#actionMenu').evaluate(n=>n.open=true);
  if(width<600)await page.locator('#leaderboardBtn').tap();else await page.locator('#leaderboardBtn').click();
  await page.locator('.leaderboard-row').waitFor();
  assert.deepEqual(await page.evaluate(()=>testLeaderboardEvents),['PointerEvent']);
  assert.equal(await page.locator('.leaderboard-faction-tab.active').getAttribute('data-leaderboard-faction'),'cat');
  assert.equal(await page.locator('.leader-name').textContent(),'<b>街坊讀心師</b>');assert.equal(await page.locator('.leader-name b').count(),0);checks+=4;
  for(const id of factions){
   await page.locator(`[data-leaderboard-faction="${id}"]`).click();
   await page.waitForFunction(id=>document.querySelector(`[data-leaderboard-faction="${id}"]`).getAttribute('aria-pressed')==='true',id);
   assert.equal((await page.evaluate(()=>__yrgtFirebase.queries)).at(-1).value,id);
   assert(!(await page.locator('#leaderboardContent').textContent()).includes('暫時無法讀取'));checks+=2;
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`/tmp/yrgt-fixed-leaderboard-${width}.png`,fullPage:true,animations:'disabled'});checks++;
  await page.locator('#modalClose').click();await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#leaderboardBtn').focus();await page.keyboard.press('Enter');await page.locator('.leaderboard-row').waitFor();
  assert.equal((await page.evaluate(()=>__yrgtFirebase.queries)).at(-1).value,'cat');checks++;
  await page.evaluate(()=>{__yrgtFirebase.leaderboardRows=[]});await page.locator('[data-leaderboard-faction="women"]').click();await page.waitForFunction(()=>document.querySelector('#leaderboardContent').textContent.includes('暫時沒有上榜玩家'));checks++;
  await page.evaluate(()=>{__yrgtFirebase.queryError='unavailable'});await page.locator('[data-leaderboard-faction="men"]').click();await page.waitForFunction(()=>document.querySelector('#leaderboardContent').textContent.includes('排行榜暫時無法讀取：unavailable'));checks++;
  await page.evaluate(()=>{__yrgtFirebase.queryError=null;__yrgtFirebase.leaderboardRows=[{displayName:'恢復連線的街坊',bestHp:100,bestCorrect:12}]});await page.locator('[data-leaderboard-faction="men"]').click();await page.locator('.leaderboard-row').waitFor();assert.equal(await page.locator('.leader-name').textContent(),'恢復連線的街坊');checks++;
  assert((await page.evaluate(()=>__yrgtFirebase.queries)).every(q=>typeof q.value==='string'&&factions.includes(q.value)));checks++;
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:3,pointerEvents:true,keyboard:true,factions:5,pageErrors:errors.length}));
}finally{await browser.close()}
