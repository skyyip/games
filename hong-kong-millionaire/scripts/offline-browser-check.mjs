import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {questionFor} from '../src/game.js';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,browser=await chromium.launch({headless:true});
let checks=0;const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 await context.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:45000});checks++;
 await page.locator('#start').click();await page.locator('#game-screen').waitFor({state:'visible'});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sky.hk-millionaire.today.v1'))),order=await page.locator('#options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice));
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#game-screen').waitFor({state:'visible'});
 const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('sky.hk-millionaire.today.v1')));
 assert.equal(saved.token,resumed.token);assert.equal(saved.run.questionAt,resumed.run.questionAt);assert.deepEqual(order,await page.locator('#options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice)));checks+=3;
 await page.locator('#options [data-choice="'+questionFor(resumed.run).answer+'"]').click();await page.locator('#confirm-answer').click();await page.locator('#next-question').click();await page.locator('#walk').click();await page.locator('#confirm-walk').click();await page.locator('#result-screen').waitFor({state:'visible'});assert.equal(await page.locator('#result-prize').textContent(),'$1,000');checks++;
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#result-screen').waitFor({state:'visible'});checks++;
 await context.setOffline(false);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.locator('#result-screen').waitFor({state:'visible'});assert.equal(await page.locator('#site-update-dialog').evaluate(d=>d.open),false);assert.deepEqual(errors,[]);checks+=2;
 console.log(JSON.stringify({checks,serviceWorker:'real immutable build cache',pageErrors:errors.length}));
}finally{await browser.close();}
