// Real service workers and browser navigation, with isolated local release fixtures.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {serviceWorkerSource} from './service-worker-source.mjs';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const bundled=await build({stdin:{contents:"import './grid-rush/src/site-updates.js';import {setupModalChrome} from './beat-bad-luck/src/mobile-dialogs.js';setupModalChrome();",resolveDir:resolve('.')},bundle:true,format:'iife',write:false,logLevel:'silent'});
const chromeCSS=(await readFile(resolve('beat-bad-luck/mobile-dialogs.css'),'utf8')).split('\n').slice(0,11).join('\n');
const asset='/games/built/update-a123456789.js',route='test/',path='/games/test/';
let version='one',hold=false;const gates=[];
const worker=v=>{let code=serviceWorkerSource({version:v,route,home:path+'index.html',urls:[path,path+'index.html',asset,...(v==='two'?[path+'install-gate.txt']:v==='bad'?[path+'missing.txt']:[])]});if(v==='stalled')code=code.replace("event.data?.type==='ACTIVATE_UPDATE'","event.data?.type==='IGNORE_ACTIVATION'");return code;};
const releaseGate=()=>{hold=false;for(const response of gates.splice(0))response.end('ready');};
const server=createServer((req,res)=>{
 const u=new URL(req.url,'http://local');res.setHeader('Cache-Control','no-store');
 if(u.pathname==='/games/release.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({version,workers:{[route]:'test/sw-'+version+'.js'}}));}
 else if(u.pathname===asset){res.setHeader('Content-Type','text/javascript');res.end(bundled.outputFiles[0].text);}
 else if(u.pathname===path||u.pathname===path+'index.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><style>'+chromeCSS+'</style><script>window.PLAYGROUND_RELEASE='+JSON.stringify({version,base:'/games/',route,worker:'test/sw-'+version+'.js'})+'</script></head><body><h1>Release '+version+'</h1><script src="'+asset+'"></script></body></html>');}
 else if(u.pathname.startsWith(path+'sw-')){res.setHeader('Content-Type','text/javascript');res.end(worker(u.pathname.slice((path+'sw-').length,-3)));}
 else if(u.pathname===path+'install-gate.txt'){if(hold)gates.push(res);else res.end('ready');}
 else{res.statusCode=404;res.end('missing');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
const contexts=[];
try{
 async function context(){const c=await browser.newContext();contexts.push(c);await c.addInitScript(()=>{localStorage.setItem('playground.language.v1','zh-Hant');if(!localStorage.getItem('beat-bad-luck.stall.v1'))localStorage.setItem('beat-bad-luck.stall.v1',JSON.stringify({coins:12345}));});return c;}
 async function open(c){const p=await c.newPage();await p.goto(origin+path,{waitUntil:'load'});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);return p;}
 async function offer(p){await p.bringToFront();await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await p.locator('#site-update-dialog[open]').waitFor();}
 async function saved(p){assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.stall.v1')).coins),12345);}
 const c=await context(),a=await open(c),b=await open(c);version='two';hold=true;
 await offer(a);await a.locator('#site-update-later').click();await offer(b);await b.locator('#site-update-apply').click();await b.locator('#site-update-dialog').waitFor({state:'hidden'});assert(await b.locator('#site-update-status').isVisible());await b.waitForFunction(()=>window.PLAYGROUND_RELEASE.version==='one');assert.equal(await a.evaluate(()=>window.PLAYGROUND_RELEASE.version),'one');
 releaseGate();await b.waitForFunction(()=>window.PLAYGROUND_RELEASE.version==='two');await saved(b);assert.equal(await a.evaluate(()=>window.PLAYGROUND_RELEASE.version),'one');await c.setOffline(true);await b.reload({waitUntil:'load'});assert.equal(await b.locator('h1').textContent(),'Release two');await saved(b);await c.close();console.log('PASS update: modal closes before install, progress is visible, only accepting tab reloads, records survive, new release opens offline.');
 version='one';const failureContext=await context(),failure=await open(failureContext);version='bad';await offer(failure);await failure.locator('#site-update-apply').click();await failure.waitForFunction(()=>document.querySelector('#site-update-dialog[open] p')?.textContent.includes('未能完成'));assert(await failure.locator('#site-update-apply').isEnabled());assert.equal(await failure.evaluate(()=>window.PLAYGROUND_RELEASE.version),'one');await saved(failure);
 version='two';await failure.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await failure.waitForTimeout(100);await failure.locator('#site-update-apply').click();await failure.waitForFunction(()=>window.PLAYGROUND_RELEASE.version==='two');await saved(failure);await failureContext.close();console.log('PASS install failure: actionable retry, no premature reload, saved records retained, retry installs the newer release.');
 version='one';const activatedContext=await context(),activated=await open(activatedContext);version='two';await offer(activated);
 await activated.evaluate(async()=>{const reg=await navigator.serviceWorker.register('/games/test/sw-two.js',{scope:'/games/test/'});const worker=reg.installing??reg.waiting??reg.active;if(worker.state!=='installed'&&worker.state!=='activated')await new Promise(resolve=>worker.addEventListener('statechange',()=>{if(worker.state==='installed')resolve();}));if(worker.state==='installed')worker.postMessage({type:'ACTIVATE_UPDATE'});if(!navigator.serviceWorker.controller?.scriptURL.endsWith('sw-two.js'))await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
 assert.equal(await activated.evaluate(()=>window.PLAYGROUND_RELEASE.version),'one');await activated.locator('#site-update-apply').click();await activated.waitForFunction(()=>window.PLAYGROUND_RELEASE.version==='two');await saved(activated);await activatedContext.close();console.log('PASS already activated worker: reload succeeds even when the controllerchange happened before the click.');
 version='one';const stalledContext=await context(),stalled=await open(stalledContext);version='stalled';await offer(stalled);await stalled.clock.install();await stalled.locator('#site-update-apply').click();await stalled.locator('#site-update-dialog').waitFor({state:'hidden'});await stalled.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting);await stalled.clock.fastForward(45010);await stalled.waitForFunction(()=>document.querySelector('#site-update-dialog[open] p')?.textContent.includes('未能完成'));assert(await stalled.locator('#site-update-apply').isEnabled());assert.equal(await stalled.evaluate(()=>window.PLAYGROUND_RELEASE.version),'one');await saved(stalled);await stalled.locator('#site-update-later').click();await stalled.locator('#site-update-dialog').waitFor({state:'hidden'});await stalled.clock.fastForward(11000);assert(await stalled.locator('#site-update-dialog').isHidden());await stalledContext.close();console.log('PASS stalled activation: bounded wait, enabled retry/later, no stuck modal or disabled button, no lost records.');
}finally{releaseGate();for(const c of contexts)await c.close().catch(()=>{});await browser.close();await new Promise(resolve=>server.close(resolve));}
