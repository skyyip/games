import assert from 'node:assert/strict';
import {CARDS} from '../src/gacha.js';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];
async function open(width=390,{reducedMotion='no-preference',coins=1000,cards=['w_1','m_1']}={}){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion,serviceWorkers:'block'});
 await context.addInitScript(installBrowserFirebaseFixture);
 await context.addInitScript(()=>{globalThis.testVibrations=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{testVibrations.push(pattern);return true}})});
 await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(base);await page.waitForFunction(()=>!document.querySelector('#authBtn').disabled);
 await page.evaluate(save=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify(save)),{coins,cards,runs:4,bestHp:80});
 await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();return {context,page};
}
const pickCard=id=>{const card=CARDS.find(c=>c.id===id),pool=CARDS.filter(c=>c.rarity===card.rarity);return (pool.findIndex(c=>c.id===id)+.5)/pool.length};
const state=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));
async function roll(page,tier,pick){await page.evaluate(values=>{Math.random=()=>values.shift()??.5},[tier,pick])}
async function draw(page,tier,pick){await roll(page,tier,pick);await page.locator('#gachaDraw').click();await page.clock.runFor(1350);await page.locator('#modal .gacha-result').waitFor({state:'visible'})}
async function close(page){await page.locator('#keepGachaCard').click()}
try{
 for(const width of [320,390,1280]){
  const {context,page}=await open(width);assert.equal(await page.locator('.collect-card').count(),60);assert.equal(await page.locator('.gacha-shop .gacha-copy,.gacha-shop .gacha-odds,.gacha-shop details').count(),0);assert.equal(await page.locator('#gachaStatus').textContent(),'');checks++;
  assert((await page.locator('#gachaDraw').textContent()).includes('100 SC'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks+=4;
  const groups=await page.locator('.collection-faction').evaluateAll(nodes=>nodes.map(n=>({faction:n.dataset.cardFaction,ids:[...n.querySelectorAll('[data-card]')].map(c=>c.dataset.card)})));
  const order=['N','R','SR','SSR'];assert.deepEqual(groups.map(g=>g.faction),['women','men','dog','cat']);checks++;
  for(const [i,prefix]of ['w_','m_','d_','c_'].entries()){
   assert.deepEqual(groups[i].ids,CARDS.filter(c=>c.id.startsWith(prefix)).sort((a,b)=>order.indexOf(a.rarity)-order.indexOf(b.rarity)).map(c=>c.id));checks++;
  }
  const urls=await page.locator('.flash-card-art').evaluateAll(nodes=>[...new Set(nodes.map(n=>getComputedStyle(n).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1]))]);
  assert.equal(urls.length,4);await page.evaluate(async urls=>{await Promise.all(urls.map(async src=>{const image=new Image();image.src=src;await image.decode();if(!image.naturalWidth)throw Error(src)}))},urls);checks+=2;
  const cases=[['N',0,0,'w_4'],['R',.57,pickCard('w_6'),'w_6'],['SR',.87,pickCard('w_7'),'w_7'],['SSR',.97,pickCard('c_7'),'c_7']];let balance=1000;
  for(const [rarity,tier,pick,id]of cases){
   await roll(page,tier,pick);await page.locator('#gachaDraw').click();balance-=100;
   let save=await state(page);assert.equal(save.coins,balance);assert(save.cards.includes(id));assert.equal(save.runs,4);assert.equal(save.bestHp,80);
   assert(await page.locator('#gachaDraw').isDisabled());assert.equal(await page.locator('#gachaMachine').getAttribute('aria-busy'),'true');
   await page.locator('#gachaDraw').dispatchEvent('click');assert.equal((await state(page)).coins,balance);checks+=7;
   await page.clock.runFor(1350);await page.locator('.gacha-result').waitFor({state:'visible'});
   assert(await page.locator(`.gacha-result.rarity-${rarity.toLowerCase()}`).isVisible());assert((await page.locator('#collectionCount').textContent()).includes(`/ 60`));
   const art=page.locator('#modal .flash-card-art');const finish=await art.evaluate(n=>({after:getComputedStyle(n,'::after').animationName,bg:getComputedStyle(n).backgroundImage,glow:getComputedStyle(n.closest('figure')).boxShadow}));
   assert(finish.bg.includes('gacha-polaroids'));checks+=3;
   if(rarity==='N'){assert.equal(finish.after,'none');checks++}
   if(rarity==='R'){assert.notEqual(finish.glow,'none');checks++}
   if(rarity==='SR'){assert(finish.after.includes('metal-sweep'));checks++}
   if(rarity==='SSR'){
    assert(finish.after.includes('holo-drift'));await page.clock.runFor(700);
    const hologram=page.locator('#modal .holo-card');await hologram.scrollIntoViewIfNeeded();const r=await hologram.boundingBox();
    await page.mouse.move(r.x+r.width*.3,r.y+r.height*.3);
    const light=await hologram.evaluate(n=>({x:n.style.getPropertyValue('--light-x'),transform:getComputedStyle(n).transform}));assert(light.x&&light.transform!=='none');
    assert(await hologram.evaluate(n=>{const r=n.getBoundingClientRect(),e=new PointerEvent('pointerdown',{bubbles:true,cancelable:true,pointerType:'touch',clientX:r.x+r.width*.75,clientY:r.y+r.height*.7});n.dispatchEvent(e);return !e.defaultPrevented&&parseFloat(n.style.getPropertyValue('--light-x'))>50}));
    await hologram.dispatchEvent('pointercancel');assert.equal(await hologram.evaluate(n=>n.style.getPropertyValue('--rx')),'');checks+=4;
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
   await page.screenshot({path:`/tmp/yrgt-gacha-${rarity}-${width}.png`,fullPage:true,animations:'disabled'});await close(page);
  }
  const before=(await state(page)).cards.length;await draw(page,.97,pickCard('c_7'));balance-=75;const duplicate=await state(page);
  assert.equal(duplicate.coins,balance);assert.equal(duplicate.cards.length,before);assert((await page.locator('.gacha-receipt').textContent()).includes('重複回收 25 SC'));assert.equal((await page.evaluate(()=>testVibrations)).length,5);checks+=4;await close(page);
  await page.locator('.gacha-shop').screenshot({path:`/tmp/yrgt-gacha-shop-${width}.png`,animations:'disabled'});await context.close();
 }
 // Every new breed can actually be drawn and has the matching picture and name.
 {
  const pets=CARDS.filter(c=>['pets','life'].includes(c.atlas)),{context,page}=await open(390,{coins:3200,reducedMotion:'reduce'});
  const rolls={N:0,R:.57,SR:.87,SSR:.97};
  for(const [i,card]of pets.entries()){
   const pool=CARDS.filter(c=>c.rarity===card.rarity);await draw(page,rolls[card.rarity],(pool.findIndex(c=>c.id===card.id)+.5)/pool.length);
   assert.equal(await page.locator('#modal figcaption').textContent(),card.name);assert((await page.locator('#modal .flash-card-art').evaluate(n=>getComputedStyle(n).backgroundImage)).includes(card.atlas==='life'?'everyday-polaroids':'pet-breeds'));
   const save=await state(page);assert(save.cards.includes(card.id));assert.equal(save.coins,3200-(i+1)*100);checks+=4;
   if(i===pets.length-1)await page.screenshot({path:'/tmp/yrgt-pet-SSR.png',fullPage:true,animations:'disabled'});await close(page);
  }
  await context.close();
 }
 // Motion preferences disable both foil motion and device vibration.
 {
  const {context,page}=await open(390,{reducedMotion:'reduce'});await draw(page,.97,pickCard('c_7'));
  assert.equal(await page.evaluate(()=>testVibrations.length),0);const foil=await page.locator('#modal .flash-card-art').evaluate(n=>getComputedStyle(n,'::after').animationName);assert.equal(foil,'none');checks+=2;await context.close();
 }
 // Reloading during the animation cannot charge the user without granting the card.
 {
  const {context,page}=await open(390,{coins:200});await roll(page,0,0);await page.locator('#gachaDraw').click();await page.reload();await page.waitForFunction(()=>!document.querySelector('#authBtn').disabled);
  const saved=await state(page);assert.equal(saved.coins,100);assert(saved.cards.includes('w_4'));assert.equal(saved.cards.filter(id=>id==='w_4').length,1);checks+=3;
  await page.locator('#actionMenu').evaluate(n=>n.open=true);await page.locator('#collectionBtn').click();assert(await page.locator('[data-card="w_4"]:not(.locked)').isVisible());checks++;await context.close();
 }
 {
  const {context,page}=await open(390,{coins:99});assert(await page.locator('#gachaDraw').isDisabled());await page.locator('#gachaDraw').dispatchEvent('click');assert.equal((await state(page)).coins,99);checks+=2;await context.close();
 }
 // Returning home cancels the reveal overlay, while the committed ownership survives.
 {
  const {context,page}=await open(390,{coins:200});await roll(page,0,0);await page.locator('#gachaDraw').click();await page.locator('#backBtn').click();await page.clock.runFor(1500);
  assert(await page.locator('#home').isVisible());assert.equal(await page.locator('#modal').evaluate(n=>n.open),false);assert.equal((await state(page)).coins,100);assert((await state(page)).cards.includes('w_4'));checks+=4;await context.close();
 }
 // A blocked local save does not silently consume coins or grant a cloud-only card.
 {
  const {context,page}=await open(390,{coins:100});await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','QuotaExceededError')}});await roll(page,0,0);await page.locator('#gachaDraw').click();
  assert.equal((await state(page)).coins,100);assert.equal((await state(page)).cards.includes('w_4'),false);assert((await page.locator('#gachaStatus').textContent()).includes('未能儲存'));assert(await page.locator('#gachaDraw').isEnabled());checks+=4;await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,cards:60,newBreedDraws:16,newEverydayDraws:16,factionRarityOrder:true,rarities:4,mobileWidths:[320,390],pointerHologram:true,atomicSave:true,reducedMotion:true,pageErrors:errors.length}));
}finally{await browser.close()}
