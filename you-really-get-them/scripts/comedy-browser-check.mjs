import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];
async function open(width=390,{reducedMotion='no-preference'}={}){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<500,hasTouch:width<500,reducedMotion,serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.addInitScript(()=>{
  Math.random=()=>.999999;localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:17,cards:[],runs:0,bestHp:0}));globalThis.comicCanvasText=[];globalThis.comicCanvasImages=[];
  const drawImage=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){comicCanvasImages.push(image.currentSrc||image.src);return drawImage.call(this,image,...args)};
  const original=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(value,...args){comicCanvasText.push(String(value));return original.call(this,value,...args)};
 });
 await context.route('https://www.gstatic.com/firebasejs/**',route=>route.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(base);
 return {context,page};
}
async function geometry(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
async function round(faction,width){
 const {context,page}=await open(width,{reducedMotion:width===320?'reduce':'no-preference'});
 await page.locator(`[data-faction="${faction}"]`).click();await page.locator('#startBtn').click();let wrong=null,images=0;
 for(let i=0;i<12;i++){
  await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);
  const text=await page.locator('#questionText').textContent(),q=[...BANK[faction],...PICTURE_BANK[faction],...AIR_BANK[faction],...MIXED_BANK[faction]].find(q=>q.text===text);assert(q);
  assert.equal(await page.locator('#answerReview').isVisible(),false);assert.equal(await page.locator('.polaroid-back').count(),0);checks+=2;
  let choice=q.correct??q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((best,value,j,all)=>value>all[best]?j:best,0);
  if(q.picture){
   images++;assert.equal(await page.locator('.clue-pin,#cluePanel').count(),0);checks++;
   if(images===1){choice=(choice+1)%4;wrong={round:i+1,q,choice};await page.screenshot({path:`/tmp/yrgt-comedy-clues-${faction}-${width}.png`,fullPage:true,animations:'disabled'});}
  }
  await page.locator('#answers .answer-btn').nth(choice).click();await page.locator('.polaroid-back').waitFor({state:'visible'});
  assert(await page.locator('.polaroid-back blockquote').textContent());assert.equal(await page.locator('.scene-polaroid').getAttribute('aria-hidden'),null);
  assert.equal(await page.locator('#answers button:enabled').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).coins),17);checks++;await geometry(page);checks+=3;
  const timer=await page.locator('#timer').textContent();await page.clock.fastForward(5000);
  assert.equal(await page.locator('#timer').textContent(),timer);assert.equal(await page.locator('#questionNo').textContent(),String(i+1).padStart(2,'0'));checks+=2;
  await page.locator('#photoFlipBtn').click();assert.equal(await page.locator('.polaroid-back').isVisible(),false);assert(await page.locator('#questionVisual .scene-photo').isVisible());
  await page.locator('#photoFlipBtn').click();assert.equal(await page.locator('.polaroid-back').isVisible(),true);checks+=3;
  if(q.picture&&images===1)await page.screenshot({path:`/tmp/yrgt-comedy-reveal-${faction}-${width}.png`,fullPage:true,animations:'disabled'});
  await page.locator('#nextQuestionBtn').click();
 }
 await page.locator('#result').waitFor({state:'visible'});const hp=Number(await page.locator('#resultHp').textContent()),reward=100+hp*2;assert.equal(await page.locator('#resultCoins').textContent(),`${reward} SC`);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).coins),17+reward);assert((await page.locator('#rewardBreakdown').textContent()).includes('100 SC'));checks+=3;assert.equal(images,2);assert.equal(await page.locator('#resultCorrect').textContent(),'11 / 12');
 const poster=await page.locator('#posterPreview').evaluate(c=>({width:c.width,height:c.height,display:c.getBoundingClientRect().width}));
 assert.equal(poster.width,1080);assert.equal(poster.height,1920);assert(poster.display>Math.min(270,width*.7));checks+=3;
 await page.locator('.poster-preview-wrap').screenshot({path:`/tmp/yrgt-enlarged-poster-${width}.png`,animations:'disabled'});
 const incident=page.locator('#incidentReport .incident-evidence').first();assert.equal(await incident.getAttribute('data-round'),String(wrong.round));
 await incident.locator('summary').click();assert((await incident.locator('blockquote').textContent()).includes(wrong.q.opts[wrong.choice]));
 assert((await page.locator('#incidentReport').textContent()).includes('完成 12/12 題'));assert(!(await page.locator('#incidentReport').textContent()).includes('個線索'));
 const imagesDrawn=await page.evaluate(()=>comicCanvasImages);assert.equal(imagesDrawn.length,2);assert(imagesDrawn.every(url=>url.includes('.png')||url.includes('.webp')));checks+=2;
 const canvasText=await page.evaluate(()=>comicCanvasText.join(''));assert(canvasText.includes('本日求生事故報告'));assert(canvasText.includes(wrong.q.opts[wrong.choice]));checks+=8;await geometry(page);
 await writeFile(`/tmp/yrgt-comedy-poster-${faction}.png`,Buffer.from((await page.locator('#posterPreview').evaluate(c=>c.toDataURL('image/png'))).split(',')[1],'base64'));
 await page.screenshot({path:`/tmp/yrgt-comedy-result-${faction}-${width}.png`,fullPage:true,animations:'disabled'});
 const download=page.waitForEvent('download');await page.locator('#downloadPoster').click();const file=await download;assert.match(file.suggestedFilename(),/survival-report-1\.png/);checks++;
 // Browsers without native file sharing retain the PNG download fallback.
 await page.evaluate(()=>{Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true})});
 const fallback=page.waitForEvent('download');await page.locator('#sharePoster').click();assert.match((await fallback).suggestedFilename(),/\.png$/);checks++;
 await page.evaluate(()=>{
  Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true});
  Object.defineProperty(navigator,'share',{value:async data=>{globalThis.sharedComic={title:data.title,text:data.text,type:data.files[0].type,size:data.files[0].size}},configurable:true});
 });
 await page.locator('#sharePoster').click();await page.waitForFunction(()=>globalThis.sharedComic);
 const shared=await page.evaluate(()=>sharedComic);assert.equal(shared.title,'我的求生事故報告');assert(shared.text.includes('本局完成 12/12 題'));assert(shared.type==='image/png'&&shared.size>10000);assert(shared.text.includes(await page.locator('#resultTitle').textContent()));assert(shared.text.includes(`${reward} SC`));checks+=5;

 await page.locator('#againBtn').click();await page.locator('#answers .answer-btn').first().waitFor();
 assert.equal(await page.locator('.polaroid-back').count(),0);assert.equal(await page.locator('#answerReview').isVisible(),false);checks+=2;
 await context.close();
}
try{
 await Promise.all([round('women',320),round('cat',390),round('dog',768),round('men',1280)]);
 // Timeouts generate one truthful incident and wait for the same review controls.
 {
  const {context,page}=await open();await page.locator('#startBtn').click();await page.clock.runFor(30100);
  await page.locator('.polaroid-back').waitFor({state:'visible'});assert((await page.locator('#questionHint').textContent()).includes('時間到'));
  assert.equal(await page.locator('#hpValue').textContent(),'60');await page.clock.fastForward(10000);assert.equal(await page.locator('#hpValue').textContent(),'60');checks+=3;
  await page.locator('#nextQuestionBtn').click();await page.clock.runFor(30100);await page.locator('#nextQuestionBtn').click();await page.clock.runFor(30100);
  assert.equal(await page.locator('#nextQuestionBtn').textContent(),'查看本日事故報告 →');await page.locator('#nextQuestionBtn').click();await page.locator('#result').waitFor({state:'visible'});
  assert.equal(await page.locator('#resultCoins').textContent(),'10 SC');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).coins),27);checks+=2;assert((await page.locator('#incidentReport').textContent()).includes('完成 3/12 題'));assert((await page.locator('#incidentReport').textContent()).includes('腦內排練超時王'));
  await page.locator('#incidentReport .incident-evidence summary').click();assert((await page.locator('#incidentReport blockquote').textContent()).includes('時間到，尚未作答'));checks+=4;await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,fullRounds:4,reviewPausesTimer:true,truthfulIncidents:true,posterExport:true,timeout:true,pageErrors:errors.length}));
}finally{await browser.close()}
