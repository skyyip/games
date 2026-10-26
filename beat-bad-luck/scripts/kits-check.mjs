import {endRitual} from './interaction-helpers.mjs';
import {buyAndContinue} from './purchase-helpers.mjs';
import {DURATIONS} from '../src/game.js';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {WEAPONS} from '../src/catalog.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5173/beat-bad-luck/';
const kits=[['iron-hammer',400,550,4.55,'大鐵鎚'],['triple-trio',5000,6000,7,'賽馬會3T'],['marksix-snowball',6000,6500,10.5,'六合彩金多寶'],['rebirth-paper',18000,18000,19.6,'投胎紙做李嘉誠個仔']];
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
const click=(page,selector)=>page.locator(selector).evaluate(element=>element.click());
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')));
async function setup(width,language,merit=20000,coins=50000){
 const context=await browser.newContext({viewport:{width,height:width<700?812:1100},isMobile:width<700,hasTouch:width<700,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
 await context.addInitScript(({language,merit,coins})=>{localStorage.setItem('playground.language.v1',language);if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({version:1,coins,merit,owned:['flipflop','fortune-child'],equipped:'fortune-child',decor:{},records:[{score:40,hits:4,weapon:'fortune-child',date:1}],friends:[],lastSeen:Date.now()}));},{language,merit,coins});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();return {context,page};
}
async function reachBeat(page){await click(page,'#start');for(let i=0;i<3;i++)await click(page,`[data-stick="${i}"]`);await click(page,'#blow');await page.clock.fastForward(2050);await click(page,'#confirm-worry');await page.clock.fastForward(2050);assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'beat');}
try{
 await mkdir('/tmp/bbl-kits-qa',{recursive:true});
 for(const [width,language]of [[320,'zh-Hant'],[375,'zh-Hant'],[1440,'en']]){
  const {context,page}=await setup(width,language);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  if(language==='zh-Hant'){assert.match(await page.locator('#equipped-name').textContent(),/轉運童子/);assert.match(await page.locator('#records').textContent(),/轉運童子/);assert.ok(!(await page.locator('#records').textContent()).includes('轉童子'));}
  await click(page,'#tab-kits');assert.equal(await page.locator('[data-weapon]').count(),WEAPONS.filter(w=>!w.starter).length);
  const distinct=new Set();for(const [id,merit,cost,multiplier,name]of kits){
   const row=page.locator(`[data-weapon="${id}"]`).locator('..');assert.ok((await row.textContent()).includes(`×${multiplier}`));distinct.add(await row.locator('svg').innerHTML());if(language==='zh-Hant')assert.ok((await row.textContent()).includes(name));assert.equal(await page.locator(`[data-weapon="${id}"]`).isDisabled(),false);
  }assert.equal(distinct.size,4);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#weapon-list').screenshot({path:`/tmp/bbl-kits-qa/kits-${width}.png`});
  for(const [id,merit,cost,multiplier]of kits){
   const before=(await saved(page)).coins;await buyAndContinue(page,`[data-weapon="${id}"]`);assert.equal((await saved(page)).coins,before-cost);assert.equal((await saved(page)).merit,20000);assert.equal((await saved(page)).equipped,id);
   await reachBeat(page);await click(page,'#hit-zone');await page.clock.runFor(20);assert.equal(Number(await page.locator('#live-score').textContent()),Math.round(15*multiplier));assert.equal((await saved(page)).weaponUses[id],1);assert.equal((await saved(page)).equipped,id);assert.equal(await page.locator('#striking-weapon svg').count(),1);
   await click(page,'#pause');await endRitual(page);await reachBeat(page);await click(page,'#hit-zone');assert.ok(!(await saved(page)).owned.includes(id));assert.equal((await saved(page)).equipped,'bare-hand');
   if(id==='rebirth-paper'){
    await page.clock.fastForward(DURATIONS.beat+100);await click(page,'#feed');await page.clock.fastForward(1600);await click(page,'#bless');await page.clock.fastForward(1600);assert.equal(await page.locator('#result').isVisible(),true);assert.equal((await saved(page)).records[0].weapon,id);await click(page,'#to-stall');
   }else{await click(page,'#pause');await endRitual(page);}
   await click(page,'#tab-kits');assert.equal(await page.locator(`[data-weapon="${id}"]`).isDisabled(),(await saved(page)).coins<cost);
  }
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').waitFor();assert.equal((await saved(page)).equipped,'bare-hand');assert.equal((await saved(page)).records[0].weapon,'rebirth-paper');for(const [id]of kits)assert.ok(!(await saved(page)).owned.includes(id));
  await context.close();pass(`${width}px ${language}: four unique icons, exact prices, live multipliers, two-use consumption, rebuy controls, renamed old saves and result persistence`);
 }
 {
  for(const [id,merit,cost]of kits){
   for(const [balance,points,disabled]of [[cost,merit-1,true],[cost-1,merit,true],[cost,merit,false]]){
    const {context,page}=await setup(375,'zh-Hant',points,balance);await click(page,'#tab-kits');assert.equal(await page.locator(`[data-weapon="${id}"]`).isDisabled(),disabled,`${id}: ${points} merit / ${balance} oil`);await context.close();
   }
  }
  pass('each new kit stays locked below its exact merit or oil requirement and unlocks at both thresholds');
 }

 assert.deepEqual(errors,[]);console.log(`${checks} new-kit browser scenarios passed with no page errors.`);
}finally{await browser.close();}
