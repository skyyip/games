import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BBL_URL||'http://127.0.0.1:5436/games/beat-bad-luck/';
const source=`import {createPlayerHub} from './beat-bad-luck/src/player-hub.js';import {fresh} from './beat-bad-luck/src/progress.js';
window.requestIdleCallback=fn=>{window.authWarm=fn;return 1;};let calls=0,user=window.authMode==='cloud'?{uid:'anon',isAnonymous:true}:null;const callbacks=new Set(),session={currentUser:user};
const auth={session,onAuthStateChanged:(s,fn)=>{callbacks.add(fn);if(window.authMode==='callback-timeout'&&calls===1){window.staleAuthCallback=fn;}else queueMicrotask(()=>fn(user));return()=>callbacks.delete(fn);},signOut:async()=>{user=null;session.currentUser=null;for(const fn of callbacks)fn(null);}};
let state=fresh();const hub=createPlayerHub({getState:()=>state,setState:s=>state=s,switchScope:()=>{},saveLocal:()=>{},isPlaying:()=>false,cloudEnabled:true,storage:localStorage,authTimeoutMs:5000,loadAuth:async()=>{calls++;if(window.authMode==='delayed')await new Promise(resolve=>window.releaseAuth=resolve);if(window.authMode==='failure'&&calls===1)throw Error('Failed to fetch dynamically imported module');return auth;},loadAPI:async()=>({load:()=>new Promise(()=>{})})});window.authHarness={hub,get calls(){return calls;}};`;
const bundle=await build({stdin:{contents:source,resolveDir:resolve('.')},bundle:true,format:'iife',write:false,logLevel:'silent'});
const browser=await chromium.launch({headless:true});
try{
 for(const mode of ['prewarm','delayed','failure','callback-timeout','cloud']){
  const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route(url=>url.href.split('?')[0]===base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
  await p.goto(base,{waitUntil:'networkidle'});await p.clock.install();await p.evaluate(mode=>{window.authMode=mode;localStorage.setItem('beat-bad-luck.players.v1.name.local','阿明');},mode);await p.addScriptTag({content:bundle.outputFiles[0].text});
  if(mode==='prewarm'){await p.evaluate(()=>authWarm());await p.waitForFunction(()=>authHarness.calls===1);}
  await p.locator('#settings-open').click();
  if(mode==='delayed'){await p.waitForFunction(()=>typeof releaseAuth==='function');assert(await p.locator('#bbl-google').isDisabled());assert(await p.locator('#bbl-auth-status').isVisible());await p.evaluate(()=>releaseAuth());}
  if(mode==='failure'){await p.locator('#bbl-auth-retry').waitFor();assert.match(await p.locator('#bbl-account-feedback').textContent(),/登入模組/);await p.locator('#bbl-auth-retry').click();}
  if(mode==='callback-timeout'){await p.waitForFunction(()=>typeof staleAuthCallback==='function');await p.clock.fastForward(5100);await p.locator('#bbl-auth-retry').waitFor();assert.match(await p.locator('#bbl-account-feedback').textContent(),/逾時/);await p.locator('#bbl-auth-retry').click();await p.waitForFunction(()=>authHarness.hub.authReady);await p.evaluate(()=>staleAuthCallback({uid:'stale-user',isAnonymous:false}));assert.equal(await p.evaluate(()=>authHarness.hub.uid),null);}
  await p.waitForFunction(()=>!document.getElementById('bbl-google').disabled);
  if(mode==='prewarm')assert.equal(await p.evaluate(()=>authHarness.calls),1);
  if(mode==='cloud'){assert(await p.evaluate(()=>authHarness.hub.loading));assert(await p.locator('#bbl-signout').isEnabled());p.once('dialog',d=>d.accept());await p.locator('#bbl-signout').click();await p.waitForFunction(()=>authHarness.hub.uid===null&&!authHarness.hub.loading);}
  assert.deepEqual(errors,[]);console.log('PASS auth preparation: '+mode);await c.close();
 }
 // Actual configured release and actual Firebase Auth SDK. IndexedDB never opens;
 // localStorage remains usable, as in the persistence mode of previous releases.
 const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await c.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{value:{open:()=>({})}});localStorage.setItem('beat-bad-luck.players.v1.name.local','阿明');});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});await p.locator('#settings-open').click();await p.waitForFunction(()=>!document.getElementById('bbl-google').disabled,null,{timeout:10000});assert.deepEqual(errors,[]);console.log('PASS actual Firebase SDK: stalled IndexedDB does not disable Google sign-in. No sign-in or production writes attempted.');await c.close();
}finally{await browser.close();}
