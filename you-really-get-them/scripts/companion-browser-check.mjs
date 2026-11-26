import {findPlayableQuestion,playableScenes} from '../tests/fixtures/round-scenes.mjs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
import {CARDS} from '../src/gacha.js';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];
const allQuestions=playableScenes();
async function open(id,width=390,{fixture=false,owned=[id],query='',reducedMotion='no-preference'}={}){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.addInitScript(({id,owned})=>{if(!localStorage.getItem('yrgt-save-v1:guest'))localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:123,cards:owned,equippedCard:id,runs:4,bestHp:0}))},{id,owned});
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 if(fixture)await context.route('**/src/app.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`\nglobalThis.companionQA={settle:async(value)=>{hp=value;await finish()},repeat:finish,challenge:()=>{challengeId='fixture';challengeRunPending=true},next:()=>{index++;renderQuestion()},question:()=>{questions=[{...BANK.women[3],kind:'classic',legacyIndex:3}];index=0;renderQuestion()},state:()=>({used:companionRun?.used,until:companionRun?.pauseUntil,index,hp})};`})});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-25T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-25T00:00:01Z'));
 await page.goto(base+query);await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');return {page,context};
}
async function start(page){await page.locator('#startBtn').click()}
async function answerBest(page){
 const text=await page.locator('#questionText').textContent(),q=allQuestions.find(q=>q.text===text);assert(q,text);
 const choice=q.correct??q.profiles.reduce((best,p,i,all)=>p.reduce((s,v)=>s+v,0)>all[best].reduce((s,v)=>s+v,0)?i:best,0);
 await page.locator('#answers button').nth(choice).evaluate(n=>{n.style.transform='none';n.click()});if(q.message)await page.locator('#sendMessageBtn').click();await page.locator('#answerReview').waitFor({state:'visible'});
}
async function quit(page){await page.locator('#quitBtn').click();await page.locator('#confirmQuit').click()}
async function stored(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')))}
async function fits(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
try{
 for(const width of [320,390,1280]){
  const {page,context}=await open('w_2',width);assert.equal(await page.locator('#equippedName').textContent(),'名偵探女友');assert.equal(await page.locator('#home #companionName').textContent(),'重讀案情');assert((await page.locator('#home #companionEffect').textContent()).includes('每局一次'));assert.equal(await page.locator('#companionPicker').getAttribute('href'),'#collection');await fits(page);await page.screenshot({path:`/tmp/yrgt-companion-home-${width}.png`,fullPage:true,animations:'disabled'});await start(page);assert.equal(await page.locator('#game #companionPortrait,#game #companionName,#game #companionEffect').count(),0);checks+=4;
  const original=await page.locator('#questionText').textContent(),answers=await page.locator('#answers button').allTextContents(),hp=await page.locator('#hpValue').textContent();
  await page.locator('#companionUse').click();const clue=await page.locator('#questionText mark').textContent();assert(original.includes(clue));assert.equal(await page.locator('#questionText').textContent(),original);assert.deepEqual(await page.locator('#answers button').allTextContents(),answers);assert.equal(await page.locator('#hpValue').textContent(),hp);
  assert.equal(await page.locator('#companionLine').textContent(),'證據一直喺度，你個腦剛才落咗樓買嘢。');assert(await page.locator('#companionUse').isDisabled());checks+=7;await fits(page);
  await page.screenshot({path:`/tmp/yrgt-companion-clue-${width}.png`,fullPage:true,animations:'disabled'});
  await answerBest(page);await page.locator('#companionUse').dispatchEvent('click');await page.locator('#nextQuestionBtn').click();assert.equal(await page.locator('#questionText mark').count(),0);assert(await page.locator('#companionUse').isDisabled());checks+=2;
  await quit(page);assert.equal((await stored(page)).coins,123);await start(page);assert(await page.locator('#companionUse').isEnabled());checks+=2;
  await quit(page);await page.locator('#companionPicker').click();await page.locator('[data-card="w_2"] .card-open').click();assert.equal(await page.locator('[data-equip="w_2"]').getAttribute('aria-pressed'),'true');await page.locator('#modalClose').click();await page.locator('[data-card="c_3"] .card-open').click();assert.equal(await page.locator('[data-equip="c_3"]').count(),0);await page.locator('#modalClose').click();checks+=2;
  await page.locator('[data-card="m_1"] .card-open').click();await page.locator('[data-equip="m_1"]').click();assert.equal((await stored(page)).equippedCard,'m_1');await page.locator('#backBtn').click();assert.equal(await page.locator('#equippedName').textContent(),'鋼鐵直男');checks+=2;await fits(page);
  // Equipment persists after a genuine refresh.
  await page.reload();await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');
  assert.equal(await page.locator('#equippedName').textContent(),'鋼鐵直男');checks++;
  await page.locator('#companionPicker').click();await page.locator('[data-card="m_1"] .card-open').click();await page.locator('[data-equip="m_1"]').click();assert.equal((await stored(page)).equippedCard,null);await page.locator('#backBtn').click();await start(page);assert.equal(await page.locator('#companionBar').isVisible(),false);checks+=2;
  await context.close();
 }
 {
  const {page,context}=await open('m_2');await start(page);await page.clock.runFor(1000);const before=await page.locator('#timer').textContent();await page.locator('#companionUse').click();
  assert(await page.locator('#companionBar').evaluate(n=>n.classList.contains('is-paused')));await page.clock.runFor(4900);assert.equal(await page.locator('#timer').textContent(),before);await page.clock.runFor(1100);assert(Number(await page.locator('#timer').textContent())<=Number(before)-.9);assert.equal(await page.locator('#companionBar').evaluate(n=>n.classList.contains('is-paused')),false);checks+=4;
  await answerBest(page);await page.locator('#nextQuestionBtn').click();assert.equal(await page.locator('#timer').textContent(),'30.0');assert(await page.locator('#companionUse').isDisabled());checks+=2;await context.close();
 }
 // Real 12-question survival, including all mixed types, against source and upload builds.
 {
  const {page,context}=await open('w_22');await start(page);assert.equal(await page.locator('#companionUse').isVisible(),false);assert.equal(await page.locator('#runCoins').textContent(),'預計 320 SC');checks+=2;
  for(let i=0;i<12;i++){await answerBest(page);await page.locator('#nextQuestionBtn').click()}
  await page.locator('#result').waitFor({state:'visible'});const hp=Number(await page.locator('#resultHp').textContent()),reward=120+2*hp;
  assert(hp>0);assert.equal(await page.locator('#resultCoins').textContent(),`${reward} SC`);assert.equal((await stored(page)).coins,123+reward);assert.equal((await stored(page)).runs,5);assert((await page.locator('#rewardBreakdown').textContent()).includes('收工津貼'));assert(!(await page.locator('#rewardBreakdown').textContent()).includes('本局不計入公開排行榜'));checks+=6;assert(await page.locator('.companion-payday').evaluate(n=>{const r=n.getBoundingClientRect();return [...n.children].every(c=>{const b=c.getBoundingClientRect();return b.width>20&&b.left>=r.left-1&&b.right<=r.right+1})}));checks++;await fits(page);
  await page.screenshot({path:'/tmp/yrgt-companion-stipend.png',fullPage:true,animations:'disabled'});await context.close();
 }
 {
  const {page,context}=await open('w_2',390,{owned:[]});assert.equal(await page.locator('#equippedName').textContent(),'獨自求生');await start(page);assert.equal(await page.locator('#companionBar').isVisible(),false);checks+=2;await context.close();
 }
 {
  const {page,context}=await open('w_2');await page.locator('[data-faction="duo"]').click();await start(page);for(let i=0;i<5;i++)await page.locator('[data-duo-expected="0"]').click();await page.locator('#duoBeginTest').click();assert.equal(await page.locator('#companionBar').isVisible(),false);checks++;await context.close();
 }
 {
  const {page,context}=await open('w_2');await page.locator('#companionPicker').click();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('blocked')}});await page.locator('[data-card="m_1"] .card-open').click();await page.locator('[data-equip="m_1"]').click();assert.equal((await stored(page)).equippedCard,'w_2');assert((await page.locator('#companionSaveStatus').textContent()).includes('未能儲存'));checks+=2;await context.close();
 }
 if(process.env.YRGT_SOURCE_FIXTURES==='1'){
  {
   const {page,context}=await open('w_2',390,{fixture:true});await start(page);await page.locator('#companionUse').click();await page.evaluate(()=>companionQA.settle(100));assert.equal(await page.locator('#resultCoins').textContent(),'300 SC');assert((await page.locator('.companion-result').textContent()).includes('本局不計入公開排行榜'));checks+=2;await context.close();
  }

  {
   const {page,context}=await open('m_2',390,{fixture:true});await start(page);await page.evaluate(()=>companionQA.question());await page.locator('#companionUse').click();await page.clock.runFor(3100);assert.equal(await page.locator('#timer').textContent(),'30.0');assert.equal(await page.locator('#hpValue').textContent(),'100');assert.equal(await page.locator('#tapBtn,#holdBtn').count(),0);checks+=3;await context.close();
  }

  for(const hp of [0,1,29,30,80,100]){
   const {page,context}=await open('w_22',390,{fixture:true});await start(page);await page.evaluate(hp=>companionQA.settle(hp),hp);const total=hp>0?120+2*hp:10;
   assert.equal(await page.locator('#resultCoins').textContent(),`${total} SC`);assert.equal((await stored(page)).coins,123+total);await page.evaluate(()=>companionQA.repeat());assert.equal((await stored(page)).coins,123+total);checks+=3;await context.close();
  }
  {
   const {page,context}=await open('m_2',390,{fixture:true});await start(page);await page.locator('#companionUse').click();await answerBest(page);assert.equal(await page.evaluate(()=>companionQA.state().until),0);checks++;await context.close();
  }
  {
   const {page,context}=await open('w_22',390,{fixture:true});await page.evaluate(()=>companionQA.challenge());await page.evaluate(()=>__yrgtFirebase.emit({uid:'fixture',isAnonymous:true}));await page.waitForFunction(()=>document.querySelector('#authBtn').textContent.includes('訪客'));await page.locator('#startBtn').evaluate(n=>n.click());assert.equal(await page.locator('#companionBar').isVisible(),false);checks++;await context.close();
  }
  {
   const {page,context}=await open('w_22',390,{fixture:true});await start(page);await page.evaluate(()=>__yrgtFirebase.emit({uid:'another',isAnonymous:false}));await page.evaluate(()=>document.querySelector('#modal').close());await page.evaluate(()=>companionQA.settle(100));assert.equal(await page.locator('#home').isVisible(),true);assert.equal(await page.locator('#game').isVisible(),false);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).coins),123);checks+=3;await context.close();
  }
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,cards:CARDS.length,sourceFixtures:process.env.YRGT_SOURCE_FIXTURES==='1',pageErrors:errors.length}));
}finally{await browser.close()}
