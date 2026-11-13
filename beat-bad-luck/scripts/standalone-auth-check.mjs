// Actual built Firebase SDK; only its unavailable public helper is intercepted.
// This checks recovery, not a real Google account or physical iOS authorization.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BBL_URL||'http://127.0.0.1:5436/games/beat-bad-luck/';
const browser=await chromium.launch({headless:true});
try{for(const mode of ['failure','stalled']){
 const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
 await c.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{value:true});window.BBL_FIREBASE_CONFIG={apiKey:'demo-key',authDomain:'demo-beat-bad-luck.firebaseapp.com',projectId:'demo-beat-bad-luck',appId:'demo-web-app'};localStorage.setItem('playground.language.v1','zh-Hant');});
 await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));let helpers=0;
 await c.route('https://apis.google.com/**',r=>{helpers++;if(mode==='failure')return r.abort('failed');});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#bbl-name-skip').click();await p.locator('#settings-open').click();await p.waitForFunction(()=>!document.getElementById('bbl-google').disabled);
 assert.equal(helpers,0,'no Google helper request before the player clicks');await p.clock.install();await p.locator('#bbl-google').click();assert.equal(c.pages().length,1,'home-screen preparation does not open about:blank');await p.waitForFunction(()=>document.querySelector('script[src*="apis.google.com"]'));
 if(mode==='stalled')await p.clock.fastForward(15100);
 await p.waitForFunction(()=>!document.getElementById('bbl-google').disabled);assert.equal(c.pages().length,1);assert(await p.locator('#bbl-google-open').isHidden());assert(await p.locator('#bbl-google-cancel').isHidden());assert(await p.locator('#bbl-email-submit').isEnabled());assert.match(await p.locator('#bbl-account-feedback').textContent(),mode==='stalled'?/未能載入/:/無法連線|未完成/);assert.deepEqual(errors,[]);
 console.log('PASS actual Firebase SDK / standalone: '+mode+' helper recovers without a blank window, false cancellation or stuck account UI.');await c.close();
}}finally{await browser.close();}
