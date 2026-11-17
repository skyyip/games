// Read-only production smoke: no real account, cloud writes, or published scores.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_LIVE_URL||'https://sky-playground.com/games/hong-kong-millionaire/';
const browser=await chromium.launch({headless:true}),report={url:base,checkedAt:new Date().toISOString(),checks:[],pageErrors:[],failedAssets:[],googleOAuth:'No external account credentials used'};
const check=(value,message)=>{assert(value,message);report.checks.push(message);};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage();
 page.on('pageerror',e=>report.pageErrors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)report.failedAssets.push({path:new URL(r.url()).pathname,status:r.status()});});
 const response=await page.goto(base,{waitUntil:'networkidle',timeout:60000});check(response.status()===200,'Live game returns HTTP 200');
 await page.locator('#start').waitFor({state:'visible'});check((await page.title()).includes('百萬富翁'),'Game application loads');
 await page.locator('#account-open').click();await page.waitForFunction(()=>!document.querySelector('#google-login').disabled,null,{timeout:20000});check(await page.locator('#email-login').isEnabled(),'Firebase Google/email controls initialise');
 const popupTask=page.waitForEvent('popup',{timeout:20000});await page.locator('#google-login').click();const popup=await popupTask;await popup.waitForURL(url=>url.hostname==='accounts.google.com'||url.pathname.includes('/__/auth/'),{timeout:30000}).catch(()=>{});
 await popup.waitForTimeout(5000).catch(()=>{});const popupURL=popup.isClosed()?null:new URL(popup.url());
 report.googlePopup=popupURL?{origin:popupURL.origin,path:popupURL.pathname}:null;
 if(popupURL?.hostname==='accounts.google.com'){check(true,'Google popup reaches Google account selection');report.googleOAuth='Provider entry verified; completing real Google sign-in still requires a user account';}
 else{report.googleOAuth='Provider entry could not be confirmed; no account credentials used';if(!popup.isClosed())report.googlePopupText=(await popup.locator('body').innerText()).slice(0,800);}
 if(!popup.isClosed())await popup.close();
 await page.locator('[data-close="account-dialog"]').last().click();
 await page.locator('#start').click();await page.locator('#game-screen').waitFor({state:'visible'});check(await page.locator('#options button').count()===4,'Anonymous daily challenge has four answers');
 const initial=await page.evaluate(()=>JSON.parse(localStorage.getItem('sky.hk-millionaire.today.v1'))),order=await page.locator('#options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice));
 await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();await page.locator('#game-screen').waitFor({state:'visible'});
 const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('sky.hk-millionaire.today.v1')));
 check(initial.token===resumed.token&&initial.run.questionAt===resumed.run.questionAt,'Reload retains the same anonymous daily opportunity and deadline');
 check(JSON.stringify(order)===JSON.stringify(await page.locator('#options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice))),'Shuffled options remain stable on reload');
 await page.locator('#walk').click();await page.locator('#confirm-walk').click();await page.locator('#result-screen').waitFor({state:'visible'});check((await page.locator('#result-prize').textContent())==='$0','Anonymous walk-away settles locally');
 await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();await page.locator('#result-screen').waitFor({state:'visible'});check(true,'A finished anonymous daily challenge cannot restart');
 check(report.pageErrors.length===0,'No uncaught browser errors');check(report.failedAssets.length===0,'No failed same-site assets');await page.screenshot({path:'/tmp/hkm-live-mobile.png',fullPage:true});
 console.log(JSON.stringify(report));
}catch(error){report.failure=error.message;throw error;}
finally{await writeFile('/tmp/hkm-live-smoke.json',JSON.stringify(report,null,2));console.log('Live smoke report: '+JSON.stringify(report));await browser.close();}
