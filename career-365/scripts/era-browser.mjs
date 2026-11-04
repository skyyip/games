import {installLifeHelpers,clickAndWait} from './browser-state.mjs';
import assert from 'node:assert/strict';
import {LifeGame,SAVE_KEY} from '../src/game.js';
import {JOBS} from '../src/content.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5285/career-365/';
const browser=await chromium.launch({headless:true});
await installLifeHelpers(browser);
async function enter(p){await clickAndWait(p.locator('#continue'));await p.waitForFunction(()=>document.getElementById('game')?.hidden===false&&document.getElementById('save-state')?.textContent!=='儲存中…');if(await p.locator('#growth-dialog').isVisible())await clickAndWait(p.locator('#growth-dialog .primary'));}
try{for(const [width,height]of [[320,568],[390,844],[812,375],[1280,900]]){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'}),origin=new URL(base).origin;
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const g=new LifeGame({seed:123,name:'咖啡街的新故事'});g.chooseCareer(JOBS.find(j=>j.name==='咖啡師').id);g.s.cash=100000;g.setEraAuto(false);
 await context.addInitScript(({key,s})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},{key:SAVE_KEY,s:g.s});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});await enter(p);
 const state=()=>p.evaluate(async key=>(await globalThis.__careerTestRead(key)),SAVE_KEY);
 assert.match(await p.locator('#era-summary').textContent(),/2026年11月/);await clickAndWait(p.locator('#era-open'));assert(await p.locator('#era-dialog').isVisible());
 await p.locator('#era-filter').selectOption('all');assert.equal(await p.locator('.era-card').count(),9);await clickAndWait(p.locator('.era-card details summary').first());assert.match(await p.locator('.era-card details').first().textContent(),/2026-/);
 assert.equal(await p.locator('.era-card a[href^="https://"]').count(),10);await p.locator('#era-tab-topics').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#era-tab-courses').getAttribute('aria-selected'),'true');assert.equal(await p.locator('#era-panel .era-card').count(),12);
 await clickAndWait(p.locator('[data-era-enroll="small-business-ai"]'));let s=await state();assert(s.era.courses['small-business-ai']);assert.equal(s.cash,98800);await clickAndWait(p.locator('[data-era-study="small-business-ai"]'));s=await state();assert.equal(s.era.courses['small-business-ai'].credits,1);assert.equal(s.cash,98450);assert.equal(s.life.entry.practice,0);
 await clickAndWait(p.locator('[data-era-pause="small-business-ai"]'));assert((await state()).era.courses['small-business-ai'].paused);await clickAndWait(p.locator('[data-era-pause="small-business-ai"]'));assert(!(await state()).era.courses['small-business-ai'].paused);
 await clickAndWait(p.locator('#era-tab-topics'));await clickAndWait(p.locator('[data-close="era-dialog"]'));await clickAndWait(p.locator('#month'));await p.waitForFunction(async ({key,month})=>(await globalThis.__careerTestRead(key)).month===month+1,{key:SAVE_KEY,month:g.s.month});s=await state();if(s.pending){await clickAndWait(p.locator('[data-choice]').last());s=await state();}assert.equal(s.month,g.s.month+1);
 await clickAndWait(p.locator('#era-open'));await clickAndWait(p.locator('[data-era-story="ai"]'));s=await state();assert.equal(s.pending.id,'era-event');assert.match(await p.locator('#story').textContent(),/無人咖啡店/);assert(await p.locator('#month').isDisabled());assert.equal(await p.locator('[data-choice]').count(),4);
 await p.reload({waitUntil:'networkidle'});await enter(p);assert.equal((await state()).pending.eraEvent.stage,0);await clickAndWait(p.locator('[data-choice="2"]'));s=await state();assert.equal(s.era.threads.ai.route,2);assert.equal(s.era.history.length,1);assert.match(await p.locator('#era-summary').textContent(),/跨職業協作/);assert(await p.locator('#era-summary details').getAttribute('open')!==null);
 await clickAndWait(p.locator('#era-open'));assert(await p.locator('[data-era-story="ai"]').isDisabled());await clickAndWait(p.locator('#era-tab-history'));assert.match(await p.locator('#era-panel').textContent(),/原職務 咖啡師/);assert.equal(await p.locator('.era-history li').count(),1);await clickAndWait(p.locator('[data-close="era-dialog"]'));assert(LifeGame.restore(await state()));
 assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);await clickAndWait(p.locator('#era-open'));await clickAndWait(p.locator('#era-tab-topics'));assert(!await p.locator('#era-dialog').evaluate(e=>e.scrollWidth>e.clientWidth));await p.screenshot({path:`/tmp/career-era-${width}.png`});console.log(`PASS ${width}x${height}:9 themes,dated sources,keyboard tabs,12 specialties,paid study/pause,resumed coffee story,history,no overflow,no page errors`);await context.close();
}}finally{await browser.close();}
