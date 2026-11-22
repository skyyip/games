import {questionView} from '../src/question-view.js';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {URBAN_QUESTIONS} from '../src/urban-questions.js';
import {newRun,act,hkDay,questionId,questionFor,presentation,DAY_MS,HK_OFFSET} from '../src/game.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL||'http://127.0.0.1:5437/games/hong-kong-millionaire/';
const KEY='sky.hk-millionaire.today.v1',DAY=hkDay(Date.UTC(2026,10,15,4));
const browser=await chromium.launch({headless:true}),errors=[],badResponses=[];
let checks=0;
function planned(day,index,version){
 const now=day*DAY_MS-HK_OFFSET+12*3600000;let run=newRun(day,now);if(version)run.bankVersion=version;
 for(let i=0;i<index;i++){run=act(run,{type:'answer',choice:questionFor(run).answer},now+100+i*200);run=act(run,{type:'next'},now+200+i*200);}
 return {now:run.questionAt+100,run};
}
try{
 const context=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block',acceptDownloads:true});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await context.addInitScript(()=>{
  globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;const Native=Date;globalThis.__qaNow=Number(localStorage.getItem('qa.hkm.urbanNow'))||Native.now();
  globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.__qaNow]));}static now(){return globalThis.__qaNow;}};
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>globalThis.__sharedText=text}});
  Object.defineProperty(navigator,'canShare',{value:()=>true});
  Object.defineProperty(navigator,'share',{value:async data=>{globalThis.__sharedFile={name:data.files[0].name,size:data.files[0].size,text:data.text};}});
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.status()>=400)badResponses.push(response.url());});
 await page.goto(base,{waitUntil:'networkidle'});
 async function seed(value){
  await page.evaluate(({key,value})=>{globalThis.__qaNow=value.now;localStorage.setItem('qa.hkm.urbanNow',String(value.now));localStorage.setItem(key,JSON.stringify({day:value.run.day,owner:'guest',token:crypto.randomUUID(),revision:0,run:value.run}));},{key:KEY,value});
  await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();
 }
 for(const q of URBAN_QUESTIONS){
  let match;
  for(let day=DAY;day<DAY+90&&!match;day++)for(let index=0;index<15;index++)if(questionId(day,index)===q.id){match={day,index};break;}
  assert(match,q.id+' unreachable');const value=planned(match.day,match.index);await seed(value);
  assert.equal(await page.locator('#question-title').textContent(),questionView(q).question);
  const mode=presentation(match.day,match.index).mode;
  assert.equal(await page.locator('#question-image').isVisible(),mode!=='text');
  if(mode!=='text'){await page.locator('#question-image').evaluate(image=>image.decode());assert(await page.locator('#question-image').evaluate(image=>image.naturalWidth>0&&Math.abs(image.naturalWidth/image.naturalHeight-1.6)<.01));}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const wrong=(q.answer+1)%4;await page.locator(`[data-choice="${wrong}"]`).click();await page.locator('#confirm-answer').click();await page.locator('#result-screen').waitFor({state:'visible'});
  await page.locator('#question-challenge').click();await page.locator('#question-share-preview').waitFor({state:'visible'});
  await page.locator('#question-share-preview').evaluate(image=>image.decode());
  assert.equal(await page.locator('#question-share-preview').evaluate(image=>image.naturalWidth),1080);
  if(!q.textOnly){
   const colors=await page.locator('#question-share-preview').evaluate(image=>{const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(80,198,920,414).data,colors=new Set();for(let i=0;i<pixels.length;i+=16)colors.add(pixels[i]+','+pixels[i+1]+','+pixels[i+2]);return colors.size;});
   assert(colors>8,q.id+' share image crop is empty');checks++;
  }
  await page.locator('#copy-question-share').click();const shared=await page.evaluate(()=>globalThis.__sharedText);assert(shared.includes(questionView(q).question));assert(!shared.includes(q.explanation));assert(!shared.includes(q.hint));
  await page.locator('#native-question-share').click();const file=await page.evaluate(()=>globalThis.__sharedFile);assert.equal(file.name,'hk-millionaire-'+q.id+'.png');assert(file.size>1000);
  if(q.id==='u08'){
   const download=page.waitForEvent('download');await page.locator('#download-question-card').click();const image=await download;assert.equal(image.suggestedFilename(),'hk-millionaire-u08.png');await image.saveAs('/tmp/hkm-u08-share.png');
   await page.screenshot({path:'/tmp/hkm-u08-share-modal.png',fullPage:true});
  }
  await page.locator('[data-close="question-share-dialog"]').click();checks+=8;
 }
 await context.close();assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);
 console.log(JSON.stringify({checks,newQuestions:14,shareImages:14,pageErrors:0,failedAssets:0}));
}finally{await browser.close();}
