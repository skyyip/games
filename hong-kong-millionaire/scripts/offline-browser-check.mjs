import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {newRun,hkDay} from '../src/game.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,browser=await chromium.launch({headless:true});let checks=0;const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 await context.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:45000});checks++;
 const key='sky.hk-millionaire.today.v1',legacy={day:hkDay(),owner:'guest',token:'legacy-offline',run:newRun()};await page.evaluate(({key,legacy})=>localStorage.setItem(key,JSON.stringify(legacy)),{key,legacy});
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').click();assert(await page.locator('#account-dialog').isVisible());assert(!await page.locator('#game-screen').isVisible());assert.equal(await page.locator('#guest-start').count(),0);checks+=3;
 assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),legacy);checks++;
 await context.setOffline(false);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').click();assert(await page.locator('#account-dialog').isVisible());assert(!await page.locator('#game-screen').isVisible());assert.deepEqual(errors,[]);checks+=2;
 console.log(JSON.stringify({checks,serviceWorker:'real immutable build cache',offlineGuestFallback:false,pageErrors:errors.length}));
}finally{await browser.close();}
