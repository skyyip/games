import {installContentAccount} from './content-account-fixture.mjs';
// Daily-quiz controls with a test-only authenticated account adapter; no production writes.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {LOCAL_QUESTIONS as bank} from '../src/local-questions.js';
import {newRun,hkDay,questionId,act} from '../src/game.js';
import {questionView} from '../src/question-view.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,KEY='qa.hkm.content-run',DAY=hkDay(Date.UTC(2026,10,26,4));
const ids=new Set(bank.map(q=>q.id)),fixtures=new Map();
for(let day=DAY;day<DAY+160;day++)for(let index=0;index<15;index++){const id=questionId(day,index);if(ids.has(id)&&!fixtures.has(id))fixtures.set(id,{day,index})}
assert.equal(fixtures.size,60);
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await installContentAccount(context,base);
 await context.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;const Native=Date;globalThis.__localNow=Number(localStorage.getItem('qa.local.now'))||Native.now();globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[__localNow]))}static now(){return __localNow}}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});
 async function seed(q,width){
  const {day,index}=fixtures.get(q.id),now=day*86400000+3600000,run={...newRun(day,now),index,correct:index};
  await page.setViewportSize({width,height:900});await page.evaluate(({KEY,run,now})=>{localStorage.setItem('qa.local.now',now);localStorage.setItem(KEY,JSON.stringify({day:run.day,owner:'guest',token:crypto.randomUUID(),revision:0,run}))},{KEY,run,now});
  await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();await page.locator('#options button').first().waitFor();return run;
 }
 for(const [i,q]of bank.entries()){
  const run=await seed(q,[320,390,1280][i%3]);assert.equal(await page.locator('#question-title').textContent(),q.question);assert.equal(await page.locator('#options button').count(),4);
  assert.deepEqual((await page.locator('#options [data-choice]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.choice)))).sort(),[0,1,2,3]);
  if(q.textOnly){assert(await page.locator('#text-visual').isVisible());assert(!(await page.locator('#question-image').isVisible()))}else{await page.locator('#question-image').evaluate(i=>i.decode());assert.equal(await page.locator('#question-image').getAttribute('data-mode'),'original')}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=5;
  if(i%10===0)await page.screenshot({path:`/tmp/hkm-local60-${q.id}.png`,fullPage:false,animations:'disabled'});
  await page.locator(`[data-choice="${q.answer}"]`).click();await page.locator('#confirm-answer').click();
  await page.waitForFunction(({KEY,index})=>JSON.parse(localStorage.getItem(KEY)).run.answers[index],{KEY,index:run.index});
  const after=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).run,KEY);assert.equal(after.answers[run.index].qid,q.id);assert.equal(after.answers[run.index].outcome,'correct');assert.equal(after.correct,run.index+1);checks+=3;
  if(run.index<14){assert.equal(await page.locator('#reveal-explanation').textContent(),q.explanation);checks++}
 }
 // A wrong answer still cites this question and uses the existing insurance settlement.
 const wrong=bank.find(q=>fixtures.get(q.id).index>=5),run=await seed(wrong,320);await page.locator(`[data-choice="${(wrong.answer+1)%4}"]`).click();await page.locator('#confirm-answer').click();
 await page.waitForFunction(KEY=>JSON.parse(localStorage.getItem(KEY)).run.phase==='finished',KEY);const after=await page.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).run,KEY);
 assert.equal(after.payout,act(run,{type:'answer',choice:(wrong.answer+1)%4},run.questionAt+1000).payout);assert.equal(after.answers[run.index].qid,wrong.id);checks+=2;
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,newQuestions:bank.length,viewports:[320,390,1280],actualAnswers:true,textAndIllustrated:true,wrongAnswerInsurance:true,pageErrors:errors.length}));await context.close();
}finally{await browser.close()}
