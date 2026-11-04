import assert from 'node:assert/strict';
import {LifeGame,SAVE_KEY} from '../src/game.js';
import {JOBS} from '../src/content.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5285/career-365/';
const browser=await chromium.launch({headless:true});
async function enter(p){await p.locator('#continue').click();if(await p.locator('#growth-dialog').isVisible())await p.locator('#growth-dialog .primary').click();}
try{for(const [width,height]of [[320,568],[390,844],[812,375],[1280,900]]){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'}),origin=new URL(base).origin;
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 const g=new LifeGame({seed:123,name:'咖啡街的新故事'});g.chooseCareer(JOBS.find(j=>j.name==='咖啡師').id);g.s.cash=100000;g.setEraAuto(false);
 await context.addInitScript(({key,s})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},{key:SAVE_KEY,s:g.s});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});await enter(p);
 const state=()=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
 assert.match(await p.locator('#era-summary').textContent(),/2026年11月/);await p.locator('#era-open').click();assert(await p.locator('#era-dialog').isVisible());
 await p.locator('#era-filter').selectOption('all');assert.equal(await p.locator('.era-card').count(),9);await p.locator('.era-card details summary').first().click();assert.match(await p.locator('.era-card details').first().textContent(),/2026-/);
 assert.equal(await p.locator('.era-card a[href^="https://"]').count(),10);await p.locator('#era-tab-topics').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#era-tab-courses').getAttribute('aria-selected'),'true');assert.equal(await p.locator('#era-panel .era-card').count(),12);
 await p.locator('[data-era-enroll="small-business-ai"]').click();let s=await state();assert(s.era.courses['small-business-ai']);assert.equal(s.cash,98800);await p.locator('[data-era-study="small-business-ai"]').click();s=await state();assert.equal(s.era.courses['small-business-ai'].credits,1);assert.equal(s.cash,98450);assert.equal(s.life.entry.practice,0);
 await p.locator('[data-era-pause="small-business-ai"]').click();assert((await state()).era.courses['small-business-ai'].paused);await p.locator('[data-era-pause="small-business-ai"]').click();assert(!(await state()).era.courses['small-business-ai'].paused);
 await p.locator('#era-tab-topics').click();await p.locator('[data-close="era-dialog"]').click();await p.locator('#month').click();await p.waitForFunction(({key,month})=>JSON.parse(localStorage.getItem(key)).month===month+1,{key:SAVE_KEY,month:g.s.month});s=await state();if(s.pending){await p.locator('[data-choice]').last().click();s=await state();}assert.equal(s.month,g.s.month+1);
 await p.locator('#era-open').click();await p.locator('[data-era-story="ai"]').click();s=await state();assert.equal(s.pending.id,'era-event');assert.match(await p.locator('#story').textContent(),/無人咖啡店/);assert(await p.locator('#month').isDisabled());assert.equal(await p.locator('[data-choice]').count(),4);
 await p.reload({waitUntil:'networkidle'});await enter(p);assert.equal((await state()).pending.eraEvent.stage,0);await p.locator('[data-choice="2"]').click();s=await state();assert.equal(s.era.threads.ai.route,2);assert.equal(s.era.history.length,1);assert.match(await p.locator('#era-summary').textContent(),/跨職業協作/);assert(await p.locator('#era-summary details').getAttribute('open')!==null);
 await p.locator('#era-open').click();assert(await p.locator('[data-era-story="ai"]').isDisabled());await p.locator('#era-tab-history').click();assert.match(await p.locator('#era-panel').textContent(),/原職務 咖啡師/);assert.equal(await p.locator('.era-history li').count(),1);await p.locator('[data-close="era-dialog"]').click();assert(LifeGame.restore(await state()));
 assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);await p.locator('#era-open').click();await p.locator('#era-tab-topics').click();assert(!await p.locator('#era-dialog').evaluate(e=>e.scrollWidth>e.clientWidth));await p.screenshot({path:`/tmp/career-era-${width}.png`});console.log(`PASS ${width}x${height}:9 themes,dated sources,keyboard tabs,12 specialties,paid study/pause,resumed coffee story,history,no overflow,no page errors`);await context.close();
}}finally{await browser.close();}
