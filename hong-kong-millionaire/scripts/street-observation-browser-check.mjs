// Built-page coverage for both attachments, all offered visual puzzles and mobile crop geometry.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';
import {STREET_OBSERVATION_QUESTIONS as bank} from '../src/street-observation-questions.js';
import {QUESTIONS} from '../src/questions.js';
import {newRun,hkDay,questionId,presentation,questionFor,act} from '../src/game.js';
import {questionView,visualModes,cropLayout} from '../src/question-view.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE)),base=process.env.HKM_TEST_URL,built=process.env.HKM_BUILD_DIR;
const manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8')),DAY=hkDay(Date.UTC(2026,10,16,4)),KEY='sky.hk-millionaire.today.v1';
const fixtures=new Map(),newIds=new Set(bank.map(q=>q.id));for(let day=DAY;day<DAY+1500;day++)for(let index=0;index<15;index++){const id=questionId(day,index);if(newIds.has(id)){const key=id+':'+presentation(day,index).mode;if(!fixtures.has(key))fixtures.set(key,{day,index});}}
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
try{
 const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await c.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await c.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;const Native=Date;globalThis.__visualNow=Number(localStorage.getItem('qa.visual.now'))||Native.now();globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[__visualNow]));}static now(){return __visualNow;}};});
 const page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});
 async function seed(q,mode,width=390,height=844){const match=fixtures.get(q.id+':'+mode);assert(match,q.id+' '+mode);const now=match.day*86400000+4*3600000,run={...newRun(match.day,now),index:match.index,correct:match.index};
  await page.setViewportSize({width,height});await page.evaluate(({KEY,run,now})=>{localStorage.setItem('qa.visual.now',now);localStorage.setItem(KEY,JSON.stringify({day:run.day,owner:'guest',token:crypto.randomUUID(),revision:0,run}));},{KEY,run,now});await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();await page.locator('#options button').first().waitFor();return run;}
 for(const q of bank)for(const mode of visualModes(q)){
  if(process.env.HKM_VISUAL_ONLY_MIRROR&&mode!=='mirrored')continue;
  const r=await seed(q,mode);assert.equal(await page.locator('#question-title').textContent(),questionView(q,mode).question);assert.equal(await page.locator('#options button').count(),4);
  if(mode!=='text'){
   await page.locator('#question-image').evaluate(i=>i.decode());assert.equal(await page.locator('#question-image').getAttribute('data-mode'),mode);
   if(mode==='partial'){const layout=cropLayout(q.observation.crop,...await page.locator('#visual-frame').evaluate(n=>[n.getBoundingClientRect().width,n.getBoundingClientRect().height]));const actual=await page.locator('#question-image').evaluate(n=>({clip:n.style.clipPath,width:parseFloat(n.style.width)}));assert.equal(actual.clip,await page.evaluate(value=>{const n=document.createElement('i');n.style.clipPath=value;return n.style.clipPath;},layout.clip));assert(Math.abs(actual.width-layout.width)<.1);checks+=2;}
   if(mode==='mirrored')assert.equal(await page.locator('#question-image').evaluate(n=>n.style.transform),'scaleX(-1)');
   if(mode==='blurred'){const filter=await page.locator('#question-image').evaluate(n=>getComputedStyle(n).filter);assert.match(filter,/blur\((?!0px)/);await page.evaluate(()=>{__visualNow+=12000;document.querySelector('#question-image').getAnimations()[0].currentTime=12000;});assert((await page.locator('#question-image').evaluate(n=>parseFloat(getComputedStyle(n).filter.slice(5))))<12);}
  }
  await page.locator(`[data-choice="${q.answer}"]`).click();await page.locator('#confirm-answer').click();await page.waitForFunction(({KEY,index})=>JSON.parse(localStorage.getItem(KEY)).run.answers[index],{KEY,index:r.index});const after=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).run,KEY);assert.equal(after.answers[r.index].outcome,'correct');assert.equal(after.answers[r.index].qid,q.id);checks+=4;
 }
 // Resizing a cropped image must not accidentally reveal its neighbours.
 for(const [id,mode]of [['s01','partial'],['s16','mirrored'],['s21','mirrored'],['s40','mirrored'],['s43','mirrored'],['s46','partial'],['s54','text']])for(const [width,height]of [[320,568],[390,667],[812,375]]){
  const q=bank.find(q=>q.id===id);await seed(q,mode,width,height);await page.waitForTimeout(80);
  const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,wide:document.documentElement.scrollWidth,frame:document.querySelector('#visual-frame').getBoundingClientRect().height,bottom:Math.max(...['question-title','options','life-half','life-phone','life-audience','walk'].map(id=>document.getElementById(id).getBoundingClientRect().bottom))}));assert(metrics.bottom<=height+1,JSON.stringify({id,width,height,metrics}));assert(metrics.scroll<=height+1,JSON.stringify({id,width,height,metrics}));assert(metrics.wide<=width+1);assert(metrics.frame>=40);if(mode==='mirrored'&&['s16','s21','s40','s43'].includes(id)){const sizes={s16:57,s21:24,s40:50,s43:24},scale=await page.locator('#question-image').evaluate(n=>parseFloat(n.style.width)/800);assert(scale*sizes[id]>=12,JSON.stringify({id,width,scale}));checks++;}checks+=4;
  if(width===390||id==='s16'&&width===320)await page.screenshot({path:'/tmp/hkm-street-'+id+'-'+mode+'-'+width+'.png',fullPage:true});
 }
 // Sharing uses the authored clue rectangle rather than an unrelated centre crop.
 for(const id of ['s16','s40']){const q=bank.find(q=>q.id===id);await seed(q,'mirrored');await page.locator(`[data-choice="${(q.answer+1)%4}"]`).click();await page.locator('#confirm-answer').click();await page.locator('#result-screen').waitFor({state:'visible'});await page.locator('#question-challenge').click();await page.locator('#question-share-preview').waitFor({state:'visible'});await page.locator('#question-share-preview').evaluate(i=>i.decode());assert.equal(await page.locator('#question-share-preview').evaluate(i=>i.naturalWidth),1080);await page.locator('#question-share-preview').screenshot({path:'/tmp/hkm-street-share-'+id+'.png'});checks++;}
 const gallery=await c.newPage();await gallery.goto(base,{waitUntil:'networkidle'});await gallery.setViewportSize({width:1400,height:1000});const panels=bank.map(q=>({id:q.id,url:new URL('../'+manifest.assets['hong-kong-millionaire/assets/'+q.art+'.svg'],base).href}));
 await gallery.evaluate(panels=>{document.head.innerHTML='<style>body{margin:0;padding:20px;background:#e7dfc9;font:17px sans-serif}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.panel{background:#fff5dc;border:2px solid #294435}.panel img{width:100%;display:block}.panel b{display:block;padding:5px}</style>';document.body.innerHTML='<main class="grid"></main>';for(const p of panels){const card=document.createElement('div');card.className='panel';const image=new Image();image.src=p.url;const label=document.createElement('b');label.textContent=p.id;card.append(image,label);document.querySelector('main').append(card);}},panels);await gallery.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));await gallery.screenshot({path:'/tmp/hkm-street-art-gallery.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,topics:bank.length,presentations:fixtures.size,pageErrors:errors.length}));await c.close();
}finally{await browser.close();}
