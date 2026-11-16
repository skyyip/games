// Real page / controls with a local account adapter. No Google or production Firebase writes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {newRun,act,hkDay,questionFor} from '../src/game.js';
import {LEDGER_KEY} from '../src/ledger.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL||'http://127.0.0.1:5439/games/hong-kong-millionaire/';
const built=process.env.HKM_BUILD_DIR||'/tmp/games-built-auth-fix';
const manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8'));
const art=Object.fromEntries(Object.entries(manifest.assets).filter(([name])=>name.startsWith('hong-kong-millionaire/assets/')).map(([name,url])=>[name.split('/').at(-1).replace('.svg',''),new URL('../'+url,base).href]));
const gamePath=fileURLToPath(new URL('../src/game.js',import.meta.url));
const adapter=`
import {newRun,act,hkDay,terminal,finish} from ${JSON.stringify(gamePath)};
const q=globalThis.hkmAuthQA={uid:globalThis.HKM_INITIAL_AUTH_UID??null,nextUid:'google-player',runs:{},calls:[],holdClaim:false,failClaim:false,claimCommitThenFail:false,failCurrentRun:false,holdAccount:false,failAccount:!!globalThis.HKM_FAIL_ACCOUNT,failMove:false,delayInitialAuth:!!globalThis.HKM_DELAY_INITIAL_AUTH};
const profile=uid=>({uid,displayName:'街坊'+uid,total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null});
const copy=value=>value?JSON.parse(JSON.stringify(value)):null;
const call=method=>{q.calls.push({method,uid:q.uid});return q.uid;};
q.setUser=uid=>{q.uid=uid;q.notification=Promise.resolve(q.callback?.(uid?{uid,email:uid+'@example.test'}:null));return q.notification;};
export const configured=true;
export async function prepareAuth(){}
export async function observeAuth(callback){q.callback=callback;if(q.delayInitialAuth)await new Promise(resolve=>q.releaseInitialAuth=()=>{q.delayInitialAuth=false;resolve();});await q.setUser(q.uid);return ()=>{};}
export function googleLogin(){const task=Promise.resolve().then(()=>{q.setUser(q.nextUid);return {user:{uid:q.uid}};});return {task,popup:{dispose(){},open(){}}};}
export function emailLogin(){return q.setUser('email-player');}
export function logout(){return q.setUser(null);}
export async function account(){const uid=call('account');if(q.failAccount)throw {code:'permission-denied'};if(q.holdAccount)return new Promise(resolve=>{q.releaseAccount=()=>{q.holdAccount=false;resolve(profile(uid));};});return profile(uid);}
export async function resumeAccount(){const uid=call('resumeAccount');return {profile:await account(),run:copy(q.runs[uid])};}
export async function claimDaily(){const uid=call('claimDaily');if(q.holdClaim)await new Promise(resolve=>q.releaseClaim=resolve);if(q.failClaim)throw {code:q.claimError??'permission-denied'};const run=q.runs[uid]??=(newRun(hkDay(),Date.now(),uid));if(q.claimCommitThenFail)throw {code:'permission-denied'};return copy(run);}
export async function currentRun(day,options){const uid=call('currentRun');q.calls.at(-1).server=!!options?.server;if(q.failCurrentRun)throw {code:'permission-denied'};return copy(q.runs[uid]);}
export async function move(day,action,{expected=null}={}){const uid=call('move');q.calls.at(-1).action=action.type;
 if(q.failMove)throw {code:q.moveError??'permission-denied',stage:action.type==='answer'?'answer-write':'progress-write'};
 if(q.holdMove)return new Promise((resolve,reject)=>{q.releaseMove=()=>{q.holdMove=false;reject({code:'permission-denied'});};});
 const old=q.runs[uid];if(!expected||old.index===expected.index&&old.questionAt===expected.questionAt&&old.phase===expected.phase)q.runs[uid]=act(old,action,Date.now(),{autoFinish:false});
 if(q.commitThenFail){q.commitThenFail=false;throw {code:'unavailable',stage:'progress-read'};}
 if(terminal(q.runs[uid]))return settle(day);return copy(q.runs[uid]);
}
export async function settle(){const uid=call('settle');if(q.failSettle)throw {code:'permission-denied',stage:'settlement',run:copy(q.runs[uid])};if(q.runs[uid].phase!=='finished')q.runs[uid]=finish(q.runs[uid],Date.now());return copy(q.runs[uid]);}
export async function saveName(){return account();}export async function favourite(){return account();}
export async function leaderboard(){return [];}export async function history(){return [];}
export async function resetPassword(){}
export function errorText(error){return error?.code==='permission-denied'?'雲端操作未獲允許，今日進度仍保留；請稍後重試。':'操作未完成';}
`;
const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/app.js',import.meta.url))],bundle:true,write:false,format:'esm',logLevel:'silent',plugins:[{name:'local-auth',setup(b){
 b.onResolve({filter:/^\.\/cloud\.js$/},args=>args.importer.endsWith('/src/app.js')?{path:'adapter',namespace:'local-auth'}:undefined);
 b.onLoad({filter:/.*/,namespace:'local-auth'},()=>({contents:adapter,loader:'js',resolveDir:fileURLToPath(new URL('../src',import.meta.url))}));
 b.onLoad({filter:/\/src\/art\.js$/},()=>({contents:'export const ART='+JSON.stringify(art),loader:'js'}));
}}]});
const browser=await chromium.launch({headless:true}),NOW=Date.UTC(2026,10,15,4),DAY=hkDay(NOW),errors=[];let checks=0;
function saved(phase='playing'){
 let run=newRun(DAY,NOW);if(phase==='finished')run=act(run,{type:'answer',choice:(questionFor(run).answer+1)%4},NOW+1000);
 return {day:DAY,owner:'guest',token:'anonymous-token',revision:0,run};
}
async function open({guest=null,width=390,height=900,restoredUid=null,failAccount=false,delayInitialAuth=false}={}){
 const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
 await c.addInitScript(({now,key,guest,restoredUid,failAccount,delayInitialAuth})=>{globalThis.HKM_INITIAL_AUTH_UID=restoredUid;globalThis.HKM_FAIL_ACCOUNT=failAccount;globalThis.HKM_DELAY_INITIAL_AUTH=delayInitialAuth;globalThis.__hkmQaNow=now;const Native=Date;globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.__hkmQaNow]));}static now(){return globalThis.__hkmQaNow;}};if(guest&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(guest));},{now:NOW,key:LEDGER_KEY,guest,restoredUid,failAccount,delayInitialAuth});
 await c.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await c.route(base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('auth-qa.js',base).href;await c.route(harness,route=>route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 const p=await c.newPage();p.on('pageerror',error=>errors.push(error.message));
 await p.goto(base,{waitUntil:'networkidle'});await p.addScriptTag({type:'module',url:harness});if(delayInitialAuth)await p.waitForFunction(()=>globalThis.hkmAuthQA&&typeof hkmAuthQA.releaseInitialAuth==='function');else await p.waitForFunction(()=>!document.querySelector('#google-login').disabled);
 return {c,p};
}
async function login(p){await p.locator('#account-open').click();await p.locator('#google-login').click();await p.waitForFunction(()=>!!globalThis.hkmAuthQA.uid&&!document.querySelector('#logout').disabled);}
async function switchGoogle(p,uid){await p.locator('#account-open').click();await p.locator('#logout').click();await p.locator('[data-close="account-dialog"]').first().click();await p.evaluate(uid=>hkmAuthQA.nextUid=uid,uid);await login(p);await p.locator('[data-close="account-dialog"]').first().click();}
const state=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),LEDGER_KEY);
const noCloudGameWrites=async p=>{const calls=await p.evaluate(()=>hkmAuthQA.calls.map(c=>c.method));assert(!calls.some(method=>['resumeAccount','claimDaily','move','settle'].includes(method)));checks++;};
try{
 // Finished and unfinished guest attempts win over an account's existing run after login.
 for(const phase of ['playing','finished']){
  const guest=saved(phase),{c,p}=await open({guest});await p.locator('#start').click();
  const accountRun=newRun(DAY,NOW,'google-player');await p.evaluate(run=>hkmAuthQA.runs['google-player']=run,accountRun);
  await login(p);assert((await p.locator('#account-status').textContent()).includes('今日匿名局'));await p.locator('[data-close="account-dialog"]').first().click();
  assert.equal((await state(p)).owner,'guest');assert.equal((await state(p)).token,guest.token);assert.equal((await state(p)).run.questionAt,guest.run.questionAt);
  assert.equal(await p.locator('#retry-sync').isVisible(),false);assert.equal(await p.locator(phase==='finished'?'#result-screen':'#game-screen').isVisible(),true);
  if(phase==='playing'){const q=questionFor(guest.run);await p.locator(`[data-choice="${q.answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#next-question').waitFor({state:'visible'});assert.equal((await state(p)).run.correct,1);}
  await noCloudGameWrites(p);await p.locator('#account-open').click();await p.locator('#logout').click();await p.locator('[data-close="account-dialog"]').first().click();assert.equal((await state(p)).token,guest.token);
  await p.reload({waitUntil:'networkidle'});await p.addScriptTag({type:'module',url:new URL('auth-qa.js',base).href});await p.waitForFunction(()=>!document.querySelector('#google-login').disabled);await p.locator('#start').click();assert.equal((await state(p)).owner,'guest');
  await c.close();checks+=7;
 }
 // Account profile failures cannot stop or turn an anonymous result into cloud-sync pending.
 {const {c,p}=await open({guest:saved('finished')});await p.locator('#start').click();await p.evaluate(()=>hkmAuthQA.failAccount=true);await login(p);assert((await p.locator('#account-status').textContent()).includes('今日匿名局仍可'));await p.locator('[data-close="account-dialog"]').first().click();assert(await p.locator('#result-screen').isVisible());await noCloudGameWrites(p);await c.close();checks+=2;}
 // The anonymous timer can finish while an account read is delayed, without a stale rollback.
 {const {c,p}=await open({guest:saved()});await p.locator('#start').click();await p.evaluate(()=>hkmAuthQA.holdAccount=true);await login(p);await p.evaluate(()=>globalThis.__hkmQaNow+=20001);await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).run.phase==='finished',LEDGER_KEY);await p.evaluate(()=>hkmAuthQA.releaseAccount());await p.waitForFunction(()=>document.querySelector('#account-status').textContent.includes('今日匿名局'));await p.locator('[data-close="account-dialog"]').first().click();assert(await p.locator('#result-screen').isVisible());assert.equal((await state(p)).run.reason,'timeout');await noCloudGameWrites(p);await c.close();checks+=2;}
 // Without a guest attempt, cloud errors still show a retry and can recover normally.
 {const {c,p}=await open();await login(p);await p.locator('[data-close="account-dialog"]').first().click();await p.locator('#start').click();await p.evaluate(()=>hkmAuthQA.failMove=true);await p.locator('#life-half').click();await p.locator('#retry-sync').waitFor({state:'visible'});assert((await p.locator('#game-status').textContent()).includes('未獲允許'));await p.evaluate(()=>hkmAuthQA.failMove=false);await p.locator('#retry-sync').click();await p.locator('#retry-sync').waitFor({state:'hidden'});await p.locator('#life-half').click();await p.waitForFunction(()=>document.querySelectorAll('.is-removed').length===2);assert.equal((await state(p)).owner,'google-player');await c.close();checks+=3;}
 // A late rejected cloud action after logout cannot reopen the old pending-game screen.
 {const {c,p}=await open();await login(p);await p.locator('[data-close="account-dialog"]').first().click();await p.locator('#start').click();await p.evaluate(()=>hkmAuthQA.holdMove=true);await p.locator('#life-half').click();await p.waitForFunction(()=>typeof hkmAuthQA.releaseMove==='function');await p.evaluate(()=>hkmAuthQA.setUser(null));await p.evaluate(()=>hkmAuthQA.releaseMove());await p.waitForFunction(()=>!document.querySelector('#lobby').hidden);assert.equal(await p.locator('#retry-sync').isVisible(),false);await c.close();checks+=2;}
 // A delayed profile response cannot sign a player back in after they explicitly logged out.
 {const {c,p}=await open();await p.evaluate(()=>hkmAuthQA.holdAccount=true);await login(p);assert(await p.locator('#start').isDisabled());await p.locator('#logout').click();await p.evaluate(()=>hkmAuthQA.releaseAccount());await p.waitForFunction(()=>!document.querySelector('#signed-out').hidden);assert((await p.locator('#account-label').textContent()).includes('登入'));assert(await p.locator('#start').isEnabled());await p.locator('[data-close="account-dialog"]').first().click();await p.locator('#start').click();await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.owner==='guest',LEDGER_KEY);assert.equal((await state(p)).owner,'guest');await c.close();checks+=4;}
 // A saved guest result remains accessible from the lobby during an account-profile read.
 {const {c,p}=await open({guest:saved('finished')});await p.evaluate(()=>hkmAuthQA.holdAccount=true);await login(p);await p.locator('[data-close="account-dialog"]').first().click();assert(await p.locator('#start').isEnabled());await p.locator('#start').click();await p.locator('#result-screen').waitFor({state:'visible'});await p.evaluate(()=>hkmAuthQA.releaseAccount());assert.equal((await state(p)).owner,'guest');await noCloudGameWrites(p);await c.close();checks+=3;}
 // Clearing today's local key does not sign Firebase out: explicit guest play still stays local.
 {const {c,p}=await open({restoredUid:'cached-google-player',failAccount:true});
  await p.locator('#guest-start').waitFor({state:'visible'});await p.screenshot({path:'/tmp/hkm-anonymous-choice-390.png',fullPage:true});assert.equal((await state(p)),null);
  assert.deepEqual(await p.evaluate(()=>hkmAuthQA.calls),[]);
  await p.locator('#guest-start').click();await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.owner==='guest',LEDGER_KEY);
  const entry=await state(p);assert.equal(entry.run.uid,'guest');await p.locator('#life-half').click();await p.waitForFunction(()=>document.querySelectorAll('.is-removed').length===2);
  const q=questionFor(entry.run);await p.locator(`[data-choice="${q.answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#next-question').waitFor({state:'visible'});
  assert.equal(await p.locator('#retry-sync').isVisible(),false);assert.equal((await state(p)).run.correct,1);assert.deepEqual(await p.evaluate(()=>hkmAuthQA.calls),[]);
  await c.close();checks+=6;
 }
 // A late restored Google identity cannot switch an explicitly selected guest startup to cloud.
 {const {c,p}=await open({restoredUid:'cached-google-player',failAccount:true,delayInitialAuth:true});
  assert(await p.locator('#start').isDisabled());assert(await p.locator('#guest-start').isEnabled());await p.locator('#guest-start').click();
  await p.evaluate(()=>hkmAuthQA.releaseInitialAuth());await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.owner==='guest',LEDGER_KEY);
  assert.equal(await p.locator('#game-screen').isVisible(),true);assert.equal(await p.locator('#retry-sync').isVisible(),false);await noCloudGameWrites(p);assert.deepEqual(await p.evaluate(()=>hkmAuthQA.calls),[]);await c.close();checks+=4;
 }
 // Even if an explicitly requested account read is denied, the unused local guest route works.
 {const {c,p}=await open({restoredUid:'cached-google-player',failAccount:true});await p.locator('#start').click();await p.waitForFunction(()=>document.querySelector('#lobby-status').textContent.includes('未獲允許'));
  assert.equal(await state(p),null);await p.locator('#guest-start').click();await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.owner==='guest',LEDGER_KEY);assert(await p.locator('#game-screen').isVisible());assert.equal(await p.locator('#retry-sync').isVisible(),false);await c.close();checks+=3;
 }
 // An already consumed account day still cannot be replaced with a second anonymous attempt.
 {const marker={day:DAY,owner:'cached-google-player',token:'account-consumed',revision:1,run:null},{c,p}=await open({guest:marker,restoredUid:'cached-google-player',failAccount:true});await p.locator('#guest-start').waitFor({state:'visible'});await p.locator('#guest-start').click();assert.equal((await state(p)).token,'account-consumed');assert((await p.locator('#lobby-status').textContent()).includes('今日已開始帳戶挑戰'));assert.equal(await p.locator('#game-screen').isVisible(),false);await c.close();checks+=3;}
 // A rejected current-version claim must not consume the local opportunity when the server confirms no run.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.evaluate(()=>hkmAuthQA.failClaim=true);await p.locator('#start').click();
  await p.waitForFunction(()=>document.querySelector('#lobby-status').textContent.includes('已解除失敗標記'));
  assert.equal(await state(p),null);assert(await p.evaluate(()=>hkmAuthQA.calls.some(c=>c.method==='currentRun'&&c.server)));
  await p.locator('#guest-start').click();await p.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(p)).owner,'guest');await c.close();checks+=3;
 }
 // Pending reservations can recover even if unrelated account-profile loading fails.
 {const marker={day:DAY,owner:'cached-google-player',token:'failed-start',revision:0,state:'pending',run:null},{c,p}=await open({guest:marker,restoredUid:'cached-google-player',failAccount:true});
  await p.waitForFunction(()=>!document.querySelector('#start').disabled);assert((await p.locator('#guest-start').textContent()).includes('核實'));
  await p.locator('#guest-start').click();await p.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(p)).owner,'guest');
  assert(await p.evaluate(()=>hkmAuthQA.calls.some(c=>c.method==='currentRun'&&c.server)));await c.close();checks+=3;
 }
 // If server verification is denied, never use cached absence or clear the reservation.
 {const marker={day:DAY,owner:'cached-google-player',token:'unverified-start',revision:0,state:'pending',run:null},{c,p}=await open({guest:marker,restoredUid:'cached-google-player',failAccount:true});
  await p.waitForFunction(()=>!document.querySelector('#start').disabled);await p.evaluate(()=>hkmAuthQA.failCurrentRun=true);await p.locator('#guest-start').click();
  await p.waitForFunction(()=>document.querySelector('#lobby-status').textContent.includes('未獲允許'));assert.equal((await state(p)).token,marker.token);assert.equal(await p.locator('#game-screen').isVisible(),false);
  await p.evaluate(()=>hkmAuthQA.failCurrentRun=false);await p.locator('#guest-start').click();await p.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(p)).owner,'guest');await c.close();checks+=3;
 }
 // A claim that actually exists must be confirmed, never released for another anonymous attempt.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.evaluate(()=>hkmAuthQA.claimCommitThenFail=true);await p.locator('#start').click();
  await p.waitForFunction(()=>document.querySelector('#lobby-status').textContent.includes('未獲允許'));const marker=await state(p);assert.equal(marker.state,'confirmed');
  await p.locator('#guest-start').click();assert.equal((await state(p)).token,marker.token);assert.equal(await p.locator('#game-screen').isVisible(),false);
  await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(p)).owner,'cached-google-player');await c.close();checks+=4;
 }
 // An ambiguous network failure keeps the reservation; no fresh absence check is assumed.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.evaluate(()=>{hkmAuthQA.failClaim=true;hkmAuthQA.claimError='unavailable';});await p.locator('#start').click();
  await p.waitForFunction(()=>document.querySelector('#lobby-status').textContent.includes('操作未完成'));const marker=await state(p);assert.equal(marker.state,'pending');
  assert.equal(await p.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='currentRun').length),0);
  await p.evaluate(()=>hkmAuthQA.failClaim=false);await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(p)).token,marker.token);assert.equal((await state(p)).state,'confirmed');await c.close();checks+=4;
 }
 // A second tab cannot release a reservation while the first tab's cloud claim is in flight.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.evaluate(()=>{hkmAuthQA.holdClaim=true;hkmAuthQA.failClaim=true;});await p.locator('#start').click();
  await p.waitForFunction(()=>typeof hkmAuthQA.releaseClaim==='function');const marker=await state(p);assert.equal(marker.state,'pending');
  const second=await c.newPage();second.on('pageerror',error=>errors.push(error.message));await second.goto(base,{waitUntil:'networkidle'});await second.addScriptTag({type:'module',url:new URL('auth-qa.js',base).href});await second.waitForFunction(()=>!document.querySelector('#start').disabled);await second.locator('#guest-start').click();
  await second.waitForFunction(async()=>{const locks=await navigator.locks.query();return locks.pending.some(lock=>lock.name==='hk-millionaire-cloud-start');});
  assert.equal(await second.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='currentRun').length),0);assert.equal((await state(second)).token,marker.token);
  await p.evaluate(()=>hkmAuthQA.releaseClaim());await second.locator('#game-screen').waitFor({state:'visible'});assert.equal((await state(second)).owner,'guest');assert.equal((await state(p)).owner,'guest');await c.close();checks+=5;
 }
 // Hong Kong date / shared challenge label updates while the lobby stays open across midnight.
 {const {c,p}=await open();assert((await p.locator('#today-label').textContent()).includes('香港時間 11月15日'));assert((await p.locator('#challenge-label').textContent()).includes('每日題組 · 第 2 回'));
  await p.evaluate(()=>globalThis.__hkmQaNow=Date.UTC(2026,10,15,16));await p.waitForFunction(()=>document.querySelector('#today-label').textContent.includes('11月16日'));
  assert((await p.locator('#challenge-label').textContent()).includes('第 3 回'));assert.deepEqual(await p.evaluate(()=>hkmAuthQA.calls),[]);await c.close();checks+=4;
 }
 // A rejected first answer exposes its code beside the retry button, then retries the same answer.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});
  await p.evaluate(()=>hkmAuthQA.failMove=true);const first=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);const answer=questionFor(first).answer;
  await p.locator(`[data-choice="${answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#retry-sync').waitFor({state:'visible'});
  assert((await p.locator('#reveal-explanation').textContent()).includes('permission-denied'));assert((await p.locator('#reveal-explanation').textContent()).includes('提交答案'));
  await p.evaluate(()=>hkmAuthQA.failMove=false);await p.locator('#retry-sync').click();await p.locator('#next-question').waitFor({state:'visible'});
  const after=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);assert.equal(after.correct,1);assert.equal(after.answers[0].choice,answer);assert.equal(after.questionAt,first.questionAt);await c.close();checks+=5;
 }
 // An already accepted first answer is adopted from the server, never replayed on retry.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});const first=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);
  await p.evaluate(()=>hkmAuthQA.commitThenFail=true);await p.locator(`[data-choice="${questionFor(first).answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#retry-sync').waitFor({state:'visible'});
  assert((await p.locator('#reveal-explanation').textContent()).includes('核對雲端進度'));await p.locator('#retry-sync').click();await p.locator('#next-question').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='move'&&c.action==='answer').length),1);assert.equal(await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid].correct),1);await c.close();checks+=3;
 }
 // A failed fresh read must keep the page pending instead of trusting a cached playing state.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});const first=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);
  await p.evaluate(()=>hkmAuthQA.failMove=true);await p.locator(`[data-choice="${questionFor(first).answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#retry-sync').waitFor({state:'visible'});
  await p.evaluate(()=>{hkmAuthQA.failMove=false;hkmAuthQA.failCurrentRun=true;});await p.locator('#retry-sync').click();assert(await p.locator('#retry-sync').isVisible());assert(await p.locator('.option').first().isDisabled());
  assert(await p.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='currentRun').every(c=>c.server)));assert.equal(await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid].correct),0);
  await p.evaluate(()=>hkmAuthQA.failCurrentRun=false);await p.locator('#retry-sync').click();await p.locator('#next-question').waitFor({state:'visible'});await c.close();checks+=4;
 }
 // First-answer losses keep the confirmed answer while settlement fails, then settle on reconnect.
 {const {c,p}=await open({restoredUid:'cached-google-player'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});const first=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);
  await p.evaluate(()=>hkmAuthQA.failSettle=true);await p.locator(`[data-choice="${(questionFor(first).answer+1)%4}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#retry-sync').waitFor({state:'visible'});
  assert((await p.locator('#reveal-explanation').textContent()).includes('結算成績'));assert.equal(await p.locator('.is-wrong').count(),1);
  await p.evaluate(()=>hkmAuthQA.failSettle=false);await p.locator('#retry-sync').click();await p.locator('#result-screen').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='move'&&c.action==='answer').length),1);assert.equal(await p.locator('#result-prize').textContent(),'$0');await c.close();checks+=4;
 }
 // Shared browser: Google A and B each have their own daily run, and A resumes its original answer.
 {const {c,p}=await open({restoredUid:'google-a'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});const first=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);
  await p.locator(`[data-choice="${questionFor(first).answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#next-question').waitFor({state:'visible'});
  await switchGoogle(p,'google-b');await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});
  const b=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);assert.equal(b.uid,'google-b');assert.equal(b.correct,0);assert.equal(b.index,0);
  await p.locator(`[data-choice="${(questionFor(b).answer+1)%4}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#result-screen').waitFor({state:'visible'});
  await switchGoogle(p,'google-a');await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid].correct),1);assert.equal(await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid].questionAt),first.questionAt);
  for(const uid of ['google-a','google-b'])assert.equal(await p.evaluate(uid=>hkmAuthQA.calls.filter(c=>c.method==='claimDaily'&&c.uid===uid).length,uid),1);
  assert.equal((await state(p)).accounts['google-b'].state,'confirmed');await c.close();checks+=8;
 }
 // Logging out with a rejected A answer must not carry that pending answer into B's game.
 {const {c,p}=await open({restoredUid:'google-a'});await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});const a=await p.evaluate(()=>hkmAuthQA.runs[hkmAuthQA.uid]);
  await p.evaluate(()=>hkmAuthQA.failMove=true);await p.locator(`[data-choice="${questionFor(a).answer}"]`).click();await p.locator('#confirm-answer').click();await p.locator('#retry-sync').waitFor({state:'visible'});
  await p.evaluate(()=>hkmAuthQA.failMove=false);await switchGoogle(p,'google-b');await p.locator('#start').click();await p.locator('#game-screen').waitFor({state:'visible'});
  assert.equal(await p.locator('#retry-sync').isVisible(),false);assert.equal(await p.evaluate(()=>hkmAuthQA.runs['google-b'].correct),0);
  assert.equal(await p.evaluate(()=>hkmAuthQA.calls.filter(c=>c.method==='move'&&c.uid==='google-b').length),0);assert.equal((await state(p)).accounts['google-a'].state,'confirmed');await c.close();checks+=4;
 }
 // Measure actual icon / label rectangles at narrow, tablet, landscape and desktop widths.
 for(const [width,height]of [[320,850],[390,900],[621,900],[700,900],[812,375],[1280,900]]){
  const {c,p}=await open({guest:saved(),width,height});await p.locator('#start').click();await p.evaluate(()=>document.fonts.ready);
  const overlaps=await p.locator('.lifelines>button').evaluateAll(buttons=>buttons.flatMap(button=>{const icon=button.querySelector('b').getBoundingClientRect();return [...button.querySelectorAll('span,small')].filter(node=>{const text=node.getBoundingClientRect();return Math.min(icon.right,text.right)-Math.max(icon.left,text.left)>1&&Math.min(icon.bottom,text.bottom)-Math.max(icon.top,text.top)>1;}).map(node=>node.textContent);}));
  assert.deepEqual(overlaps,[],width+'px overlapping lifeline text');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.locator('.lifelines').screenshot({path:`/tmp/hkm-lifelines-${width}.png`});await c.close();checks+=2;
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scenarios:25,viewports:6,pageErrors:0,mode:'local account adapter; no live Firebase'}));
}finally{await browser.close();}
