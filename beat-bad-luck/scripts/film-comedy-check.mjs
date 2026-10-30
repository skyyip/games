import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {FILM_WEAPONS,FILM_DECOR,FILM_SKINS} from '../src/film-comedy.js';
import {DECOR,weaponDurability} from '../src/catalog.js';
import {fresh,STORAGE_KEY} from '../src/progress.js';
import {hkDay} from '../src/ritual-rewards.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5260/beat-bad-luck/',out='/tmp/bbl-film-comedy';
const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY),click=(p,s)=>p.locator(s).evaluate(n=>n.click());
const close=async(p,id)=>{await p.locator(`#${id} .modal-close`).click();await p.locator('#'+id).waitFor({state:'hidden'});};
await mkdir(out,{recursive:true});
try{for(const[width,height,language]of[[390,844,'zh-Hant'],[320,568,'en'],[1280,900,'en']]){
 const c=await browser.newContext({viewport:{width,height},hasTouch:width<900,serviceWorkers:'block',reducedMotion:'reduce'});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await c.addInitScript(({seed,key,language})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));localStorage.setItem('playground.language.v1',language);Math.random=()=>.4;},{seed:{...fresh(),coins:1e6,merit:1e6,lastDaily:hkDay(Date.now())},key:STORAGE_KEY,language});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});
 const name=item=>language==='zh-Hant'?item.nameZh:item.name;
 async function buy(selector,item,cost,kind){
  const before=await read(p);await p.locator(selector).click();assert(await p.locator('#purchase-dialog').isVisible());assert.equal(await p.locator('#purchase-title').textContent(),name(item));assert.equal(await p.locator('#purchase-detail').textContent(),language==='zh-Hant'?item.description:item.descriptionEn);
  assert.equal((await read(p)).coins,before.coins);await p.locator('#purchase-art svg').waitFor();await p.locator('#purchase-action').click();await p.waitForFunction(()=>document.querySelector('#purchase-dialog').dataset.pending==='false');const saved=await read(p);assert.equal(saved.coins,before.coins-cost,item.id);
  if(kind==='weapon')assert.equal(saved.weaponUses[item.id],weaponDurability(item.id));if(kind==='skin')assert.equal(saved.skinUses[item.id],10);if(kind==='decor')assert.equal(saved.decor[item.id],1);
  await p.locator('#purchase-continue').click();await p.locator('#purchase-dialog').waitFor({state:'hidden'});
 }
 await click(p,'#tab-kits');for(const item of FILM_WEAPONS){await p.locator('#kit-search').fill(name(item));const row=p.locator('.kit-row').filter({has:p.locator(`[data-weapon="${item.id}"]`)});assert(await row.isVisible());assert.equal(await row.locator('.kit-art svg').count(),1);if(width===390||item===FILM_WEAPONS.at(-1))await buy(`[data-weapon="${item.id}"]`,item,item.cost,'weapon');}await p.locator('#kit-search').fill('');await close(p,'collection-dialog-shop-kits');
 await click(p,'#tab-stall');for(const item of FILM_DECOR){await p.locator('#decor-search').fill(name(item));const row=p.locator('.decor-row').filter({has:p.locator(`[data-decor="${item.id}"]`)});assert(await row.isVisible());assert.equal(await row.locator('.decor-icon svg').count(),1);if(width===390||item===FILM_DECOR.at(-1))await buy(`[data-decor="${item.id}"]`,item,DECOR.find(d=>d.id===item.id).cost,'decor');}await p.locator('#decor-search').fill('');await close(p,'collection-dialog-shop-stall');
 await p.locator('#prepare-skin>summary').click();await p.locator('#all-skins-label').click();for(const item of FILM_SKINS){assert.equal(await p.locator(`[data-skin="${item.id}"] svg.collectible-skin`).count(),1);if(width===390||item===FILM_SKINS.at(-1))await buy(`[data-skin="${item.id}"]`,item,item.cost,'skin');}
 await p.screenshot({path:`${out}/papers-${width}.png`});await close(p,'skin-catalog-dialog');
 if(width===390){
  await p.locator('#open-stall-showcase').click();for(const item of FILM_DECOR)assert.equal(await p.locator(`#stall-extension [data-piece="${item.id}"] svg`).count(),2);await p.screenshot({path:`${out}/stall-${width}.png`});await p.locator('#configure-altar').click();for(const item of FILM_DECOR.slice(0,5))await p.locator(`[data-altar-choice="${item.id}"]`).click();await p.locator('#altar-save').click();await p.locator('#altar-config-dialog').waitFor({state:'hidden'});await close(p,'stall-showcase-dialog');
 }
 const before=await read(p);await p.reload({waitUntil:'networkidle'});const reloaded=await read(p);for(const key of ['coins','merit','weaponUses','skinUses','decor','altarDecor'])assert.deepEqual(reloaded[key],before[key],key);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#worry-select').selectOption('work');await click(p,'#start');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);if(width===390)assert.equal(await p.locator('[data-altar-prop]').count(),5);await click(p,'#blow');await p.clock.fastForward(2100);await click(p,'#confirm-worry');await p.clock.fastForward(2100);
 for(let i=0;i<88;i++){await p.locator('#hit-zone').press('Space');await p.clock.runFor(60);}assert(await p.locator('#finisher-launch').isEnabled());await click(p,'#finisher-launch');assert.equal(await p.locator('.weapon-signature').getAttribute('data-weapon'),'film-moon-pass');assert.equal(await p.locator('.film-finisher-motif').count(),1);assert.equal(await p.locator('#paper-doll .paper-worn-skin').count(),1);await p.screenshot({path:`${out}/burst-${width}.png`});await p.clock.runFor(10100);await p.clock.fastForward(60000);await click(p,'#feed');await p.clock.fastForward(1700);await click(p,'#purify-next');await p.clock.fastForward(1100);await click(p,'#throw-blocks');await p.clock.fastForward(2500);assert(await p.locator('#result').isVisible());
 const after=await read(p);assert.equal(after.weaponUses['film-moon-pass'],weaponDurability('film-moon-pass')-1);assert.equal(after.skinUses['film-firecloud'],9);assert.equal(after.rituals,1);assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${language}: 24 new items searchable/rendered, confirmed purchases, exact balances and inventory, reload, film finisher, progressive wear and complete ritual${width===390?', all 24 bought and five new props on altar':''}.`);await c.close();
}}finally{await browser.close();}
