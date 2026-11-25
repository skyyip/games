import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});let checks=0,renderedQuestions=0,renderedNew=0;const errors=[];
const pools={classic:BANK,air:AIR_BANK,hybrid:MIXED_BANK,picture:PICTURE_BANK};
const best=q=>q.correct??q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((winner,value,i,all)=>value>all[winner]?i:winner,0);
async function open(width=390,{fixture=false}={}){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<600,isMobile:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 if(fixture)await context.route('**/src/app.js',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('../src/app.js',import.meta.url),'utf8')+`
 globalThis.questionQA={normal(f,kind,i){$('modal').close();duoTestPhase=false;faction=f;index=0;hp=100;correct=0;classicCorrect=0;questionCount=12;runAnswers=[];runSettled=false;const pool={classic:BANK,air:AIR_BANK,hybrid:MIXED_BANK,picture:PICTURE_BANK}[kind],q=pool[f][i];const chosen=kind==='hybrid'?q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((b,v,j,a)=>v>a[b]?j:b,0):q.correct;questions=[{...q,kind:kind==='picture'?'classic':kind,correct:chosen,legacyIndex:kind==='classic'?i:-1}];$('game').classList.remove('duo-mode');show('game');renderQuestion()},duo(i){$('modal').close();duoSetupQuestions=[[...BANK.duo,...PICTURE_BANK.duo][i],...BANK.duo.slice(0,4)];duoExpected=[];duoTestAnswers=[];duoTestPhase=false;$('modalContent').className='duo-flow';$('modal').showModal();renderDuoSetup(0)}};`}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-25T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-25T00:00:01Z'));await page.goto(base);return {context,page};
}
async function seed(page,value){await page.evaluate(seed=>{Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)},value)}
function plannedSeed(faction){
 for(let seed=1;seed<100000;seed++){
  let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
  if(faction==='duo'){if(shuffle(BANK.duo).slice(0,4).every(q=>q.tag==='日常加映'))return {seed};continue}
  const classic=shuffle(BANK[faction]).slice(0,3);shuffle(PICTURE_BANK[faction]);
  const air=shuffle(AIR_BANK[faction]).slice(0,4),hybrid=shuffle(MIXED_BANK[faction]).slice(0,3);
  const added=Object.fromEntries(Object.entries({classic,air,hybrid}).map(([k,qs])=>[k,qs.filter(q=>q.tag==='日常加映').length]));
  if(Object.values(added).every(n=>n>0))return {seed,added};
 }
 throw Error('No scenario seed for '+faction);
}
async function completeInteraction(page){
 if(await page.locator('#tapBtn').isVisible())for(let n=0;n<15;n++)await page.locator('#tapBtn').click({force:true});
 if(await page.locator('#holdBtn').isVisible()){await page.locator('#holdBtn').focus();await page.keyboard.down('Space');await page.clock.runFor(1700);await page.keyboard.up('Space')}
 if(await page.locator('#treatBtn').isVisible())await page.locator('#treatBtn').click();if(await page.locator('#cupBtn').isVisible())await page.locator('#cupBtn').click();
}
async function round(faction,width){
 const {context,page}=await open(width),plan=plannedSeed(faction);await page.locator(`[data-faction="${faction}"]`).click();await seed(page,plan.seed);await page.locator('#startBtn').click();const added={classic:0,air:0,hybrid:0};
 for(let i=0;i<12;i++){
  await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);
  const text=await page.locator('#questionText').textContent(),q=[...BANK[faction],...AIR_BANK[faction],...MIXED_BANK[faction],...PICTURE_BANK[faction]].find(q=>q.text===text);assert(q);
  const kind=page.locator('#questionTag');if(q.tag==='日常加映'){const label=await kind.textContent();added[label.includes('經典')?'classic':label.includes('閱讀')?'air':'hybrid']++;if(Object.values(added).reduce((a,b)=>a+b,0)===1)await page.screenshot({path:`/tmp/yrgt-question-prompt-${faction}.png`,fullPage:true,animations:'disabled'})}
  assert.deepEqual(await page.locator('#answers .answer-copy').allTextContents(),q.opts);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=2;
  await completeInteraction(page);
  await page.locator('#answers button').nth(best(q)).evaluate(button=>button.click());assert((await page.locator('#questionHint').textContent()).includes(q.why));checks++;
  await page.locator('#nextQuestionBtn').click();
 }
 await page.locator('#result').waitFor({state:'visible'});assert.equal(await page.locator('#resultCorrect').textContent(),'12 / 12');assert.equal(await page.locator('#resultCoins').textContent(),'300 SC');assert.deepEqual(added,plan.added);checks+=3;
 await page.screenshot({path:`/tmp/yrgt-question-round-${faction}.png`,fullPage:true,animations:'disabled'});await context.close();
}
try{
 if(process.env.YRGT_SOURCE_FIXTURES==='1'){
  const {context,page}=await open(320,{fixture:true});
  for(const [kind,bank]of Object.entries(pools))for(const faction of ['women','men','dog','cat'])for(let i=0;i<bank[faction].length;i++){
   const q=bank[faction][i];
   await page.evaluate(([f,k,i])=>questionQA.normal(f,k,i),[faction,kind,i]);assert.equal(await page.locator('#questionText').textContent(),q.text);
   assert.deepEqual(await page.locator('#answers .answer-copy').allTextContents(),q.opts);await completeInteraction(page);await page.locator('#answers button').nth(best(q)).evaluate(b=>b.click());assert((await page.locator('#questionHint').textContent()).includes(q.why));
   assert(await page.locator('.polaroid-back').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=5;renderedQuestions++;if(q.tag==='日常加映')renderedNew++;
  }
  for(let i=0;i<BANK.duo.length+1;i++){
   const q=[...BANK.duo,...PICTURE_BANK.duo][i];await page.evaluate(i=>questionQA.duo(i),i);assert.equal(await page.locator('.duo-question-text').textContent(),q.text);
   assert.equal(await page.locator('.duo-setup-answers button').count(),4);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=3;renderedQuestions++;if(q.tag==='日常加映')renderedNew++;
  }
  assert.equal(renderedQuestions,448);assert.equal(renderedNew,60);await context.close();
 }
 await Promise.all([round('women',320),round('men',390),round('dog',430),round('cat',1280)]);
 // Select four new personal-preference prompts plus the existing picture through the real flow.
 {
  const {context,page}=await open();await page.locator('[data-faction="duo"]').click();await seed(page,plannedSeed('duo').seed);await page.locator('#startBtn').click();const choices=[2,3,1,0,2];let added=0;
  for(let i=0;i<5;i++){
   const text=await page.locator('.duo-question-text').textContent();const q=[...BANK.duo,...PICTURE_BANK.duo].find(q=>q.text===text);assert(q);if(q.tag==='日常加映')added++;
   await page.locator('.duo-setup-answers button').nth(choices[i]).click();
  }
  assert.equal(added,4);await page.locator('#duoBeginTest span').click();
  for(let i=0;i<5;i++){await page.waitForFunction(n=>document.querySelector('#questionNo').textContent===String(n).padStart(2,'0'),i+1);assert.equal(await page.locator('.duo-answer-compare').count(),0);checks++;await page.locator('#answers button').nth(choices[i]).click();await page.clock.runFor(700)}
  await page.locator('.duo-results').waitFor({state:'visible'});assert((await page.locator('.duo-score').textContent()).startsWith('5'));assert.equal(await page.locator('.duo-answer-compare').count(),5);checks+=3;
  await page.screenshot({path:'/tmp/yrgt-question-duo.png',fullPage:true,animations:'disabled'});await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,renderedQuestions,newPromptsRendered:renderedNew,seededRounds:4,newPerRound:'all three types',newDuoPrompts:4,privatePreferenceAnswers:true,pageErrors:errors.length}));
}finally{await browser.close()}
