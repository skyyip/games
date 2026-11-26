import {findPlayableQuestion,playableScenes} from '../tests/fixtures/round-scenes.mjs';
import {CARDS} from '../src/gacha.js';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
const allCards=CARDS.map(card=>card.id);
async function open(width=390,{offline=false,fixture=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:offline?'allow':'block'});
 await context.addInitScript(()=>{Math.random=()=>.999999;});
 if(!offline)await context.route('**/src/firebase/config.js',r=>r.fulfill({contentType:'text/javascript',body:'export const firebaseConfig={};export const firebaseReady=false;'}));
 if(fixture)await context.route('**/src/app.js',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('../src/app.js',import.meta.url),'utf8')+`\nglobalThis.pictureQA={show(f,i){faction=f;questions=[{...BANK[f][i],kind:'classic',legacyIndex:i}];index=0;hp=100;show('game');renderQuestion();},picture(f,i=0){faction=f;questions=[{...PICTURE_BANK[f][i],kind:'classic',legacyIndex:-1}];index=0;hp=100;runAnswers=[];runSettled=false;companionRun=null;duoTestPhase=false;show('game');renderQuestion();},timed(kind){faction='women';questions=[{...({classic:BANK.women,air:AIR_BANK.women,hybrid:MIXED_BANK.women}[kind][0]),kind,legacyIndex:-1}];index=0;hp=100;runAnswers=[];runSettled=false;companionRun=null;duoTestPhase=false;show('game');renderQuestion();}};`}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});return {context,page};
}
async function inspectQuestion(page,q){
 assert.equal(await page.locator('#scratch,#scratchMeter,.scratch-pad').count(),0);checks++;
 const photo=page.locator('#questionVisual .scene-photo'),img=photo.locator('img');await img.evaluate(i=>i.decode());
 if(q.picture){
  assert.equal(await page.locator('#questionVisual figcaption').textContent(),q.picture.title);
  assert.equal(await photo.getAttribute('aria-label'),q.picture.alt);assert((await page.locator('#questionTag').textContent()).includes('圖片情境題'));
  assert((await img.getAttribute('src')).includes('picture-stories'));await page.locator('#questionVisual summary').click();assert(await page.locator('#questionVisual details').getAttribute('open')!==null);await page.locator('#questionVisual summary').click();checks+=5;
 }
 const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,caption:document.querySelector('#questionVisual figcaption').getBoundingClientRect().bottom,question:document.querySelector('#questionText').getBoundingClientRect().top}));
 assert(geometry.scroll<=geometry.width+1);assert(geometry.caption<=geometry.question);assert(await page.locator('#answers .answer-btn').first().isEnabled());checks+=3;
}
async function round(faction,width){
 const {context,page}=await open(width);await page.locator(`[data-faction="${faction}"]`).click();await page.locator('#startBtn').click();let pictures=0;
 for(let i=0;i<12;i++){
  await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);
  const text=await page.locator('#questionText').textContent(),q=findPlayableQuestion(text,faction);assert(q);await inspectQuestion(page,q);
  if(q.picture){pictures++;if(pictures===1)await page.screenshot({path:`/tmp/yrgt-picture-${faction}-${width}.png`,fullPage:true});}
  const values=q.profiles?.map(p=>p.reduce((a,b)=>a+b,0));const choice=q.correct??values.indexOf(Math.max(...values));await page.locator('#answers .answer-btn').nth(choice).click();if(q.message)await page.locator('#sendMessageBtn').click();await page.locator('#nextQuestionBtn').click();
 }
 await page.locator('#result').waitFor({state:'visible'});assert.equal(pictures,2);assert.equal(await page.locator('#resultCorrect').textContent(),'12 / 12');checks+=2;await context.close();
}
try{
 await Promise.all([round('women',390),round('men',1280),round('dog',390),round('cat',320)]);
 // The pass-the-phone answers stay private until all five guesses are complete.
 {const {context,page}=await open();await page.evaluate(()=>Math.random=()=>0);await page.locator('[data-faction="duo"]').click();await page.locator('#startBtn').click();let setupPictures=0,testPictures=0;
  for(let i=0;i<5;i++){if(await page.locator('#modalContent .picture-polaroid').count()){setupPictures++;await page.locator('#modalContent .scene-photo img').evaluate(i=>i.decode());}await page.locator('.duo-setup-answers button').first().click();}
  await page.locator('#duoBeginTest').click();
  for(let i=0;i<5;i++){await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);if(await page.locator('#questionVisual .picture-polaroid').count()){testPictures++;const title=await page.locator('#questionVisual figcaption').textContent();assert(PICTURE_BANK.duo.slice(1).some(q=>q.picture.title===title));}assert.equal(await page.locator('.duo-answer-compare').count(),0);await page.locator('#answers button').first().click();}
  await page.locator('.duo-results').waitFor();assert.equal(setupPictures,1);assert.equal(testPictures,1);assert.equal(await page.locator('.duo-answer-compare').count(),5);checks+=9;await context.close();}
 // Existing ownership, rarity and 100-SC / duplicate-25-SC economics survive the album art replacement.
 for(const width of [320,390,1280]){const {context,page}=await open(width);await page.evaluate(cards=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:500,cards,runs:3,bestHp:100})),width===1280?allCards:['w_1','m_1']);await page.locator('#actionMenu summary').click();await page.locator('#collectionBtn').click();assert.equal(await page.locator('.flash-card-polaroid').count(),180);
  const frames=await page.locator('.flash-card-art').evaluateAll(nodes=>nodes.map(n=>({bg:getComputedStyle(n).backgroundImage,pos:getComputedStyle(n).backgroundPosition,ratio:n.clientWidth/n.clientHeight})));assert.equal(new Set(frames.map(f=>f.bg+f.pos)).size,180);assert(frames.every(f=>(f.bg.includes('collection-polaroids')||f.bg.includes('gacha-polaroids')||f.bg.includes('pet-breeds')||f.bg.includes('everyday-polaroids')||f.bg.includes('festival-polaroids')||f.bg.includes('weekend-polaroids')||f.bg.includes('bonus-polaroids')||f.bg.includes('metro-polaroids')||f.bg.includes('night-polaroids')||f.bg.includes('commute-polaroids')||f.bg.includes('normal-color-')||f.bg.includes('outing-polaroids')||f.bg.includes('homecoming-polaroids'))&&Math.abs(f.ratio-.75)<.025));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=4;
  await page.screenshot({path:`/tmp/yrgt-collection-polaroid-${width}.png`,fullPage:true});
  if(width===390){await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);await page.locator('.draw-card-btn').click();await page.locator('#modal .flash-card-polaroid-large').waitFor();assert.equal(await page.locator('#modal .flash-card-polaroid figcaption').textContent(),CARDS.at(-1).name);let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(state.coins,400);assert(state.cards.includes(CARDS.at(-1).id));await page.locator('#modalClose').click();await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);await page.locator('.draw-card-btn').click();await page.waitForFunction(()=>document.querySelector('#modalContent').textContent.includes('重複閃卡'));state=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(state.coins,325);checks+=4;}
  await context.close();}
 // Each new snapshot works as a standalone picture question at mobile and desktop widths.
 for(const width of [320,390,1280]){
  const {context,page}=await open(width,{fixture:true});
  for(const [f,rows]of Object.entries(PICTURE_BANK))for(let i=0;i<rows.length;i++){
   const q=rows[i];if(!q.picture.atlas)continue;
   await page.evaluate(([f,i])=>pictureQA.picture(f,i),[f,i]);await inspectQuestion(page,q);
   const style=await page.locator('#questionVisual img').evaluate(n=>({left:n.style.left,top:n.style.top,width:n.style.width,height:n.style.height}));
   const slot=q.picture.art-9;assert.deepEqual(style,{left:`${-(slot%4)*100}%`,top:`${-Math.floor(slot/4)*100}%`,width:'400%',height:'300%'});assert.equal(await page.locator('#rewardSyncStatus').count(),0);checks+=2;
   if(width===390){await page.screenshot({path:`/tmp/yrgt-new-picture-${q.picture.art}.png`,fullPage:false,animations:'disabled'})}
   await page.locator('#answers button').nth(q.correct).click();assert.equal(await page.locator('#hpValue').textContent(),'100');assert((await page.locator('#questionHint').textContent()).includes(q.why));checks+=2;
  }
  await context.close();
 }
 // Exactly 35 seconds apply equally to classic/picture, air and hybrid questions.
 {
  const {context,page}=await open(390,{fixture:true});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  for(const kind of ['classic','air','hybrid','picture']){
   if(kind==='picture')await page.evaluate(()=>pictureQA.picture('women',2));else await page.evaluate(kind=>pictureQA.timed(kind),kind);
   assert.equal(await page.locator('#timer').textContent(),'35.0');await page.clock.runFor(30000);assert.equal(await page.locator('#answerReview').isVisible(),false);assert.equal(await page.locator('#hpValue').textContent(),'100');assert(Number(await page.locator('#timer').textContent())>=4.9);checks+=4;
   await page.clock.runFor(5100);assert(await page.locator('#answerReview').isVisible());assert.equal(await page.locator('#hpValue').textContent(),'60');assert.equal(await page.locator('#timer').textContent(),'0.0');checks+=3;
  }
  await context.close();
 }
 // Removed tap/hold tasks no longer render or impose delayed/answer-time penalties.
 {const {context,page}=await open(390,{fixture:true});
  for(const id of [1,3,7]){await page.evaluate(id=>pictureQA.show('women',id),id);assert.equal(await page.locator('#interaction').isVisible(),false);assert.equal(await page.locator('#tapBtn,#holdBtn').count(),0);await page.locator('#answers button').nth(BANK.women[id].correct).click();assert.equal(await page.locator('#hpValue').textContent(),'100');checks+=3;}
  for(const [f,id,selector]of [['women',5,'.runaway-answer'],['dog',6,'#treatBtn'],['cat',6,'#cupBtn']]){await page.evaluate(([f,id])=>pictureQA.show(f,id),[f,id]);assert(await page.locator(selector).isVisible());if(id===6)await page.locator(selector).click();checks++;}
  await context.route('**/assets/illustrations/picture-stories.webp',r=>r.abort());await page.evaluate(()=>pictureQA.picture('women'));await page.waitForFunction(()=>!!document.querySelector('.picture-description[open]'));assert((await page.locator('.picture-description p').textContent()).includes('微微上揚'));assert(await page.locator('#answers button').first().isEnabled());checks+=2;await context.route('**/assets/illustrations/picture-stories-everyday.webp',r=>r.abort());await page.evaluate(()=>pictureQA.picture('women',2));await page.waitForFunction(()=>!!document.querySelector('.picture-description[open]'));assert((await page.locator('.picture-description p').textContent()).includes('手提電腦'));assert(await page.locator('#answers button').first().isEnabled());checks+=2;await context.close();}
 // Actual source Service Worker serves the new module and both art atlases offline.
 {const {context,page}=await open(390,{offline:true});await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(async()=>{const c=await caches.open('you-really-get-them-v65');return !!await c.match('./assets/illustrations/picture-stories-everyday.webp')&&!!await c.match('./assets/illustrations/picture-stories.webp')&&!!await c.match('./assets/illustrations/collection-polaroids.webp')&&!!await c.match('./src/picture-questions.js')&&!!await c.match('./src/comedy.js');});await context.setOffline(true);await page.reload({waitUntil:'load'});await page.evaluate(()=>Math.random=()=>0);await page.locator('#startBtn').click();await page.evaluate(()=>Math.random=()=>.999999);await page.locator('#questionVisual img').evaluate(i=>i.decode());assert.equal(await page.locator('#scratch').count(),0);checks++;let offlineNewPictures=0;
  for(let i=0;i<12;i++){const text=await page.locator('#questionText').textContent(),q=findPlayableQuestion(text,'women');if(q.picture?.atlas==='everyday'){await page.locator('#questionVisual img').evaluate(i=>i.decode());assert((await page.locator('#questionVisual img').getAttribute('src')).includes('picture-stories-everyday'));offlineNewPictures++;checks++}const scores=q.profiles?.map(p=>p.reduce((a,b)=>a+b,0));const choice=q.correct??scores.indexOf(Math.max(...scores));await page.locator('#answers button').nth(choice).click();if(q.message)await page.locator('#sendMessageBtn').click();assert(await page.locator('.polaroid-back').isVisible());checks++;await page.locator('#nextQuestionBtn').click();}
  await page.locator('#result').waitFor({state:'visible'});assert((await page.locator('#incidentReport').textContent()).includes('完成 12/12 題'));const blob=await page.locator('#posterPreview').evaluate(c=>new Promise(resolve=>c.toBlob(b=>resolve(b?.size||0),'image/png')));assert(blob>10000);checks+=2;
  const before=(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')))).coins;await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();
  await page.evaluate(async()=>{const image=new Image();image.src=new URL('./assets/illustrations/homecoming-polaroids.webp',location.href).href;await image.decode()});
  await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);await page.locator('#gachaDraw').click();await page.locator('#modal .gacha-result').waitFor({state:'visible'});const drawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(drawn.coins,before-100);assert(drawn.cards.includes(CARDS.at(-1).id));checks+=3;await context.close();}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,fullRounds:5,pictureQuestions:8,duoPicture:true,collectionCards:180,offline:true,pageErrors:errors.length}));
}finally{await browser.close();}
