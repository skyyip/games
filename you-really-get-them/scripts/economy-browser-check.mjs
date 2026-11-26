import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
import {findPlayableQuestion} from '../tests/fixtures/round-scenes.mjs';
import {CARDS} from '../src/gacha.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
const owner='wallet-player',walletPath=`users/${owner}/wallet/main`;
const initialDocs={['users/'+owner]:{displayName:'測試街坊',playerName:'測試街坊',photoURL:'',favoriteCards:['w_1','m_1','w_2','m_2','w_22'],updatedAt:123},'users/other-player':{displayName:'街坊乙',playerName:'街坊乙',photoURL:'',favoriteCards:['w_1','m_1'],updatedAt:123}};
async function open(width=390,{fixture=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture,{initialUser:{uid:owner,displayName:'測試街坊',isAnonymous:false},legacySave:{coins:777,cards:['w_2'],equippedCard:'w_2',runs:3,bestHp:80},documents:initialDocs});
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 if(fixture)await context.route('**/src/app.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`
 globalThis.economyQA={complete({value=100,completed=12,hintCount=0,used=false,timeouts=0}={}){hp=value;hints=2-hintCount;if(companionRun)companionRun.used=used;correct=completed-timeouts;classicCorrect=5;airScores=[28,28,28,28,28];runAnswers=Array.from({length:completed},(_,i)=>answerRecord(BANK[faction][i],{round:i+1,choice:i<timeouts?null:BANK[faction][i].correct,success:i>=timeouts}));return finish()},repeat:finish,context:()=>runContext};`})});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-25T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-25T00:00:01Z'));await page.goto(base);await synced(page);return {context,page};
}
async function synced(page){await page.waitForFunction(()=>{const uid=localStorage.getItem('yrgt-last-account-v2'),data=JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)||'null');return data?.walletRevision>=0&&data.coins===__yrgtFirebase.documents['users/'+uid+'/wallet/main']?.coins})}
async function state(page){return page.evaluate(uid=>JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)),owner)}
async function backend(page){return page.evaluate(path=>__yrgtFirebase.documents[path],walletPath)}
async function paid(page){await page.waitForFunction(()=>{const uid=localStorage.getItem('yrgt-last-account-v2'),data=JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)||'null');return data?.pendingRewards?.length===0&&Object.keys(__yrgtFirebase.documents).some(key=>key.startsWith('users/'+uid+'/walletOps/run_'))});await synced(page)}
async function fits(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
async function answer(page,q){
 for(const id of ['treatBtn','cupBtn'])if(await page.locator('#'+id).isVisible())await page.locator('#'+id).click();
 const choice=q.correct??q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((b,v,i,a)=>v>a[b]?i:b,0);
 await page.locator('#answers button').nth(choice).evaluate(button=>button.click());if(q.message)await page.locator('#sendMessageBtn').click();await page.locator('#nextQuestionBtn').click();
}
try{
 // Public flow: zero new account, real full run, bonds without stamps, then cloud-funded gacha.
 for(const width of [320,390,1280]){
  const {context,page}=await open(width);assert.equal(await page.locator('#collectionCoins').textContent(),'0 SC');assert.equal((await backend(page)).coins,0);assert.equal(await page.evaluate(uid=>JSON.parse(localStorage.getItem('yrgt-save-v1:'+uid)).coins,owner),777);checks+=3;
  await page.locator('#startBtn').click();
  for(let i=0;i<12;i++){const q=findPlayableQuestion(await page.locator('#questionText').textContent(),'women');assert(q);await answer(page,q)}
  await page.locator('#result').waitFor({state:'visible'});await paid(page);assert.equal((await backend(page)).coins,300);assert.equal((await backend(page)).bonds.w_2,1);assert.deepEqual((await backend(page)).contracts,[]);assert(!(await page.locator('#progressResult').textContent()).includes('印章'));assert.equal(await page.locator('#resultCoins').textContent(),'300 SC');checks+=5;await fits(page);
  await page.screenshot({path:`/tmp/yrgt-contract-result-${width}.png`,fullPage:true,animations:'disabled'});
  await page.reload();await synced(page);assert.equal(await page.locator('#collectionCoins').textContent(),'300 SC');assert.equal((await backend(page)).bonds.w_2,1);checks+=2;
  await page.locator('#companionPicker').click();assert.equal(await page.locator('#legacyBalance,.companion-selection').count(),0);await page.locator('[data-card="w_2"] .card-open').click();assert((await page.locator('.detail-bond').textContent()).includes('1 / 3'));await page.locator('#modalClose').click();checks+=2;
  const card=CARDS.find(c=>c.id==='c_3'),pool=CARDS.filter(c=>c.rarity===card.rarity),pick=(pool.indexOf(card)+.5)/pool.length;
  await page.evaluate(values=>{Math.random=()=>values.shift()??.5},[.99,pick]);await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);await page.locator('#gachaDraw').click();await page.waitForFunction(path=>__yrgtFirebase.documents[path].coins===200,walletPath);await page.clock.runFor(10);await page.locator('.gacha-result').waitFor({state:'visible'});assert((await state(page)).cards.includes('c_3'));assert.equal((await state(page)).coins,200);assert.equal(await page.evaluate(uid=>JSON.parse(localStorage.getItem('yrgt-save-v1:'+uid)).coins,owner),777);checks+=3;await fits(page);await context.close();
 }
 if(process.env.YRGT_SOURCE_FIXTURES==='1'){
  // Offline reward survives refresh, then the same receipt is credited once on reconnect.
  {
   const {context,page}=await open(390,{fixture:true});await page.locator('#startBtn').click();
   await page.evaluate(()=>{__yrgtFirebase.transactionError='unavailable';localStorage.setItem('yrgt-fixture-transaction-error','unavailable');window.dispatchEvent(new Event('offline'))});
   await page.evaluate(()=>economyQA.complete());await page.locator('#result').waitFor({state:'visible'});assert.equal((await backend(page)).coins,0);assert.equal((await state(page)).pendingRewards.length,1);assert.equal(await page.locator('#rewardSyncStatus').count(),0);const id=(await state(page)).pendingRewards[0].id;checks+=3;
   await page.reload();await page.waitForFunction(()=>document.querySelector('#authBtn').textContent.startsWith('登出'));assert.equal((await state(page)).pendingRewards.length,1);assert.equal((await backend(page)).coins,0);await page.locator('#companionPicker').click();assert(await page.locator('#gachaDraw').isDisabled());checks+=3;
   await page.evaluate(()=>{__yrgtFirebase.transactionError=null;localStorage.removeItem('yrgt-fixture-transaction-error');window.dispatchEvent(new Event('online'))});await synced(page);await page.waitForFunction(uid=>JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)).pendingRewards.length===0,owner);
   assert.equal((await backend(page)).coins,300);assert.equal((await backend(page)).bonds.w_2,1);assert.equal(await page.evaluate(id=>Object.keys(__yrgtFirebase.documents).filter(key=>key.endsWith('/walletOps/'+id)).length,id),1);checks+=3;
   await page.evaluate(()=>window.dispatchEvent(new Event('online')));await synced(page);assert.equal((await backend(page)).coins,300);checks++;await context.close();
  }
  // Lost acknowledgement: debit and card already exist; reload recovers without another debit or reroll.
  {
   const {context,page}=await open(390,{fixture:true});await page.locator('#startBtn').click();await page.evaluate(()=>economyQA.complete());await paid(page);await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();
   await page.evaluate(()=>{__yrgtFirebase.afterCommitErrorOnce='unavailable';const values=[.99,.01];Math.random=()=>values.shift()??.5});await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);await page.locator('#gachaDraw').click();await page.waitForFunction(uid=>!!JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)).pendingDraw,owner);await page.waitForFunction(()=>document.querySelector('#gachaStatus').textContent.includes('未確認'));
   const pending=(await state(page)).pendingDraw,op=await page.evaluate(id=>__yrgtFirebase.documents['users/wallet-player/walletOps/'+id],pending.id);assert.equal((await backend(page)).coins,200);assert(op.cardId);checks+=2;
   await page.reload();await synced(page);await page.waitForFunction(uid=>!JSON.parse(localStorage.getItem('yrgt-save-v2:'+uid)).pendingDraw,owner);await page.clock.runFor(10);assert.equal((await backend(page)).coins,200);assert((await state(page)).cards.includes(op.cardId));assert.equal(await page.evaluate(()=>Object.keys(__yrgtFirebase.documents).filter(key=>key.includes('/walletOps/draw_')).length),1);checks+=3;await context.close();
  }
  // Bond tiers are visual only; actual active skill is still one use, same effect size.
  {
   const {context,page}=await open(390,{fixture:true});
   for(const [beforeCount,afterCount,level]of [[2,3,1],[9,10,2],[24,25,3]]){
    await page.evaluate(({path,beforeCount})=>{const w=__yrgtFirebase.documents[path];__yrgtFirebase.externalWrite(path,{...w,bonds:{...w.bonds,w_2:beforeCount},revision:w.revision+1})},{path:walletPath,beforeCount});await synced(page);
    await page.locator('#startBtn').click();await page.evaluate(()=>economyQA.complete());await paid(page);assert.equal((await backend(page)).bonds.w_2,afterCount);assert.equal(await page.locator('#resultHp').textContent(),'100');assert.equal(await page.locator('#resultCoins').textContent(),'300 SC');checks+=3;
    await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();assert.equal(await page.locator(`[data-card="w_2"] .bond-level-${level}`).count(),1);checks++;await page.screenshot({path:`/tmp/yrgt-bond-level-${level}.png`,fullPage:true,animations:'disabled'});await page.locator('#backBtn').click();
   }
   await page.locator('#startBtn').click();await page.locator('#companionUse').click();assert.equal(await page.locator('#questionText mark').count(),1);assert(await page.locator('#companionUse').isDisabled());assert.equal(await page.locator('.bond-skill-pop').count(),1);checks+=3;
   await page.locator('#quitBtn').click();await page.locator('#confirmQuit').click();assert.equal((await backend(page)).bonds.w_2,25);checks++;await context.close();
  }
  // Retired contracts never award, early death does not farm bonds, and repeat settlement cannot pay twice.
  {
   const {context,page}=await open(390,{fixture:true});await page.locator('#startBtn').click();await page.evaluate(()=>economyQA.complete({value:95,hintCount:1}));await paid(page);assert.equal((await backend(page)).coins,290);assert.deepEqual((await backend(page)).contracts,[]);assert(!(await page.locator('#progressResult').textContent()).includes('合約'));checks+=3;
   await page.evaluate(()=>economyQA.repeat());assert.equal((await backend(page)).coins,290);checks++;
   await page.locator('#againBtn').click();await page.evaluate(()=>economyQA.complete({value:0,completed:1}));await paid(page);assert.equal((await backend(page)).coins,300);assert.equal((await backend(page)).bonds.w_2,1);checks+=2;
   await page.locator('#againBtn').click();await page.evaluate(()=>__yrgtFirebase.emit({uid:'other-player',displayName:'街坊乙',isAnonymous:false}));await synced(page);assert.equal(await page.locator('#game').isVisible(),false);assert.equal(await page.locator('#collectionCoins').textContent(),'0 SC');assert.equal((await backend(page)).coins,300);checks+=3;
   await page.evaluate(path=>{const w=__yrgtFirebase.documents[path];__yrgtFirebase.externalWrite(path,{...w,coins:700,revision:w.revision+1})},walletPath);assert.equal(await page.locator('#collectionCoins').textContent(),'0 SC');checks++;await context.close();
  }
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:3,legacyCoinsPreserved:true,cloudZeroStart:true,realFullRuns:3,sourceRecoveryCases:process.env.YRGT_SOURCE_FIXTURES==='1',pageErrors:errors.length}));
}finally{await browser.close()}
