import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fresh,STORAGE_KEY,DECOR_LIFETIME} from '../src/progress.js';
import {DECOR,WEAPONS} from '../src/catalog.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),errors=[];
const base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5229/beat-bad-luck/';
const folder='/tmp/bbl-shop-type';await mkdir(folder,{recursive:true});
const close=(a,b)=>assert.ok(Math.abs(a-b)<.02,`${a} != ${b}`);
const size=(p,s)=>p.locator(s).first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
try{for(const [width,height,lang]of [[320,568,'zh-Hant'],[390,844,'zh-Hant'],[812,375,'en'],[1280,900,'en']]){
 const c=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<900,reducedMotion:'reduce',serviceWorkers:'block'}),state=fresh();state.coins=100000;state.merit=100000;state.owned.push('flipflop','secret-fan');state.weaponUses.flipflop=3;state.weaponUses['secret-fan']=1;state.equipped='flipflop';for(const item of DECOR){state.decor[item.id]=1;state.decorExpires[item.id]=Date.now()+DECOR_LIFETIME;}
 await c.addInitScript(({state,key,lang})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('playground.language.v1',lang);localStorage.setItem('beat-bad-luck.preferences.v1',JSON.stringify({version:1,sound:false}));},{state,key:STORAGE_KEY,lang});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const p=await c.newPage();p.on('pageerror',e=>errors.push(e.stack));await p.goto(base);await p.locator('#ritual-preparation').waitFor();
 for(const kind of ['stall','kits']){
  await p.locator('#tab-'+kind).click();const prefix=kind==='stall'?'decor':'kit';
  for(const type of ['search','filter']){
   const control=p.locator('#'+prefix+'-'+type),metrics=await control.evaluate(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect(),field=node.closest('.filter-field').getBoundingClientRect();return {font:parseFloat(s.fontSize),scale:new DOMMatrix(s.transform).a,width:r.width,height:r.height,field:field.width};});close(metrics.font,16);close(metrics.scale,.85);close(metrics.font*metrics.scale,13.6);close(metrics.width,metrics.field);close(metrics.height,32);
   await control.focus();assert.equal(await p.evaluate(()=>visualViewport.scale),1,'editing does not zoom the page');
  }
  const search=p.locator('#'+prefix+'-search');await search.fill(kind==='stall'?'牛丸':'flip');assert.ok(await p.locator(kind==='stall'?'#decor-list>.decor-row:visible':'#weapon-list>.kit-row:visible').count()>0);await search.fill('');await p.locator('#'+prefix+'-filter').selectOption('owned');await p.locator('#'+prefix+'-filter').selectOption('all');
  const buttons=await p.locator(kind==='stall'?'#decor-list [data-decor]':'#weapon-list .kit-shop-actions button').evaluateAll(nodes=>nodes.slice(0,6).map(node=>{const s=getComputedStyle(node),font=parseFloat(s.fontSize),old=node.style.getPropertyValue('font-size'),priority=node.style.getPropertyPriority('font-size');node.style.removeProperty('font-size');const base=parseFloat(getComputedStyle(node).fontSize);if(old)node.style.setProperty('font-size',old,priority);const child=node.querySelector('.stat-number');return {font,base,number:child?parseFloat(getComputedStyle(child).fontSize):font,height:node.getBoundingClientRect().height};}));
  for(const b of buttons){close(b.font,b.base*1.2*.85);close(b.number,b.font);assert.ok(b.height>=44,'purchase target height is retained');}
  assert.deepEqual((await p.locator('body').innerText()).match(/\d+\.\d{3,}/g)??[],[],'game-generated visible decimals never exceed two places');await p.screenshot({path:`${folder}/${kind}-${width}.png`});
 }
 assert.match(await p.locator('[data-weapon=secret-fan]').locator('xpath=ancestor::div[contains(@class,"kit-row")]').innerText(),/4\.94/);
 const item=WEAPONS.find(w=>w.id==='paper');await p.locator(`[data-weapon="${item.id}"]`).click();close(await size(p,'#purchase-action'),16*1.2*.85);const coins=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).coins,STORAGE_KEY);await p.locator('#purchase-close').click();assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).coins,STORAGE_KEY),coins);
 await p.locator('#prepare-kit>summary').click();await p.locator('#all-kits-label').click();close(await size(p,'.preparation-kit-choice[data-owned=false]>small'),13*.85);close(await size(p,'.preparation-kit-card>.preparation-link'),14*.85);assert.deepEqual((await p.locator('#kit-catalog-dialog').innerText()).match(/\d+\.\d{3,}/g)??[],[]);await p.locator('#kit-catalog-dialog .catalog-close').click();
 await p.locator('#worry-input').fill('API v1.234567 — 私人心事');assert.equal(await p.locator('#worry-input').inputValue(),'API v1.234567 — 私人心事','private text is never rounded or rewritten');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await c.close();console.log(`PASS ${width} ${lang}: two-decimal display, exact 15% purchase labels, scaled search/filter text, retained control bounds, filtering, confirmation/cancel and private input`);
}assert.deepEqual(errors,[]);}finally{await browser.close();}
