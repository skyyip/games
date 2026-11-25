import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];
async function open(width,height=844,{fixture=false}={}){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.addInitScript(()=>{Math.random=()=>.999999});
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 if(fixture)await context.route('**/src/app.js',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('../src/app.js',import.meta.url),'utf8')+`
 globalThis.rewardQA={async settle(value,group){faction=group;hp=value;runSettled=false;runAnswers=[];await finish()},repeat:()=>finish()};`}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(base);return {context,page};
}
async function fits(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
async function mobile(width,height){
 const {context,page}=await open(width,height);
 const colors=await page.locator('[data-faction="duo"],[data-faction="cat"]').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));assert.notEqual(colors[0],colors[1]);checks++;
 await page.locator('[data-faction="duo"]').click();await page.locator('#startBtn').click();
 const bg=await page.locator('#modal').evaluate(n=>getComputedStyle(n).backgroundColor);assert.equal(bg,'rgb(234, 248, 243)');checks++;
 for(let i=0;i<5;i++){
  assert.equal(await page.locator('.duo-step-count').textContent(),`${i+1} / 5`);
  const targets=await page.locator('.duo-setup-answers button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert(targets.every(h=>h>=48));checks+=2;
  await page.locator('.duo-setup-answers button').first().click();
 }
 await page.locator('#duoBeginTest span').click();await page.locator('.duo-mode').waitFor({state:'visible'});
 assert.equal(await page.locator('#game').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(234, 248, 243)');assert.equal(await page.locator('#game .status-row').isVisible(),false);checks+=2;
 // Exiting a duo round must restore HP, the 12-question progress and normal colors.
 await page.locator('#quitBtn').click();await page.locator('#confirmQuit').click();await page.locator('[data-faction="women"]').click();await page.locator('#startBtn').click();
 assert.equal(await page.locator('#game').evaluate(n=>n.classList.contains('duo-mode')),false);assert(await page.locator('#game .status-row').isVisible());assert.equal(await page.locator('#progressDots').getAttribute('aria-valuemax'),'12');checks+=3;
 if(width<=600){
  assert.equal(await page.locator('#answers').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length),1);
  const option=await page.locator('#answers button').first().evaluate(n=>({font:parseFloat(getComputedStyle(n).fontSize),height:n.getBoundingClientRect().height,letter:n.querySelector('.answer-letter').getBoundingClientRect().top,copy:n.querySelector('.answer-copy').getBoundingClientRect().top}));
  assert(option.font>=15&&option.height>=64&&Math.abs(option.letter-option.copy)<2);checks+=2;
  await page.locator('#answers button').last().scrollIntoViewIfNeeded();
  const hud=await page.locator('.game-hud').boundingBox(),header=await page.locator('.topbar').boundingBox();assert(hud.y>=header.y+header.height-1&&hud.y+hud.height<height);checks++;
 }
 await fits(page);await page.locator('#answers button').first().click();if(await page.locator('#sendMessageBtn').isVisible())await page.locator('#sendMessageBtn').click();await page.locator('.polaroid-back').waitFor({state:'visible'});
 if(width<=600){
  const next=await page.locator('#nextQuestionBtn').boundingBox();assert(next.y>=0&&next.y+next.height<=height&&next.height>=48);checks++;
  assert(await page.locator('#nextQuestionBtn').evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}));checks++;
 }
 await fits(page);await page.screenshot({path:`/tmp/yrgt-mobile-review-${width}x${height}.png`,fullPage:true,animations:'disabled'});
 await page.locator('#nextQuestionBtn').click();assert.equal(await page.locator('#answerReview').isVisible(),false);checks++;
 await context.close();
}
try{
 await Promise.all([[320,667],[375,667],[390,844],[430,932],[844,390]].map(([w,h])=>mobile(w,h)));
 if(process.env.YRGT_SOURCE_FIXTURES==='1'){
  const {context,page}=await open(390,844,{fixture:true});
  await page.evaluate(()=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:17,cards:['w_1'],runs:0,bestHp:0})));
  let balance=17,runs=0;
  for(const faction of ['women','men','dog','cat'])for(const hp of [0,1,29,30,79,80,100]){
   await page.evaluate(([hp,f])=>rewardQA.settle(hp,f),[hp,faction]);balance+=hp>0?100+hp*2:10;runs++;
   const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));
   assert.equal(save.coins,balance);assert.equal(save.runs,runs);assert.deepEqual(save.cards,['w_1']);
   assert.equal(await page.locator('#resultCoins').textContent(),`${hp>0?100+hp*2:10} SC`);
   assert.equal(await page.locator('#resultCertification').isVisible(),hp>=80);
   if(hp===0)assert.equal(await page.locator('#resultTitle').textContent(),'當場社會性死亡');
   if(faction==='cat'&&[0,29,100].includes(hp)){await page.screenshot({path:`/tmp/yrgt-reward-${hp}.png`,fullPage:true,animations:'disabled'});await writeFile(`/tmp/yrgt-reward-poster-${hp}.png`,Buffer.from((await page.locator('#posterPreview').evaluate(c=>c.toDataURL())).split(',')[1],'base64'))}
   await page.evaluate(()=>rewardQA.repeat());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).coins),balance);checks+=6;
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,mobileViewports:5,sourceRewardBoundaries:process.env.YRGT_SOURCE_FIXTURES==='1',pageErrors:errors.length}));
}finally{await browser.close()}
