// Local-only UI fixture. The model reference is injected into a test bundle, never production.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {PROFILE_KEY,freshProfile} from '../src/profile.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.FROGGER_URL||'http://127.0.0.1:5438/games/frogger-jump/';
const bundle=await build({stdin:{contents:"import {FroggerGame} from './src/game.js'; const start=FroggerGame.prototype.start; FroggerGame.prototype.start=function(options){const result=start.call(this,options);globalThis.riverNeighboursModel=this;return result;}; import('./src/app.js');",resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,format:'esm',write:false});
const browser=await chromium.launch({headless:true});let checks=0;
try{
 for(const [width,height]of [[320,700],[390,844],[1280,900]]){
  const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
  await c.addInitScript(()=>{globalThis.FROGGER_FIREBASE_CONFIG=null;localStorage.setItem('playground.language.v1','zh-Hant');});
  await c.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
  const p=await c.newPage(),errors=[];p.on('pageerror',error=>errors.push(error.message));await p.goto(base,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.locator('#precision-guide').evaluate(node=>node.open),false);assert.equal(await p.locator('#river-friends-guide').evaluate(node=>node.open),false);
  assert.equal(await p.locator('#river-friends-list li').count(),14);
  assert.equal(await p.locator('#precision-guide>summary').evaluate(node=>getComputedStyle(node).fontSize),'16.8px');
  const layout=await p.locator('.layout').boundingBox(),notes=await p.locator('#river-notes').boundingBox();assert(notes.y>=layout.y+layout.height);
  await p.locator('#river-friends-guide>summary').click();assert(await p.locator('#river-friends-guide').evaluate(node=>node.open));
  for(const name of ['蜜蜂','蝸牛','翠鳥','螃蟹'])assert((await p.locator('#river-friends-list').textContent()).includes(name));
  await p.locator('[data-language="en"]').click();assert((await p.locator('#river-friends-list').textContent()).includes('Kingfisher'));assert((await p.locator('#river-friends-guide>summary').textContent()).includes('River friends'));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  await p.locator('#river-notes').screenshot({path:`/tmp/river-neighbours-notes-${width}.png`});await c.close();checks+=9;
 }
 for(const [kind,score,label]of [['bee',20,'蜜蜂'],['snail',30,'蝸牛'],['kingfisher',40,'翠鳥'],['crab',50,'螃蟹']]){
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await c.addInitScript(({key,profile})=>{globalThis.FROGGER_FIREBASE_CONFIG=null;localStorage.setItem(key,JSON.stringify(profile));localStorage.setItem('playground.language.v1','zh-Hant');Math.random=()=>.75;},{key:PROFILE_KEY,profile:freshProfile('RiverTester')});
  await c.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
  await c.route(base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
  const harness=new URL('qa-neighbours.js',base).href;await c.route(harness,route=>route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
  const p=await c.newPage(),errors=[];p.on('pageerror',error=>errors.push(error.message));await p.goto(base,{waitUntil:'networkidle'});await p.addScriptTag({type:'module',url:harness});
  await p.waitForFunction(()=>globalThis.riverNeighboursModel);await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').click();
  await p.evaluate(({kind,score})=>{const g=riverNeighboursModel;g.score=score;Object.assign(g.target,{kind,x:0,y:184,r:62,small:false,sinking:false,thorns:false,angler:false});Object.assign(g.stumps[2],{kind:'stump',x:0,y:368,r:62,sinking:false,thorns:kind==='crab',angler:false});document.dispatchEvent(new Event('languagechange'));},{kind,score});
  await p.clock.runFor(40);assert((await p.locator('#route-description').textContent()).includes(label));
  await p.screenshot({path:`/tmp/river-neighbour-${kind}.png`});
  await p.locator('#jump-control').focus();await p.keyboard.down('Space');await p.clock.runFor(184/540*1000);await p.keyboard.up('Space');await p.clock.runFor(750);
  const model=await p.evaluate(()=>{const g=riverNeighboursModel;return {score:g.score,state:g.state,pollen:g.pollenReady,grace:g.sinkGrace,kind:g.current.kind,thorns:g.stumps[1].thorns,charges:g.skillCharges};});
  assert.equal(model.state,'idle');assert.equal(model.score,score+1);assert.equal(model.kind,kind);
  if(kind==='bee')assert(model.pollen);if(kind==='snail')assert.equal(model.grace,800);if(kind==='crab')assert.equal(model.thorns,false);
  assert(await p.locator('#river-notes').evaluate(node=>node.inert));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  await c.close();checks+=6;
 }
 console.log(JSON.stringify({checks,viewports:3,newPadLandings:4,pageErrors:0}));
}finally{await browser.close();}
