// Real Firestore Web SDK + local security rules. Auth identities are emulator fixtures.
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';
import {JOBS} from '../src/content.js';
import {accountSaveKey,identityStorageKey} from '../src/account-store.js';
import {installLifeHelpers,clickAndWait,openLifeControl} from './browser-state.mjs';
const require=createRequire(new URL('../package.json',import.meta.url)),{initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const buildRequire=createRequire(new URL('../../tools/package.json',import.meta.url));
const bundled=await buildRequire('esbuild').build({stdin:{contents:"export {initializeApp} from 'firebase/app';export * from 'firebase/firestore';",resolveDir:fileURLToPath(new URL('../',import.meta.url))},bundle:true,format:'esm',write:false});
const sdkBody=bundled.outputFiles[0].text;
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5322/career-365/',built=process.env.CAREER_BUILD_DIR?JSON.parse(await readFile(process.env.CAREER_BUILD_DIR+'/build-manifest.json','utf8')):null;
const env=await initializeTestEnvironment({projectId:'demo-career365',firestore:{host:'127.0.0.1',port:8090,rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const browser=await chromium.launch({headless:true});await installLifeHelpers(browser);
const auth=`import {initializeApp} from '/__spark_sdk.js';export const configured=true;const u=()=>({uid:globalThis.socialTestUid,email:globalThis.socialTestUid+'@example.test',isAnonymous:false});const app=initializeApp({apiKey:'demo-key',authDomain:'demo-career365.firebaseapp.com',projectId:'demo-career365',appId:'1:123:web:demo'},'career-365');export async function observeIdentity(cb){cb(u());return()=>{};}export async function initAuth(){return {session:{app,currentUser:u()}};}`;
const firestore=`import * as sdk from '/__spark_sdk.js';import {initAuth} from '__AUTH__';let ready=false;export async function loadFirestoreSDK(){const {session}=await initAuth();const db=sdk.getFirestore(session.app);if(!ready){ready=true;const uid=globalThis.socialTestUid;sdk.connectFirestoreEmulator(db,'127.0.0.1',8090,{mockUserToken:{sub:uid,user_id:uid,email:uid+'@example.test',firebase:{sign_in_provider:'password',identities:{email:[uid+'@example.test']}}}});}return sdk;}`;
async function ready(p){await p.waitForFunction(()=>!document.querySelector('#social-fields').disabled&&!document.querySelector('#social-feedback').textContent.includes('正在處理'));}
async function tab(p,n){await p.locator(`[data-social-tab=${n}]`).click();await ready(p);}
async function submit(p,f){await p.locator(f+' button').last().click();await ready(p);const msg=await p.locator('#social-feedback').textContent();assert(!/未獲|未完成|配額|索引/.test(msg),msg);}
async function refresh(p){await p.locator('#social-refresh').click();await ready(p);}
async function action(p,selector){await p.locator(selector).click();await ready(p);const msg=await p.locator('#social-feedback').textContent();assert(!/未獲|未完成|配額|索引/.test(msg),msg);}
try{for(const [width,height]of [[320,568],[390,844],[812,375],[1280,900]]){
 await env.clearFirestore();const actors=[];
 async function actor(uid){const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),origin=new URL(base).origin;
  await context.route('**/*',r=>[origin,'http://127.0.0.1:8090'].includes(new URL(r.request().url()).origin)?r.continue():r.abort());
  await context.route('**/__spark_sdk.js',r=>r.fulfill({contentType:'text/javascript',body:sdkBody}));
  const authPath=built?new URL('../'+built.entries['career-365/src/auth.js'],base).pathname:'/career-365/src/auth.js';
  const fsPath=built?new URL('../'+built.entries['career-365/src/firebase-firestore-sdk.js'],base).pathname:'/career-365/src/firebase-firestore-sdk.js';
  await context.route('**'+authPath,r=>r.fulfill({contentType:'text/javascript',body:auth}));await context.route('**'+fsPath,r=>r.fulfill({contentType:'text/javascript',body:firestore.replace('__AUTH__',authPath)}));
  const g=new LifeGame({seed:uid==='alice'?123:234,name:uid==='alice'?'阿莉':'小波'});g.chooseCareer(JOBS[0].id);g.s.life.socialRunId=`life_${uid}_1234567890123456`;const key=accountSaveKey(uid);
  await context.addInitScript(({uid,key,identityKey,state})=>{globalThis.socialTestUid=uid;if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));localStorage.setItem(identityKey,uid);},{uid,key,identityKey:identityStorageKey(),state:g.s});
  const p=await context.newPage(),a={uid,key,p,context,errors:[],requests:[]};p.on('pageerror',e=>a.errors.push(e.stack));p.on('request',r=>a.requests.push(r.url()));p.on('dialog',d=>d.accept(d.type()==='prompt'?'其他':undefined));actors.push(a);
  await p.goto(base,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.getElementById('account-open').textContent.includes('@example.test'));await clickAndWait(p.locator('#continue'));if(await p.locator('#growth-dialog').isVisible())await clickAndWait(p.locator('#growth-dialog .primary'));await openLifeControl(p,'#social-open');await ready(p);await p.locator('#social-card-form').waitFor();
  await p.locator('[name=handle]').fill(uid);await p.locator('[name=bio]').fill(uid==='bob'?'<img src=x onerror=alert(1)>':'一起經營咖啡店');for(const k of ['discoverable','allowInvites','allowReferrals'])await p.locator(`[name=${k}]`).check();await submit(p,'#social-card-form');assert.match(await p.locator('#social-feedback').textContent(),/名片已更新/);return a;
 }
 const alice=await actor('alice'),bob=await actor('bob'),a=alice.p,b=bob.p;
 await tab(a,'friends');await a.locator('#social-find-form [name=handle]').fill('bob');await submit(a,'#social-find-form');assert.equal(await a.locator('#social-content img').count(),0);await action(a,'[data-social-action=friend]');await refresh(b);await tab(b,'inbox');await action(b,'[data-social-action=acceptFriend]');
 await tab(a,'company');await a.locator('#social-company-form [name=name]').fill('河岸咖啡');await a.locator('#social-company-form [name=description]').fill('一起體驗服務工作');await a.locator('#social-company-form [name=terms]').fill('彈性合作，不要求固定上線');await submit(a,'#social-company-form');await a.locator('#social-invite-form [name=handle]').fill('bob');await submit(a,'#social-invite-form');
 await refresh(b);await action(b,'[data-social-action=join]');await refresh(a);await a.locator('#social-task-form [name=title]').fill('遇到客人投訴，怎樣回應？');await a.locator('#social-task-form [name=description]').fill('一起寫下一段回應及可以提供的解法');await submit(a,'#social-task-form');
 await refresh(b);await tab(b,'company');await action(b,'[data-social-action=claimTask]');await b.locator('.social-delivery-form textarea').fill('先聆聽，再一起確認可以提供的解決方法');await submit(b,'.social-delivery-form');await refresh(a);await a.locator('.social-review-form textarea').fill('如果客人不接受原方案，有替代安排嗎？');await action(a,'.social-review-form [value=claimed]');await refresh(b);assert.match(await b.locator('.social-delivery-form textarea').inputValue(),/先聆聽/);await b.locator('.social-delivery-form textarea').fill('先聆聽，再一起確認可以提供的解決方法；回應提問：先列出可接受的替代安排，取得同意再交付。');await submit(b,'.social-delivery-form');await refresh(a);await a.locator('.social-review-form textarea').fill('謝謝，已一起討論完成');await action(a,'.social-review-form [value=completed]');await refresh(b);assert.match(await b.locator('#social-content').textContent(),/負責人已確認/);
 const state=await b.evaluate(async k=>globalThis.__careerTestRead(k),bob.key);assert.equal(state.ap,2);assert.equal(state.life.socialClaims,undefined);assert(!await b.locator('[data-social-action=applyReceipt]').count());
 await tab(b,'history');assert.match(await b.locator('#social-content').textContent(),/謝謝，已一起討論完成/);assert.match(await b.locator('#social-content').textContent(),/合作夥伴：阿莉/);await action(b,'[data-social-action=claimReward]');
 const awarded=await b.evaluate(async k=>globalThis.__careerTestRead(k),bob.key);assert.equal(awarded.life.socialClaims.length,1);assert(awarded.stats.eq>state.stats.eq);assert(awarded.stats.jq>state.stats.jq);assert.equal(awarded.cash,state.cash);assert.equal(awarded.ap,state.ap);assert.deepEqual(awarded.skills,state.skills);assert.equal(awarded.panels.length,state.panels.length+1);assert.match(await b.locator('#social-feedback').textContent(),/EQ \+/);await refresh(b);assert.equal(await b.locator('[data-social-action=claimReward]').count(),0);
 await tab(a,'history');await action(a,'[data-social-action=claimReward]');const reviewed=await a.evaluate(async k=>globalThis.__careerTestRead(k),alice.key);assert.equal(reviewed.life.socialClaims.length,1);
 await b.locator('article[data-receipt] summary').click();await b.evaluate(()=>document.documentElement.style.fontSize='200%');assert(!await b.locator('#social-dialog').evaluate(n=>n.scrollWidth>n.clientWidth+2));await b.evaluate(()=>document.documentElement.style.fontSize='100%');
 await b.screenshot({path:`/tmp/career-spark-history-${width}.png`});await b.keyboard.press('Escape');
 await b.reload({waitUntil:'networkidle'});await clickAndWait(b.locator('#continue'));if(await b.locator('#growth-dialog').isVisible())await clickAndWait(b.locator('#growth-dialog .primary'));await openLifeControl(b,'#social-open');await ready(b);await tab(b,'history');assert.equal(await b.locator('[data-social-action=claimReward]').count(),0);assert.equal((await b.evaluate(async k=>globalThis.__careerTestRead(k),bob.key)).life.socialClaims.length,1);
 await tab(b,'company');

 await tab(a,'company');await action(a,'[data-social-action=handover]');await refresh(b);await action(b,'[data-social-action=acceptHandover]');assert(await b.locator('#social-task-form').count());
 await tab(b,'friends');await refresh(b);await action(b,'[data-social-action=report]');await action(b,'[data-social-action=block]');assert.equal(await b.locator('[data-social-action=note]').count(),0);
 for(const x of actors){assert.deepEqual(x.errors,[]);assert(!await x.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert(!x.requests.some(u=>/cloudfunctions.net|run.app|firebase-functions/.test(u)));await x.context.close();}
 console.log(`PASS ${width}x${height}: actual Firestore SDK/rules, two-player opt-in cards, safe text, friend consent, company invitation, task claim/delivery/manual approval, private history, both roles’ capped growth, saved idempotency after reload, 200% history reflow, accepted handover, reporting/blocking and no Functions calls.`);
}}finally{await browser.close();await env.cleanup();}
