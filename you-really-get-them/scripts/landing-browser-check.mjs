import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_LANDING_URL||'http://127.0.0.1:4180/';
const browser=await chromium.launch({headless:true});const errors=[];let checks=0;
try{
 for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(installBrowserFirebaseFixture);
  await context.addInitScript(()=>localStorage.setItem('playground.language.v1',localStorage.getItem('playground.language.v1')||'zh-Hant'));
  await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
  const card=page.locator('[data-game="you-really-get-them"]');await page.waitForFunction(()=>!document.querySelector('.language-switch').hidden);
  await card.locator('h2').filter({hasText:'你真的懂他／她／牠嗎？'}).waitFor();
  assert((await card.locator('.tags').textContent()).includes('關係求生問答'));
  assert.equal(await card.locator('.body>p').textContent(),'讀懂氣氛、摸透身邊人與毛孩，用十二題考驗你的求生欲。');
  assert((await card.locator('.favourite-button').getAttribute('aria-label')).includes('你真的懂'));checks+=3;
  await page.locator('[data-language="en"]').click();assert.equal(await card.locator('h2').textContent(),'Do You Really Get Them?');assert((await card.locator('.body>p').textContent()).includes('twelve'));checks+=2;
  await page.reload();await card.locator('h2').filter({hasText:'Do You Really Get Them?'}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'en');checks++;
  await page.locator('[data-language="zh-Hant"]').click();await card.locator('h2').filter({hasText:'你真的懂'}).waitFor();assert((await card.locator('.body>p').textContent()).includes('十二題'));checks++;
  await card.locator('a.card').click();await page.locator('#home h1').waitFor();assert((await page.title()).startsWith('你真的懂'));assert((await page.locator('meta[name=description]').getAttribute('content')).includes('十二題'));assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'),'zh_TW');checks+=3;assert((await page.locator('#home h1').textContent()).includes('你真的懂'));assert((await page.locator('.hero-art').textContent()).includes('祝你生還'));assert.equal(await page.locator('.site-footer').textContent(),'© 關係求生研究所保持冷靜。盡量啦。');checks+=3;
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
  if(width===390)await page.screenshot({path:'/tmp/yrgt-night-home-390.png',fullPage:true,animations:'disabled'});
  await page.locator('#companionPicker').click();assert.equal(await page.locator('.collect-card').count(),180);checks++;
  await page.goBack();await card.locator('h2').filter({hasText:'你真的懂'}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'zh-Hant');checks++;
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:3,chineseCard:true,languageRoundTrip:true,chineseGameLanding:true,pageErrors:errors.length}));
}finally{await browser.close()}
