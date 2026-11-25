import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
import {findPlayableQuestion} from '../tests/fixtures/round-scenes.mjs';
import {STORY_ARCS,MESSAGE_SCENES,editedMessage} from '../src/story-events.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
async function open(width=390,{fixture=false,card='m_2'}={}){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<600,isMobile:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.addInitScript(card=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:17,cards:[card],equippedCard:card,runs:0,bestHp:0})),card);
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 if(fixture)await context.route('**/src/app.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`
 import {MESSAGE_SCENES as fixtureMessages} from './story-events.js';globalThis.storyQA={setup(f){faction=f;duoTestPhase=false;questions=addStoryEvents([...BANK[f].slice(0,3).map(q=>({...q,kind:'classic'})),...PICTURE_BANK[f].map(q=>({...q,kind:'classic'})),...AIR_BANK[f].slice(0,4).map(q=>({...q,kind:'air'})),...MIXED_BANK[f].slice(0,3).map(q=>({...q,kind:'hybrid'}))],f);index=1;hp=100;runAnswers=[];runSettled=false;companionRun=null;show('game');renderQuestion()},callback(){index=8;renderQuestion()},message(f){this.setup(f);questions=[fixtureMessages[f]];index=0;renderQuestion()},challenge(){challengeId='fixture';challengeRunPending=true},records:()=>runAnswers,specialCount:()=>questions.filter(q=>q.story||q.message).length};`})});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-25T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-25T00:00:01Z'));await page.goto(base);await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');return {page,context};
}
async function fits(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
async function answer(page,q,choice=q.correct??q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((b,v,i,a)=>v>a[b]?i:b,0)){
 for(const id of ['treatBtn','cupBtn'])if(await page.locator('#'+id).isVisible())await page.locator('#'+id).click();
 await page.locator('#answers button').nth(choice).evaluate(n=>n.click());if(q.message)await page.locator('#sendMessageBtn').click();await page.locator('#answerReview').waitFor({state:'visible'});
}
try{
 for(const [faction,width,card] of [['women',320,'m_2'],['men',1280,'m_18'],['dog',390,'d_8'],['cat',320,'c_11']]){
  const {page,context}=await open(width,{card});await page.locator(`[data-faction="${faction}"]`).click();await page.locator('#startBtn').click();let callbacks=0,messages=0,banters=0,commitment=null;
  for(let i=0;i<12;i++){
   const text=await page.locator('#questionText').textContent(),q=findPlayableQuestion(text,faction);assert(q,text);assert.equal(await page.locator('#companionBanter').isVisible(),false);checks++;
   if(q===STORY_ARCS[faction].setup)commitment=q.opts[q.correct];
   if(await page.locator('#storyPanel').isVisible()){callbacks++;assert.equal(await page.locator('#storyPanel blockquote').textContent(),commitment);assert.equal(await page.locator('#questionTag').textContent(),'回力鏢劇情');checks+=2;await page.screenshot({path:`/tmp/yrgt-callback-${faction}-${width}.png`,fullPage:true,animations:'disabled'})}
   if(q.message){
    messages++;assert.equal(await page.locator('#messagePanel').isVisible(),true);assert.equal(await page.locator('#messageConfirm').isVisible(),false);assert.deepEqual(await page.locator('#messageDraft p').allTextContents(),q.message.draft);checks+=3;
    await page.locator('#answers button').nth((q.correct+1)%4).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#answerReview').isVisible(),false);assert.equal(await page.locator('#hpValue').textContent(),'100');checks+=2;
    await page.locator('#answers button').nth(q.correct).click();assert.deepEqual(await page.locator('#messagePreview p').allTextContents(),editedMessage(q,q.correct));assert.equal(await page.locator('#messagePreview .is-edited').count(),1);checks+=2;await fits(page);
    await page.screenshot({path:`/tmp/yrgt-message-preview-${faction}-${width}.png`,fullPage:true,animations:'disabled'});
   }
   await answer(page,q);
   if(await page.locator('#companionBanter').isVisible()){banters++;assert((await page.locator('#companionBanter').textContent()).length>10);checks++}
   if(q.message){assert.equal(await page.locator('#messageState').textContent(),'已發送');assert((await page.locator('.comic-said').textContent()).includes(q.message.replies[q.correct]));checks+=2}
   await fits(page);await page.locator('#nextQuestionBtn').click();
  }
  await page.locator('#result').waitFor({state:'visible'});assert.equal(callbacks,1);assert.equal(messages,1);assert(banters>=1&&banters<=2);assert.equal(await page.locator('#resultCorrect').textContent(),'12 / 12');assert.equal(await page.locator('#resultHp').textContent(),'100');assert.equal(await page.locator('#resultCoins').textContent(),card==='c_11'?'320 SC':'300 SC');assert.equal(await page.locator('.companion-result').filter({hasText:'不計入公開排行榜'}).count(),0);checks+=7;
  await page.locator('#againBtn').click();assert.equal(await page.locator('#storyPanel').isVisible(),false);assert.equal(await page.locator('#companionBanter').isVisible(),false);checks+=2;await context.close();
 }
 if(process.env.YRGT_SOURCE_FIXTURES==='1'){
  const {page,context}=await open(390,{fixture:true});
  for(const [faction,arc]of Object.entries(STORY_ARCS))for(const choice of [0,1,2,3,null]){
   await page.evaluate(f=>storyQA.setup(f),faction);
   if(choice===null){await page.clock.runFor(30100);await page.locator('#answerReview').waitFor({state:'visible'})}else await answer(page,arc.setup,choice);
   const record=(await page.evaluate(()=>storyQA.records()))[0];assert.equal(record.story.choiceIndex,choice);
   await page.evaluate(()=>storyQA.callback());assert.equal(await page.locator('#storyPanel blockquote').textContent(),choice===null?'時間到，尚未作答':arc.setup.opts[choice]);assert.equal(await page.locator('#questionText').textContent(),arc.followUps[choice??4].text);checks+=3;await fits(page);
  }
  for(const [faction,q]of Object.entries(MESSAGE_SCENES))for(const choice of [0,1,2,3,null]){
   await page.evaluate(f=>storyQA.message(f),faction);assert.equal(await page.locator('#sendMessageBtn').isEnabled(),false);
   await page.clock.runFor(700);const before=await page.locator('#timer').textContent();
   for(let i=0;i<4;i++){await page.locator('#answers button').nth(i).click();assert.deepEqual(await page.locator('#messagePreview p').allTextContents(),editedMessage(q,i));assert.equal(await page.locator('#answerReview').isVisible(),false);assert.equal(await page.locator('#hpValue').textContent(),'100');checks+=3}
   assert.equal(await page.locator('#timer').textContent(),before);checks+=2;
   if(choice===null){await page.clock.runFor(30100);assert.equal(await page.locator('#messageState').textContent(),'時間到 · 未發送');assert.equal((await page.evaluate(()=>storyQA.records()))[0].timedOut,true);checks+=2}
   else{
    await page.locator('#answers button').nth(choice).click();await page.locator('#sendMessageBtn').focus();await page.keyboard.press('Enter');await page.locator('#answerReview').waitFor({state:'visible'});
    const records=await page.evaluate(()=>storyQA.records());assert.equal(records.length,1);assert.equal(records[0].choice,editedMessage(q,choice).join(' '));const hp=await page.locator('#hpValue').textContent();assert.equal(hp,choice===q.correct?'100':'84');
    await page.locator('#sendMessageBtn').dispatchEvent('click');assert.equal((await page.evaluate(()=>storyQA.records())).length,1);assert.equal(await page.locator('#hpValue').textContent(),hp);checks+=5;
   }
  }
  // Friend challenges retain their original seeded pool and disable all companion commentary.
  await page.evaluate(()=>{__yrgtFirebase.emit({uid:'fixture',isAnonymous:true});storyQA.challenge()});await page.locator('#startBtn').evaluate(n=>n.click());assert.equal(await page.evaluate(()=>storyQA.specialCount()),0);assert.equal(await page.locator('#companionBar').isVisible(),false);checks+=2;
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,fullRounds:4,sourceBranches:process.env.YRGT_SOURCE_FIXTURES==='1'?20:0,messages:4,banterLimit:2,pageErrors:errors.length}));
}finally{await browser.close()}
