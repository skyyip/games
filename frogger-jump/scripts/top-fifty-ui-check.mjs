// Exercise the real app and translations with deterministic public-board responses.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const esbuild=await import(process.env.BBL_ESBUILD_MODULE||'esbuild'),{chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.FROGGER_URL||'http://127.0.0.1:5315/games/frogger-jump/';
const mock=`export const cloudConfigured=true;export async function observeIdentity(cb){await cb(null);return ()=>{};}export async function topFifty(){const h=globalThis.boardMock;h.calls++;if(h.hold)await new Promise(resolve=>h.release=resolve);if(h.error)throw {code:h.error};return h.rows.slice(0,50);}const unexpected=()=>{throw Error('Unexpected account write');};export const register=unexpected,claimName=unexpected,signIn=unexpected,signInGoogle=unexpected,signInAnonymous=unexpected,resetPassword=unexpected,logout=unexpected,readCloudProfile=unexpected,beginCloudRun=unexpected,abandonCloudRun=unexpected,settleCloudRun=unexpected,selectOrBuy=unexpected,playerRank=unexpected,watchCloudProfile=unexpected;`;
const bundle=await esbuild.build({entryPoints:[resolve('frogger-jump/src/app.js')],bundle:true,format:'esm',write:false,plugins:[{name:'board-fixture',setup(b){b.onResolve({filter:/^\.\/cloud\.js$/},a=>a.importer.endsWith('/social.js')?{path:'mock',namespace:'board'}:null);b.onLoad({filter:/.*/,namespace:'board'},()=>({contents:mock,loader:'js'}));}}]});
const browser=await chromium.launch({headless:true});await mkdir('/tmp/frogger-top50',{recursive:true});let checks=0;
try{for(const [width,height,lang]of [[320,568,'zh-Hant'],[390,844,'zh-Hant'],[320,568,'en'],[390,844,'en'],[812,375,'en'],[1280,900,'en']]){
 const c=await browser.newContext({viewport:{width,height},isMobile:width<800,hasTouch:width<800,serviceWorkers:'block'}),page=await c.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await c.addInitScript(lang=>{localStorage.setItem('playground.language.v1',lang);globalThis.boardMock={calls:0,hold:true,rows:Array.from({length:60},(_,i)=>({uid:'p'+i,name:i===49?'第五十位河岸英雄':'Player '+(i+1),animal:'frog',score:100-i}))};},lang);
 await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 await c.route(base,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('top50-qa.js',base).href;await c.route(harness,r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 await page.goto(base,{waitUntil:'networkidle'});await page.addScriptTag({type:'module',url:harness});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('[data-copy=shopActionNote],.river-action-top,[data-copy=boardNote],[data-copy=boardKicker],[data-copy=welcomeKicker],[data-copy=resultKicker],[data-copy=shopKicker],[data-copy=sideCaption]').count(),0);checks++;
 assert(await page.locator('.hud').evaluate(n=>n.scrollWidth<=n.clientWidth));assert(await page.locator('.best-stat>span').evaluate(n=>n.getBoundingClientRect().height<=parseFloat(getComputedStyle(n).lineHeight)+1));checks+=2;
 await page.locator('#leaderboard-open').click();await page.waitForFunction(()=>!!boardMock.release);
 assert(await page.locator('#refresh-board').isDisabled());assert.match(await page.locator('#board-status').textContent(),/50/);checks+=2;
 await page.evaluate(()=>{boardMock.hold=false;boardMock.release();});await page.waitForFunction(()=>document.querySelectorAll('#rank-list>li').length===50);
 assert.equal(await page.locator('#leaderboard-title').textContent(),lang==='en'?'World heroes · Top 50':'世界英雄榜 · 前 50 名');
 assert.equal(await page.locator('#rank-list>li').count(),50);assert.equal(await page.locator('#rank-list .rank-number').nth(10).textContent(),'11');assert.equal(await page.locator('#rank-list .rank-number').last().textContent(),'50');assert.match(await page.locator('#rank-list .rank-name').last().textContent(),/第五十位/);assert.equal(await page.locator('#rank-list>li>strong').last().textContent(),'51');assert.equal(await page.locator('#rank-list .rank-trophy').count(),10);assert.equal(await page.locator('#board-status').textContent(),'');checks+=8;
 assert(await page.locator('#leaderboard-dialog').evaluate(n=>n.scrollWidth<=n.clientWidth));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks+=2;
 await page.locator('#rank-list>li').last().scrollIntoViewIfNeeded();assert(await page.locator('#rank-list>li').last().isVisible());await page.screenshot({path:`/tmp/frogger-top50/rank50-${width}.png`});checks++;
 await page.evaluate(()=>boardMock.error='unavailable');await page.locator('#refresh-board').click();await page.waitForFunction(()=>!!document.querySelector('#board-status').textContent);assert.equal(await page.locator('#rank-list>li').count(),50);assert(await page.locator('#refresh-board').isEnabled());checks+=2;
 await page.evaluate(()=>{boardMock.error=null;boardMock.rows=[];});await page.locator('#refresh-board').click();await page.waitForFunction(()=>document.querySelectorAll('#rank-list>li').length===0);assert(await page.locator('#board-status').textContent());checks++;
 await page.locator('[data-close=leaderboard-dialog]').click();await page.locator('#animal-open').click();assert(await page.locator('#animal-cards .animal-card').count()>0);assert(await page.locator('[data-copy=coinRule]').isVisible());assert(await page.locator('[data-copy=skillRule]').isVisible());assert.equal(await page.locator('#animal-dialog').evaluate(n=>n.scrollWidth>n.clientWidth),false);checks+=4;
 await page.screenshot({path:`/tmp/frogger-top50/shop-${width}.png`});assert.deepEqual(errors,[]);checks++;await c.close();
}
 console.log(`Top fifty UI: ${checks} checks passed across six viewport/language combinations, including loading, 11–50 numbering, scroll, errors, empty results and retained skill guidance.`);
}finally{await browser.close();}
