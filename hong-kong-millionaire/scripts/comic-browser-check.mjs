// Real built pages and all 67 new question records; Firebase is deliberately disabled here.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {COMIC_QUESTIONS} from '../src/comic-questions.js';
import {newRun,act,hkDay,questionId,questionFor,presentation,DAY_MS,HK_OFFSET} from '../src/game.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL||'http://127.0.0.1:5444/games/hong-kong-millionaire/';
const built=process.env.HKM_BUILD_DIR||'/tmp/games-built-comic-edition',KEY='sky.hk-millionaire.today.v4',DAY=hkDay(Date.UTC(2026,10,15,4));
const manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8'));
const browser=await chromium.launch({headless:true}),errors=[],badResponses=[];let checks=0;
function planned(day,index,version){
 const now=day*DAY_MS-HK_OFFSET+12*3600000;let run=newRun(day,now);if(version)run.bankVersion=version;
 for(let i=0;i<index;i++){run=act(run,{type:'answer',choice:questionFor(run).answer},now+100+i*200);run=act(run,{type:'next'},now+200+i*200);}
 return {now:run.questionAt+100,run};
}
try{
 const c=await browser.newContext({viewport:{width:390,height:900},serviceWorkers:'block'});
 await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 await c.addInitScript(()=>{
  globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;const Native=Date;globalThis.__comicNow=Number(localStorage.getItem('qa.comic.now'))||Native.now();
  globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.__comicNow]));}static now(){return globalThis.__comicNow;}};
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>globalThis.__comicShare=value}});
 });
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)badResponses.push(r.url());});
 await p.goto(base,{waitUntil:'networkidle'});
 async function seed(value){
  await p.evaluate(({key,value})=>{localStorage.setItem('qa.comic.now',String(value.now));localStorage.setItem(key,JSON.stringify({day:value.run.day,owner:'guest',token:crypto.randomUUID(),revision:0,run:value.run}));},{key:KEY,value});
  await p.reload({waitUntil:'networkidle'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});
 }
 for(const q of COMIC_QUESTIONS){
  let match;for(let day=DAY;day<DAY+180&&!match;day++)for(let index=0;index<15;index++)if(questionId(day,index)===q.id){match={day,index};break;}
  assert(match,q.id+' unreachable');const value=planned(match.day,match.index);await seed(value);
  assert.equal(await p.locator('#question-title').textContent(),q.question);assert.equal(await p.locator('#options button').count(),4);
  const mode=presentation(match.day,match.index).mode;
  if(mode!=='text'){await p.locator('#question-image').evaluate(img=>img.decode());assert.equal(await p.locator('#question-image').evaluate(img=>img.naturalWidth/img.naturalHeight),1.6);}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.locator(`[data-choice="${q.answer}"]`).click();await p.locator('#confirm-answer').click();
  await p.waitForFunction(({key,index,id})=>JSON.parse(localStorage.getItem(key)).run.answers[index]?.qid===id,{key:KEY,index:value.run.index,id:q.id});
  const after=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).run,KEY);assert.equal(after.answers[value.run.index].qid,q.id);assert.equal(after.answers[value.run.index].outcome,'correct');
  if([1,9,18,35,54,55,61,65].includes(q.sourceNumber))await p.screenshot({path:'/tmp/hkm-comic-'+q.id+'.png',fullPage:true});checks+=5;
 }
 // Comic sharing remains deliberate and carries neither answer key nor explanation.
 const q=COMIC_QUESTIONS[34];let match;
 for(let day=DAY;day<DAY+180&&!match;day++)for(let index=0;index<15;index++)if(questionId(day,index)===q.id){match={day,index};break;}
 await seed(planned(match.day,match.index));await p.locator(`[data-choice="${(q.answer+1)%4}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#result-screen').waitFor({state:'visible'});
 await p.locator('#question-challenge').click();await p.locator('#question-share-preview').waitFor({state:'visible'});await p.locator('#question-share-preview').evaluate(i=>i.decode());
 assert.equal(await p.locator('#question-share-preview').evaluate(i=>i.naturalWidth),1080);await p.locator('#copy-question-share').click();assert(!(await p.evaluate(()=>globalThis.__comicShare)).includes(q.explanation));checks+=2;
 // Inspect every panel together using the exact built asset URLs.
 const gallery=await c.newPage();await gallery.goto(base,{waitUntil:'networkidle'});
 const panels=COMIC_QUESTIONS.map(q=>({id:q.id,url:new URL('../'+manifest.assets['hong-kong-millionaire/assets/'+q.art+'.svg'],base).href}));
 await gallery.setViewportSize({width:1200,height:1000});await gallery.evaluate(panels=>{document.head.innerHTML='<style>body{margin:0;padding:20px;background:#efe6ce;font:16px sans-serif}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.panel{border:2px solid #243335;background:#fff5dc}.panel img{width:100%;display:block}.panel b{display:block;padding:5px}</style>';document.body.innerHTML='<main class="grid"></main>';for(const panel of panels){const card=document.createElement('div');card.className='panel';const image=new Image();image.src=panel.url;const label=document.createElement('b');label.textContent=panel.id;card.append(image,label);document.querySelector('main').append(card);}},panels);
 await gallery.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));await gallery.screenshot({path:'/tmp/hkm-comic-art-gallery.png',fullPage:true});checks++;
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);await c.close();console.log(JSON.stringify({checks,questions:67,bank:'fresh v4',pageErrors:0}));
}finally{await browser.close();}
