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
 if(fixture)await context.route('**/src/app.js',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('../src/app.js',import.meta.url),'utf8')+`\nglobalThis.pictureQA={show(f,i){faction=f;questions=[{...BANK[f][i],kind:'classic',legacyIndex:i}];index=0;hp=100;show('game');renderQuestion();},picture(f){faction=f;questions=[{...PICTURE_BANK[f][0],kind:'classic',legacyIndex:-1}];index=0;hp=100;show('game');renderQuestion();}};`}));
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
  const text=await page.locator('#questionText').textContent(),q=[...BANK[faction],...PICTURE_BANK[faction],...AIR_BANK[faction],...MIXED_BANK[faction]].find(q=>q.text===text);assert(q);await inspectQuestion(page,q);
  if(q.picture){pictures++;if(pictures===1)await page.screenshot({path:`/tmp/yrgt-picture-${faction}-${width}.png`,fullPage:true});}
  if(await page.locator('#tapBtn').count())for(let n=0;n<15;n++)await page.locator('#tapBtn').click({force:true});
  const values=q.profiles?.map(p=>p.reduce((a,b)=>a+b,0));const choice=q.correct??values.indexOf(Math.max(...values));await page.locator('#answers .answer-btn').nth(choice).click();await page.locator('#nextQuestionBtn').click();
 }
 await page.locator('#result').waitFor({state:'visible'});assert.equal(pictures,2);assert.equal(await page.locator('#resultCorrect').textContent(),'12 / 12');checks+=2;await context.close();
}
try{
 await Promise.all([round('women',390),round('men',1280),round('dog',390),round('cat',320)]);
 // The pass-the-phone answers stay private until all five guesses are complete.
 {const {context,page}=await open();await page.locator('[data-faction="duo"]').click();await page.locator('#startBtn').click();let setupPictures=0,testPictures=0;
  for(let i=0;i<5;i++){if(await page.locator('#modalContent .picture-polaroid').count()){setupPictures++;await page.locator('#modalContent .scene-photo img').evaluate(i=>i.decode());}await page.locator('.duo-setup-answers button').first().click();}
  await page.locator('#duoBeginTest').click();
  for(let i=0;i<5;i++){await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);if(await page.locator('#questionVisual .picture-polaroid').count()){testPictures++;assert.equal(await page.locator('#questionVisual figcaption').textContent(),'兩個人的下一格');}assert.equal(await page.locator('.duo-answer-compare').count(),0);await page.locator('#answers button').first().click();}
  await page.locator('.duo-results').waitFor();assert.equal(setupPictures,1);assert.equal(testPictures,1);assert.equal(await page.locator('.duo-answer-compare').count(),5);checks+=9;await context.close();}
 // Existing ownership, rarity and 100-SC / duplicate-25-SC economics survive the album art replacement.
 for(const width of [320,390,1280]){const {context,page}=await open(width);await page.evaluate(cards=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:500,cards,runs:3,bestHp:100})),width===1280?allCards:['w_1','m_1']);await page.locator('#actionMenu summary').click();await page.locator('#collectionBtn').click();assert.equal(await page.locator('.flash-card-polaroid').count(),28);
  const frames=await page.locator('.flash-card-art').evaluateAll(nodes=>nodes.map(n=>({bg:getComputedStyle(n).backgroundImage,pos:getComputedStyle(n).backgroundPosition,ratio:n.clientWidth/n.clientHeight})));assert.equal(new Set(frames.map(f=>f.bg+f.pos)).size,28);assert(frames.every(f=>(f.bg.includes('collection-polaroids')||f.bg.includes('gacha-polaroids'))&&Math.abs(f.ratio-.75)<.025));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=4;
  await page.screenshot({path:`/tmp/yrgt-collection-polaroid-${width}.png`,fullPage:true});
  if(width===390){await page.locator('.draw-card-btn').click();await page.locator('#modal .flash-card-polaroid-large').waitFor();assert.equal(await page.locator('#modal .flash-card-polaroid figcaption').textContent(),'沙發宇宙皇帝');let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(state.coins,400);assert(state.cards.includes('c_7'));await page.locator('#modalClose').click();await page.locator('.draw-card-btn').click();await page.waitForFunction(()=>document.querySelector('#modalContent').textContent.includes('重複閃卡'));state=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(state.coins,325);checks+=4;}
  await context.close();}
 // Removed scratch question no longer creates an interaction; remaining interaction controls still respond.
 {const {context,page}=await open(390,{fixture:true});await page.evaluate(()=>pictureQA.show('women',1));assert.equal(await page.locator('#interaction').isVisible(),false);checks++;
  for(const [f,id,selector]of [['women',3,'#tapBtn'],['women',5,'.runaway-answer'],['women',7,'#holdBtn'],['dog',6,'#treatBtn'],['cat',6,'#cupBtn']]){await page.evaluate(([f,id])=>pictureQA.show(f,id),[f,id]);assert(await page.locator(selector).isVisible());if(id===7){await page.locator(selector).focus();await page.keyboard.down('Space');await page.waitForFunction(()=>document.querySelector('#questionHint').textContent.includes('承諾成立'));await page.keyboard.up('Space');}else if(id===3)for(let n=0;n<15;n++)await page.locator(selector).click({force:true});else if(id===6)await page.locator(selector).click();checks++;}
  // Releasing an unfinished hold after answering cannot damage HP during the reveal.
  await page.evaluate(()=>pictureQA.show('women',7));const hold=await page.locator('#holdBtn').boundingBox();await page.mouse.move(hold.x+hold.width/2,hold.y+hold.height/2);await page.mouse.down();await page.locator('#answers button').nth(BANK.women[7].correct).evaluate(button=>button.click());const reviewedHP=await page.locator('#hpValue').textContent();await page.mouse.up();assert.equal(await page.locator('#hpValue').textContent(),reviewedHP);checks++;
  await context.route('**/assets/illustrations/picture-stories.webp',r=>r.abort());await page.evaluate(()=>pictureQA.picture('women'));await page.waitForFunction(()=>!!document.querySelector('.picture-description[open]'));assert((await page.locator('.picture-description p').textContent()).includes('微微上揚'));assert(await page.locator('#answers button').first().isEnabled());checks+=2;await context.close();}
 // Actual source Service Worker serves the new module and both art atlases offline.
 {const {context,page}=await open(390,{offline:true});await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(async()=>{const c=await caches.open('you-really-get-them-v47');return !!await c.match('./assets/illustrations/picture-stories.webp')&&!!await c.match('./assets/illustrations/collection-polaroids.webp')&&!!await c.match('./src/picture-questions.js')&&!!await c.match('./src/comedy.js');});await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('#startBtn').click();await page.locator('#questionVisual img').evaluate(i=>i.decode());assert.equal(await page.locator('#scratch').count(),0);checks++;
  for(let i=0;i<12;i++){const text=await page.locator('#questionText').textContent(),q=[...BANK.women,...PICTURE_BANK.women,...AIR_BANK.women,...MIXED_BANK.women].find(q=>q.text===text);const scores=q.profiles?.map(p=>p.reduce((a,b)=>a+b,0));const choice=q.correct??scores.indexOf(Math.max(...scores));await page.locator('#answers button').nth(choice).click();assert(await page.locator('.polaroid-back').isVisible());checks++;await page.locator('#nextQuestionBtn').click();}
  await page.locator('#result').waitFor({state:'visible'});assert((await page.locator('#incidentReport').textContent()).includes('完成 12/12 題'));const blob=await page.locator('#posterPreview').evaluate(c=>new Promise(resolve=>c.toBlob(b=>resolve(b?.size||0),'image/png')));assert(blob>10000);checks+=2;
  const before=(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')))).coins;await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();
  await page.evaluate(async()=>{const image=new Image();image.src=new URL('./assets/illustrations/gacha-polaroids.webp',location.href).href;await image.decode()});
  await page.locator('#gachaDraw').click();await page.locator('#modal .gacha-result').waitFor({state:'visible'});const drawn=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(drawn.coins,before-100);assert(drawn.cards.includes('c_7'));checks+=3;await context.close();}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,fullRounds:5,pictureQuestions:8,duoPicture:true,collectionCards:28,offline:true,pageErrors:errors.length}));
}finally{await browser.close();}
