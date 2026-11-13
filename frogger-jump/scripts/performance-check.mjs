import {riverRules} from '../src/game.js';
import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.FROGGER_URL||'http://localhost:5301/games/frogger-jump/',optimized=process.env.FROGGER_EXPECT_OPTIMIZED==='1',report={};
async function pageFor(mode='static',options={}){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',...options});await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(({mode,variantChance})=>{
  globalThis.FROGGER_FIREBASE_CONFIG=null;localStorage.setItem('frogger-jump.profile.v2',JSON.stringify({version:2,name:'PerfRiver',coins:0,owned:['frog'],selected:'frog',best:0,runs:[]}));
  const values=mode==='moving'?[.25,.75,.5,.75,.75,.75,1.5/7*variantChance]:[];Math.random=()=>values.shift()??.75;
  globalThis.riverPerf={frames:0,draws:0,gradients:0,ellipses:0,images:0,mutations:0};const raf=requestAnimationFrame;globalThis.requestAnimationFrame=fn=>raf(t=>{riverPerf.frames++;fn(t);});
  for(const [name,key]of [['createLinearGradient','gradients'],['createRadialGradient','gradients'],['ellipse','ellipses'],['drawImage','images']]){const fn=CanvasRenderingContext2D.prototype[name];CanvasRenderingContext2D.prototype[name]=function(...args){riverPerf[key]++;return fn.apply(this,args);};}
  const clear=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='scene')riverPerf.draws++;return clear.apply(this,args);};
  document.addEventListener('DOMContentLoaded',()=>new MutationObserver(records=>riverPerf.mutations+=records.length).observe(document.querySelector('#play-shell'),{attributes:true,subtree:true}));
 },{mode,variantChance:riverRules(1).variantChance});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.evaluate(()=>{const raf=requestAnimationFrame;globalThis.requestAnimationFrame=fn=>raf(t=>{riverPerf.frames++;fn(t);});});await page.locator('#start').click();await page.clock.runFor(1000);return {context,page,errors};
}
async function reset(p){await p.evaluate(()=>{for(const key in riverPerf)riverPerf[key]=0;});}
try{
 const {context,page:p,errors}=await pageFor();await reset(p);await p.clock.runFor(1000);report.idle=await p.evaluate(()=>({...riverPerf}));assert.equal(report.idle.frames,0,'static idle should sleep');
 const box=await p.locator('#hold-button').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.clock.runFor(100);await reset(p);await p.clock.runFor(1000);report.charging=await p.evaluate(()=>({...riverPerf}));assert(await p.locator('#frog-charge').isVisible());
 await p.locator('#hold-button').dispatchEvent('pointercancel',{pointerId:1});await p.mouse.up();await p.locator('#pause').click();await reset(p);await p.clock.runFor(3000);report.paused=await p.evaluate(()=>({...riverPerf}));assert.equal(report.paused.frames,0);assert.deepEqual(errors,[]);await context.close();
 const moving=await pageFor('moving');await reset(moving.page);await moving.page.clock.runFor(1000);report.movingIdle=await moving.page.evaluate(()=>({...riverPerf}));assert(report.movingIdle.frames>0);if(optimized){assert(report.movingIdle.frames<=35,'moving idle should not poll every display refresh');assert(report.charging.gradients<100,'cached pads should avoid rebuilding three gradients every frame');assert(report.movingIdle.ellipses<60,'one contact shadow per frame; stable turtle art should stay cached');assert(report.charging.mutations<110,'stable HUD attributes should not be rewritten');}assert.deepEqual(moving.errors,[]);await moving.context.close();
 const large=await pageFor('static',{viewport:{width:1280,height:900},deviceScaleFactor:3,isMobile:false,hasTouch:false});report.largeCanvas=await large.page.locator('#scene').evaluate(n=>({width:n.width,height:n.height,pixels:n.width*n.height}));if(optimized)assert(report.largeCanvas.pixels<=2010000);await large.context.close();
 // Measure startup modules with the real configuration, but block all remote services.
 const startup=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),origin=new URL(base).origin;
 await startup.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());const sp=await startup.newPage();await sp.goto(base,{waitUntil:'networkidle'});await sp.waitForFunction(()=>!document.querySelector('#google-signin').disabled);
 const scripts=()=>sp.evaluate(()=>performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname.endsWith('.js')).reduce((sum,r)=>sum+r.decodedBodySize,0));
 const initialBytes=await scripts();await sp.locator('#leaderboard-open').click();if(optimized)await sp.waitForFunction(before=>performance.getEntriesByType('resource').filter(r=>new URL(r.name).pathname.endsWith('.js')).reduce((sum,r)=>sum+r.decodedBodySize,0)>before,initialBytes);await sp.waitForTimeout(200);report.cloudModules={initialScriptBytes:initialBytes,afterOpeningBoardBytes:await scripts()};if(optimized)assert(report.cloudModules.afterOpeningBoardBytes>initialBytes,'Firestore should load only when cloud data is requested');await startup.close();
 console.log(JSON.stringify(report,null,2));if(process.env.FROGGER_PERF_REPORT)await writeFile(process.env.FROGGER_PERF_REPORT,JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}
