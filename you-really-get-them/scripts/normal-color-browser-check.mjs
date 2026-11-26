import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {CARDS} from '../src/gacha.js';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true}),normal=CARDS.filter(c=>c.rarity==='N'),errors=[];let checks=0;
try{
 assert.equal(normal.length,40);
 for(const width of [320,390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(installBrowserFirebaseFixture);
  await context.addInitScript(()=>localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:4000,cards:[],runs:3,bestHp:100})));
  await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');await page.locator('#companionPicker').click();await page.locator('#collectionRarity').selectOption('N');
  assert.equal(await page.locator('.collect-card').count(),40);checks++;
  const samples=[];
  for(const [i,card]of normal.entries()){
   const art=page.locator(`[data-card="${card.id}"] .flash-card-art`),style=await art.evaluate(n=>({image:getComputedStyle(n).backgroundImage,size:getComputedStyle(n).backgroundSize,filter:getComputedStyle(n).filter,animation:getComputedStyle(n,'::after').animationName,x:n.style.getPropertyValue('--art-x'),y:n.style.getPropertyValue('--art-y')}));
   const legacy=i<36,slot=legacy?i%12:card.art,rows=legacy?3:4;assert(style.image.includes(legacy?`normal-color-${Math.floor(i/12)}`:'outing-polaroids'));assert.equal(style.size,`400% ${rows*100}%`);assert.equal(style.filter,'none');assert.equal(style.animation,'none');assert(Math.abs(parseFloat(style.x)-(slot%4)*100/3)<.001);assert(Math.abs(parseFloat(style.y)-Math.floor(slot/4)*100/(rows-1))<.001);samples.push({src:style.image.match(/url\(["']?(.*?)["']?\)/)[1],slot,rows});checks+=6;
  }
  // Inspect actual decoded pixel colors, so removing a CSS filter alone cannot pass.
  const colorFractions=await page.evaluate(async samples=>{
   const output=[],sheets=new Map();for(const {src,slot,rows}of samples){if(!sheets.has(src)){const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);sheets.set(src,{c,ctx})}const {c,ctx}=sheets.get(src),x=Math.floor((slot%4)*c.width/4),y=Math.floor(Math.floor(slot/4)*c.height/rows),w=Math.floor(c.width/4),h=Math.floor(c.height/rows),pixels=ctx.getImageData(x,y,w,h).data;let vivid=0,total=0;for(let i=0;i<pixels.length;i+=32){if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>25)vivid++;total++}output.push(vivid/total)}return output;
  },samples);assert.equal(colorFractions.length,40);assert(colorFractions.every(n=>n>.08),JSON.stringify(colorFractions));checks+=2;
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;
  await page.screenshot({path:`/tmp/yrgt-normal-color-${width}.png`,fullPage:false,animations:'disabled'});
  for(const i of [0,12,24,36]){
   const card=normal[i];await page.locator(`[data-card="${card.id}"] .card-open`).click();assert.equal(await page.locator('#cardDetailTitle').textContent(),card.name);assert((await page.locator('#modal .flash-card-art').evaluate(n=>getComputedStyle(n).backgroundImage)).includes(i<36?`normal-color-${i/12}`:'outing-polaroids'));assert.equal(await page.locator('#modal .flash-card-art').evaluate(n=>getComputedStyle(n).filter),'none');checks+=3;await page.locator('#modalClose').click();
  }
  if(width===390){
   await page.locator('#gachaShopDetails').evaluate(n=>n.open=true);
   for(const [i,card]of normal.entries()){
    await page.evaluate(values=>{Math.random=()=>values.shift()??.5},[0,(i+.5)/normal.length]);await page.locator('#gachaDraw').click();await page.locator('.gacha-result').waitFor({state:'visible'});
    assert.equal(await page.locator('.gacha-result figcaption').textContent(),card.name);assert((await page.locator('.gacha-result .flash-card-art').evaluate(n=>getComputedStyle(n).backgroundImage)).includes(i<36?`normal-color-${Math.floor(i/12)}`:'outing-polaroids'));assert.equal(await page.locator('.gacha-result .flash-card-art').evaluate(n=>getComputedStyle(n,'::after').animationName),'none');checks+=3;await page.locator('#keepGachaCard').click();
   }
   const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')));assert.equal(save.coins,0);for(const card of normal)assert(save.cards.includes(card.id));checks+=2;
   await page.locator(`[data-card="${normal[0].id}"] .card-open`).click();await page.locator(`[data-equip="${normal[0].id}"]`).click();await page.locator('#backBtn').click();assert((await page.locator('#companionPortrait .flash-card-art').evaluate(n=>getComputedStyle(n).backgroundImage)).includes('normal-color-0'));checks++;
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,normalCards:40,allSourceTilesHaveColor:true,lockedAndOwnedColor:true,realNDraws:40,viewports:3,noFoilAdded:true,pageErrors:errors.length}));
}finally{await browser.close()}
