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
import {newRun,act,hkDay} from ${JSON.stringify(gamePath)};
const q=globalThis.hkmAuthQA={uid:null,nextUid:'google-player',runs:{},calls:[],holdAccount:false,failAccount:false,failMove:false};
const profile=uid=>({uid,displayName:'街坊'+uid,total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:null});
const copy=value=>value?JSON.parse(JSON.stringify(value)):null;
const call=method=>{q.calls.push({method,uid:q.uid});return q.uid;};
q.setUser=uid=>{q.uid=uid;q.notification=Promise.resolve(q.callback?.(uid?{uid,email:uid+'@example.test'}:null));return q.notification;};
export const configured=true;
export async function prepareAuth(){}
export async function observeAuth(callback){q.callback=callback;await q.setUser(q.uid);return ()=>{};}
export function googleLogin(){const task=Promise.resolve().then(()=>{q.setUser(q.nextUid);return {user:{uid:q.uid}};});return {task,popup:{dispose(){},open(){}}};}
export function emailLogin(){return q.setUser('email-player');}
export function logout(){return q.setUser(null);}
export async function account(){const uid=call('account');if(q.failAccount)throw {code:'permission-denied'};if(q.holdAccount)return new Promise(resolve=>{q.releaseAccount=()=>{q.holdAccount=false;resolve(profile(uid));};});return profile(uid);}
export async function resumeAccount(){const uid=call('resumeAccount');return {profile:await account(),run:copy(q.runs[uid])};}
export async function claimDaily(){const uid=call('claimDaily');return copy(q.runs[uid]??=(newRun(hkDay(),Date.now(),uid)));}
export async function currentRun(){const uid=call('currentRun');return copy(q.runs[uid]);}
export async function move(day,action){const uid=call('move');if(q.failMove)throw {code:'permission-denied'};if(q.holdMove)return new Promise((resolve,reject)=>{q.releaseMove=()=>{q.holdMove=false;reject({code:'permission-denied'});};});q.runs[uid]=act(q.runs[uid],action,Date.now());return copy(q.runs[uid]);}
export async function settle(){call('settle');throw {code:'permission-denied'};}
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
async function open({guest=null,width=390,height=900}={}){
 const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
 await c.addInitScript(({now,key,guest})=>{globalThis.__hkmQaNow=now;const Native=Date;globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.__hkmQaNow]));}static now(){return globalThis.__hkmQaNow;}};if(guest&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(guest));},{now:NOW,key:LEDGER_KEY,guest});
 await c.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await c.route(base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('auth-qa.js',base).href;await c.route(harness,route=>route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 const p=await c.newPage();p.on('pageerror',error=>errors.push(error.message));
 await p.goto(base,{waitUntil:'networkidle'});await p.addScriptTag({type:'module',url:harness});await p.waitForFunction(()=>!document.querySelector('#google-login').disabled);
 return {c,p};
}
async function login(p){await p.locator('#account-open').click();await p.locator('#google-login').click();await p.waitForFunction(()=>!!globalThis.hkmAuthQA.uid&&!document.querySelector('#logout').disabled);}
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
 // Measure actual icon / label rectangles at narrow, tablet, landscape and desktop widths.
 for(const [width,height]of [[320,850],[390,900],[621,900],[700,900],[812,375],[1280,900]]){
  const {c,p}=await open({guest:saved(),width,height});await p.locator('#start').click();await p.evaluate(()=>document.fonts.ready);
  const overlaps=await p.locator('.lifelines>button').evaluateAll(buttons=>buttons.flatMap(button=>{const icon=button.querySelector('b').getBoundingClientRect();return [...button.querySelectorAll('span,small')].filter(node=>{const text=node.getBoundingClientRect();return Math.min(icon.right,text.right)-Math.max(icon.left,text.left)>1&&Math.min(icon.bottom,text.bottom)-Math.max(icon.top,text.top)>1;}).map(node=>node.textContent);}));
  assert.deepEqual(overlaps,[],width+'px overlapping lifeline text');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.locator('.lifelines').screenshot({path:`/tmp/hkm-lifelines-${width}.png`});await c.close();checks+=2;
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scenarios:7,viewports:6,pageErrors:0,mode:'local account adapter; no live Firebase'}));
}finally{await browser.close();}
