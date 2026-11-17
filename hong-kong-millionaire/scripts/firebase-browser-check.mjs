// Full application + real Firebase SDK + Auth/Firestore emulators. No cloud adapter.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {questionFor} from '../src/game.js';
import {sessionQuestion} from '../src/session-engine.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,built=process.env.HKM_BUILD_DIR;
assert(base&&built,'Set HKM_TEST_URL and HKM_BUILD_DIR');
assert.equal(process.env.GCLOUD_PROJECT,'demo-hk-millionaire','Run through the demo project emulators');
const manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8'));
const art=Object.fromEntries(Object.entries(manifest.assets).filter(([name])=>name.startsWith('hong-kong-millionaire/assets/')).map(([name,url])=>[name.split('/').at(-1).replace('.svg',''),new URL('../'+url,base).href]));
const entry=fileURLToPath(new URL('../src/app.js',import.meta.url));
const bundle=await build({entryPoints:[entry],bundle:true,write:false,format:'esm',logLevel:'silent',plugins:[{name:'qa-observation-only',setup(b){
 b.onLoad({filter:/\/src\/app\.js$/},async args=>args.path===entry?{contents:(await readFile(args.path,'utf8'))+'\nglobalThis.__qaCloud=cloud;',loader:'js'}:undefined);
 b.onLoad({filter:/\/src\/art\.js$/},()=>({contents:'export const ART='+JSON.stringify(art),loader:'js'}));
}}]});
const browser=await chromium.launch({headless:true}),errors=[],clients=[];let checks=0;
const check=(condition,message)=>{assert(condition,message);checks++;};
async function open(label,width=390){
 const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
 await context.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG={apiKey:'demo-key',authDomain:'demo-hk-millionaire.firebaseapp.com',projectId:'demo-hk-millionaire',appId:'demo-hk-millionaire'};globalThis.HK_MILLIONAIRE_EMULATORS=true;});
 // Keep Firebase traffic real; replace only the entry script to expose read-only QA access.
 await context.route(base,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('firebase-qa.js',base).href;
 await context.route(harness,r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(label+': '+e.message));
 async function load(){await page.goto(base,{waitUntil:'domcontentloaded'});await page.addScriptTag({type:'module',url:harness});await page.waitForFunction(()=>globalThis.__qaCloud&&!document.querySelector('#google-login').disabled);}
 const client={context,page,load,label};clients.push(client);await load();return client;
}
async function call(page,method,...args){return page.evaluate(async({method,args})=>globalThis.__qaCloud[method](...args),{method,args});}
async function register(client,name){const {page}=client;await page.locator('#account-open').click();await page.locator('#email').fill(client.label+'@example.test');await page.locator('#password').fill('Test-only-365!');await page.locator('#register-account').check();await page.locator('#email-login').click();await page.locator('#signed-in').waitFor({state:'visible'});await page.locator('#display-name').fill(name);await page.locator('#name-form button').click();await page.waitForFunction(()=>document.querySelector('#account-status').textContent.includes('稱呼已保存'));await page.locator('[data-close="account-dialog"]').last().click();check((await call(page,'account')).displayName===name,'Email registration and public name');}
async function dailyAnswer(page,correct=true){const run=await call(page,'currentRun'),q=questionFor(run),choice=(q.answer+(correct?0:1))%4;await page.locator('#options [data-choice="'+choice+'"]').click();await page.locator('#confirm-answer').click();await page.waitForFunction(()=>!document.querySelector('#next-question').hidden||!document.querySelector('#result-screen').hidden);check(!(await page.locator('#game-status').textContent()).includes('permission-denied'),'Daily answer must pass real security rules');}
async function finishDaily(client,count){const {page}=client;await page.locator('#start').click();await page.locator('#game-screen').waitFor({state:'visible'});
 for(let i=0;i<count;i++){
  if(i===0){await page.locator('#life-half').click();await page.waitForFunction(()=>document.querySelectorAll('.option.is-removed').length===2);check(await page.locator('#life-half').isDisabled(),'50:50 persisted once');}
  if(i===1){await page.locator('#life-phone').click();await page.locator('#phone-dialog').waitFor({state:'visible'});await page.locator('[data-close="phone-dialog"]').last().click();}
  if(i===2){await page.locator('#life-audience').click();await page.locator('#audience-dialog').waitFor({state:'visible'});check((await page.locator('.audience-row>span').allTextContents()).reduce((n,s)=>n+parseInt(s),0)===100,'Audience total');await page.locator('[data-close="audience-dialog"]').last().click();}
  await dailyAnswer(page);if(i<14)await page.locator('#next-question').click();
 }
 if(count<15){await page.locator('#walk').click();await page.locator('#confirm-walk').click();}
 await page.locator('#result-screen').waitFor({state:'visible'});const finished=await call(page,'currentRun');check(finished.phase==='finished'&&finished.correct===count,'Real daily settlement');
 if(count===15){await page.locator('#celebration-dialog').waitFor({state:'visible'});check(await page.locator('#celebration-confetti i').count()===48,'Million-dollar celebration');await page.locator('[data-close="celebration-dialog"]').last().click();}
 await page.locator('#result-home').click();return finished;
}
async function roomRun(page){return call(page,'activeSession');}
async function roomAnswer(page,correct=true){const run=await roomRun(page),q=sessionQuestion(run);await page.locator('.arcade-options [data-choice="'+((q.answer+(correct?0:1))%4)+'"]').click();await page.getByRole('button',{name:'確定答案',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);check(!(await page.locator('#arcade-status').textContent()).includes('permission-denied'),'Room answer security rules');}
try{
 const host=await open('host'),guest=await open('guest',320);await register(host,'測試房主');await register(guest,'測試街坊');
 const hostDaily=await finishDaily(host,15),guestDaily=await finishDaily(guest,7);check(hostDaily.payout===1000000&&guestDaily.payout===20000,'Daily payout');
 const uid=(await call(host.page,'account')).uid;
 for(const type of ['daily','season','all'])check((await call(host.page,'leaderboard',type)).some(r=>r.uid===uid),'Daily/season/all leaderboards');
 await host.page.locator('#book-open').click();await host.page.locator('[data-book=history]').click();await host.page.locator('.history-card').click();await host.page.locator('#review-list .book-card').first().click();await host.page.locator('#favourite-question').click();check((await call(host.page,'account')).favourites.length===1,'Favourite saved');await host.page.locator('[data-close="detail-dialog"]').click();await host.page.locator('[data-close="review-dialog"]').click();await host.page.locator('[data-close="book-dialog"]').click();
 await host.page.locator('#lobby-collection').click();await host.page.getByRole('button',{name:'抽一顆閃卡金蛋',exact:true}).click();await host.page.locator('#shop-confirm-buy').click();await host.page.locator('#culture-card-dialog').waitFor({state:'visible'});check(await host.page.locator('#culture-card-face .foil').count()===1,'Guaranteed foil card');await host.page.locator('.card-done').click();
 const before=await call(host.page,'wallet');const receipt={type:'draw',requestId:crypto.randomUUID()};await call(host.page,'shop',receipt);const once=await call(host.page,'wallet');await call(host.page,'shop',receipt);const twice=await call(host.page,'wallet');check(once.wallet.spent===before.wallet.spent+5000&&twice.wallet.spent===once.wallet.spent,'A repeated receipt cannot charge twice');
 for(const id of ['frame-rwb','theme-cafe','exit-redvan'])await call(host.page,'shop',{type:'buy',id,requestId:crypto.randomUUID()});
 for(const [slot,id]of [['frame','frame-rwb'],['theme','theme-cafe'],['exit','exit-redvan']])await call(host.page,'shop',{type:'equip',slot,id,requestId:crypto.randomUUID()});
 await host.load();await host.page.locator('#account-open').click();await host.page.locator('#signed-in').waitFor({state:'visible'});check(await host.page.locator('#account-identity').textContent()==='host@example.test','Auth persists on reload');await host.page.locator('[data-close="account-dialog"]').last().click();
 await host.page.waitForFunction(()=>document.documentElement.dataset.hkmTheme==='theme-cafe');check(await host.page.locator('body').getAttribute('data-hkm-frame')==='frame-rwb','Purchased appearance persists');
 const hostBalance=(await call(host.page,'wallet')).balance,guestBalance=(await call(guest.page,'wallet')).balance;
 for(const client of [host,guest])await client.page.locator('#lobby-arcade').click();
 await host.page.getByRole('button',{name:'我來開房',exact:true}).click();await host.page.locator('input[name=entryFee]').fill('1000');await host.page.getByRole('button',{name:'確認開房',exact:true}).click();await host.page.locator('.room-code-panel strong').waitFor();const code=await host.page.locator('.room-code-panel strong').textContent();
 await guest.page.getByRole('button',{name:'輸入代號',exact:true}).click();await guest.page.locator('input[name=code]').fill(code.toLowerCase());await guest.page.getByRole('button',{name:'查看房間',exact:true}).click();await guest.page.getByRole('button',{name:'確認付款並加入',exact:true}).click();
 await host.page.getByRole('button',{name:'開始對戰',exact:true}).click();for(const client of [host,guest])await client.page.locator('.arcade-question').waitFor();
 for(let i=0;i<10;i++){
  for(const client of [host,guest])await client.page.waitForFunction(n=>document.querySelector('.arcade-score')?.textContent.includes('第 '+n+'／10 題')&&!!document.querySelector('.arcade-actions'),i+1,{timeout:40000});
  const h=await roomRun(host.page),g=await roomRun(guest.page);check(h.index===i&&g.index===i&&h.questionAt===g.questionAt,'Shared question and exact server deadline');
  if(i===2){const order=await guest.page.locator('.arcade-options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice));await guest.load();await guest.page.locator('#lobby-arcade').click();await guest.page.getByRole('button',{name:'繼續未完成挑戰',exact:true}).click();await guest.page.locator('.arcade-question').waitFor();check(JSON.stringify(await guest.page.locator('.arcade-options button').evaluateAll(bs=>bs.map(b=>b.dataset.choice)))===JSON.stringify(order),'Reload preserves shuffled options');}
  if(i===3){await guest.context.setOffline(true);await guest.page.waitForTimeout(2500);await guest.context.setOffline(false);await guest.page.locator('#arcade-retry').click();await guest.page.locator('.arcade-question').waitFor();check((await roomRun(guest.page)).questionAt===g.questionAt,'Reconnect preserves deadline');}
  await roomAnswer(host.page);
  if(i===9)check(await host.page.locator('#arcade-review-open').isDisabled(),'Early finisher cannot reveal answer');
  await roomAnswer(guest.page,i!==9);
 }
 await host.page.waitForFunction(()=>{const b=document.querySelector('#arcade-review-open');return b&&!b.disabled;});check(true,'All submissions unlock review immediately');
 for(const client of [host,guest])await client.page.getByRole('button',{name:'查看房間及結算',exact:true}).click();
 await guest.page.getByRole('button',{name:'立即核對全場結果',exact:true}).click();await host.page.getByRole('button',{name:'領取全池 $2,000',exact:true}).click();
 const finalRoom=await call(host.page,'getRoom',code);check(finalRoom.status==='finished'&&finalRoom.winner===uid&&finalRoom.paidTo===uid,'Any member can finalise; winner claims');
 check((await call(host.page,'wallet')).balance===hostBalance-14000&&(await call(guest.page,'wallet')).balance===guestBalance-16000,'Shared opening fee and winner pool');const won=(await call(host.page,'wallet')).balance;await assert.rejects(()=>call(host.page,'claimRoom',code),/already-claimed/);check((await call(host.page,'wallet')).balance===won,'Pool cannot be claimed twice');check((await call(host.page,'myRooms')).some(r=>r.id===code),'Room history query');
 // Cancellation refunds the entire reserve and entry. No money is seeded by an admin.
 const cancel=await call(host.page,'createRoom',{entryFee:1000});await call(host.page,'cancelRoom',cancel);await call(host.page,'claimRoom',cancel);check((await call(host.page,'wallet')).balance===won,'Cancelled room full refund');
 await host.page.locator('#arcade-dialog .close-button').click();await host.page.locator('#account-open').click();await host.page.locator('#logout').click();await host.page.locator('#signed-out').waitFor({state:'visible'});check(await host.page.locator('#google-login').isEnabled(),'Logout restores login controls');
 await host.page.locator('#email').fill('guest@example.test');await host.page.locator('#password').fill('Test-only-365!');await host.page.locator('#register-account').uncheck();await host.page.locator('#email-login').click();await host.page.locator('#signed-in').waitFor({state:'visible'});check((await call(host.page,'account')).uid!==uid,'Account switching changes identity');
 await host.page.locator('[data-close="account-dialog"]').last().click();await host.page.locator('#start').click();await host.page.locator('#result-screen').waitFor({state:'visible'});check(await host.page.locator('#result-prize').textContent()==='$20,000','Switched account resumes its own daily result');
 check(errors.length===0,JSON.stringify(errors));await host.page.screenshot({path:'/tmp/hkm-firebase-result.png',fullPage:true});
 console.log(JSON.stringify({checks,backend:'real Firebase Auth + Firestore emulators',cloudAdapter:false,liveGoogleOAuth:false}));
}catch(error){for(const client of clients)await client.page.screenshot({path:'/tmp/hkm-firebase-failure-'+client.label+'.png',fullPage:true}).catch(()=>{});throw error;}
finally{await writeFile('/tmp/hkm-firebase-browser-errors.json',JSON.stringify(errors,null,2));await browser.close();}
