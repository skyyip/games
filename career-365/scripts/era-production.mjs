import assert from 'node:assert/strict';
import {LifeGame,SAVE_KEY} from '../src/game.js';
import {JOBS} from '../src/content.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5287/games/career-365/',browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'}),origin=new URL(base).origin;
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const g=new LifeGame({seed:123,name:'離線也接得上時代'});g.chooseCareer(JOBS.find(j=>j.name==='咖啡師').id);g.s.cash=100000;g.setEraAuto(false);g.enrollEraSpecialty('small-business-ai');g.studyEraSpecialty('small-business-ai');g.exploreEra('ai');assert(g.s.pending);
 await context.addInitScript(({key,s})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},{key:SAVE_KEY,s:g.s});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));
 await p.goto(base,{waitUntil:'networkidle'});await p.locator('#continue').click();await p.locator('#growth-dialog .primary').click();await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload({waitUntil:'networkidle'});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await p.reload({waitUntil:'domcontentloaded'});await p.locator('#continue').click();assert(await p.locator('#growth-dialog').isHidden());assert.match(await p.locator('#story').textContent(),/無人咖啡店/);await p.locator('[data-choice="1"]').click();
 const state=()=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);let s=await state();assert.equal(s.era.history.length,1);assert.equal(s.era.threads.ai.route,1);assert.equal(s.era.courses['small-business-ai'].credits,1);
 const month=s.month;await p.locator('#month').click();await p.waitForFunction(({key,month})=>JSON.parse(localStorage.getItem(key)).month===month+1,{key:SAVE_KEY,month});s=await state();if(s.pending)await p.locator('[data-choice]').last().click();await p.locator('#era-open').click();await p.locator('#era-tab-courses').click();await p.locator('[data-era-study="small-business-ai"]').click();s=await state();assert.equal(s.era.courses['small-business-ai'].credits,2);assert.equal(s.life.entry.practice,0);assert(LifeGame.restore(s));assert.deepEqual(errors,[]);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));console.log(JSON.stringify({production:true,installedOffline:true,pendingStoryResumed:true,courseContinued:true,historyRetained:true,externalServices:false}));await context.close();
}finally{await browser.close();}
