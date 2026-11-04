import {installLifeHelpers,clickAndWait} from './browser-state.mjs';
import assert from 'node:assert/strict';
import {LifeGame,SAVE_KEY} from '../src/game.js';import {JOBS} from '../src/content.js';import {WORLD_EVENTS} from '../src/economy.js';
async function closeGrowth(page){await page.waitForFunction(()=>document.getElementById('game')?.hidden===false&&document.getElementById('save-state')?.textContent!=='儲存中…');await page.waitForTimeout(20);if(await page.locator('#growth-dialog').isVisible())await clickAndWait(page.locator('#growth-dialog .primary'));}
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5260/career-365/',browser=await chromium.launch({headless:true});
await installLifeHelpers(browser);
function fixture(){const g=new LifeGame({seed:123,name:'日常與選擇'});g.chooseCareer(JOBS[0].id);g.s.cash=1000000;g.roll=()=>.95;return g;}
async function state(p){return p.evaluate(async key=>(await globalThis.__careerTestRead(key)),SAVE_KEY);}
async function action(page,id){const target=page.locator(`[data-action="${id}"]`);await target.evaluate(el=>{for(let d=el.parentElement;d;d=d.parentElement)if(d.tagName==='DETAILS')d.open=true;});await clickAndWait(target);}
try{
 for(const [width,height]of [[320,568],[390,844],[812,375],[1280,900]]){
  const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});await ctx.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));
  await p.goto(base,{waitUntil:'networkidle'});
  async function load(g){assert(LifeGame.restore(g.s));await p.evaluate(async ({key,s})=>(await globalThis.__careerTestWrite(key,JSON.stringify(s))),{key:SAVE_KEY,s:g.s});await p.reload({waitUntil:'networkidle'});await clickAndWait(p.locator('#continue'));await closeGrowth(p);}
  let g=fixture();await load(g);const initial=await state(p);await action(p,'habit-exercise');await action(p,'habit-diet');await action(p,'habit-sleep');let s=await state(p);assert(s.habits.exercise>initial.habits.exercise);assert(s.habits.diet>initial.habits.diet);assert.equal(s.ap,0);
  g=fixture();g.s.healthData.illness={name:'測試休養',months:2};await load(g);await action(p,'treat');assert.equal((await state(p)).healthData.illness.months,1);
  g=fixture();g.s.stats.contacts=20;g.s.stats.reputation=80;await load(g);await clickAndWait(p.locator('[data-open-career]'));await p.locator('#job-search').fill('前端工程師');await clickAndWait(p.locator('.job-button'));assert.match(await p.locator('#career-selection').textContent(),/人脈 -4/);await clickAndWait(p.locator('#salary-sources summary'));assert.equal(await p.locator('#salary-sources a').count(),2);await clickAndWait(p.locator('#career-confirm'));s=await state(p);assert.equal(s.stats.contacts,16);assert.equal(s.level,0);
  g=fixture();await load(g);await action(p,'family-date');await clickAndWait(p.locator('[data-choice="0"]'));assert.equal((await state(p)).family.status,1);await action(p,'family-marry');await clickAndWait(p.locator('[data-choice="0"]'));assert.equal((await state(p)).family.status,2);await action(p,'family-child');await clickAndWait(p.locator('[data-choice="0"]'));assert.equal((await state(p)).family.children.length,1);
  g=fixture();g.triggerLifeEvent('investment-scam');await load(g);await clickAndWait(p.locator('[data-choice="1"]'));assert.equal((await state(p)).risks.scamLoss,Math.min(30000,g.salary)*.5);
  g=fixture();g.triggerLifeEvent('drug-temptation');await load(g);assert.match(await p.locator('#story').textContent(),/35% 遊戲機率/);await clickAndWait(p.locator('[data-choice="1"]'));assert((await state(p)).risks.dependence>=30);await action(p,'support');assert((await state(p)).risks.dependence<30|| (await state(p)).risks.dependence===25);
  g=fixture();g.triggerLifeEvent('kk-recruitment');g.resolve(1);await load(g);assert(await p.locator('[data-action=work]').isDisabled());await action(p,'support');assert.match(await p.locator('#story').textContent(),/不是受害者的錯/);await clickAndWait(p.locator('[data-choice="0"]'));assert.equal((await state(p)).risks.captivity,0);
  g=fixture();g.s.world=structuredClone(WORLD_EVENTS[0]);await load(g);assert.match(await p.locator('.world-status').textContent(),/地緣衝突/);await clickAndWait(p.locator('#finance-open'));await clickAndWait(p.locator('.asset-details summary'));assert.equal(await p.locator('.holding').count(),8);await p.locator('#trade-amount').fill('10000');for(const id of ['property','cards','derivatives'])await clickAndWait(p.locator(`[data-buy=${id}]`));s=await state(p);assert(s.assets.property>0&&s.assets.cards>0&&s.assets.derivatives>0);await clickAndWait(p.locator('[data-close=finance-dialog]'));
  assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: habits,treatment,transfer preview,salary sources,romance,marriage,parenthood,scam,drugs,recovery,trafficking support,world crisis,8 investments.`);await ctx.close();
 }
}finally{await browser.close();}
