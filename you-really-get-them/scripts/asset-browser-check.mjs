import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true}),errors=[],failedImages=[],icons=new Set();let checks=0;
function firstQuestionSeed(faction,target){
 for(let seed=1;seed<100000;seed++){
  let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  const shuffle=items=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
  const classic=[...shuffle(BANK[faction]).slice(0,3),...shuffle(PICTURE_BANK[faction]).slice(0,2)];
  const round=shuffle([...classic,...shuffle(AIR_BANK[faction]).slice(0,4),...shuffle(MIXED_BANK[faction]).slice(0,3)]);
  if(round[0]===BANK[faction][target])return seed;
 }
 throw Error('No seed for '+faction+'/'+target);
}
try{
 for(const [faction,index,button]of [['women',3,'tapBtn'],['women',5,null],['women',7,'holdBtn'],['dog',6,'treatBtn'],['cat',6,'cupBtn']]){
  const context=await browser.newContext({viewport:{width:390,height:900},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(installBrowserFirebaseFixture);
  await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.request().resourceType()==='image')failedImages.push(r.url())});
  await page.clock.install();await page.goto(base);await page.locator(`[data-faction="${faction}"]`).click();
  await page.evaluate(seed=>{Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296)},firstQuestionSeed(faction,index));
  await page.locator('#startBtn').click();assert.equal(await page.locator('#questionText').textContent(),BANK[faction][index].text);checks++;
  await page.locator('#pigHintBtn').click();if(button)assert(await page.locator('#'+button).isVisible());checks++;
  const images=await page.evaluate(async()=>Promise.all([...document.images].map(async img=>{try{await img.decode()}catch{}return {src:img.src,loaded:img.complete&&img.naturalWidth>0}})));
  assert(images.length>10);for(const img of images)assert(img.loaded,img.src);checks+=images.length;
  const urls=await page.locator('#interaction img.ui-icon,#questionHint img').evaluateAll(nodes=>nodes.map(n=>n.src));
  for(const name of ['lightning','sneaker','press','dog','treat','paw-cup','pig'])if(urls.some(url=>url.includes('/'+name+'.')||url.includes('/'+name+'-')))icons.add(name);
  if(index===7)await page.screenshot({path:'/tmp/yrgt-fixed-hold-icons.png',fullPage:true,animations:'disabled'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++;await context.close();
 }
 assert.deepEqual([...icons].sort(),['dog','lightning','paw-cup','pig','press','sneaker','treat']);assert.deepEqual(failedImages,[]);assert.deepEqual(errors,[]);checks+=3;
 console.log(JSON.stringify({checks,dynamicIcons:icons.size,interactionTypes:5,brokenImages:failedImages.length,pageErrors:errors.length}));
}finally{await browser.close()}
