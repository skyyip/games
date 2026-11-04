import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LifeGame,SAVE_KEY} from '../src/game.js';
import {JOBS} from '../src/content.js';
import {accountSaveKey,identityStorageKey} from '../src/account-store.js';
import {installLifeHelpers,clickAndWait} from './browser-state.mjs';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CAREER_URL||'http://localhost:5311/career-365/';
const browser=await chromium.launch({headless:true});await installLifeHelpers(browser);
const own={apiKey:'independent-fixture-key',authDomain:'career-isolation-fixture.firebaseapp.com',projectId:'career-isolation-fixture',appId:'1:123:web:fixture'};
const mock=`let apps=[],callback,session;export async function loadAuthSDK(){return [{getApps:()=>apps,initializeApp:(options,name)=>{globalThis.initializedProject=options.projectId;const app={name,options};apps.push(app);return app;}},{getAuth:app=>(session={app,currentUser:null}),browserLocalPersistence:{},setPersistence:async()=>{},onAuthStateChanged:(s,cb)=>{callback=cb;cb(null);return()=>{};},signInAnonymously:async()=>{session.currentUser={uid:'same-uid',isAnonymous:true};callback(session.currentUser);return {user:session.currentUser};}}];}`;
const guest=new LifeGame({seed:123,name:'本機訪客人生'});guest.chooseCareer(JOBS[0].id);
const old=new LifeGame({seed:456,name:'舊專案人生'});old.chooseCareer(JOBS[1].id);
try{
 for(const [width,height]of [[320,568],[390,844],[812,375],[1280,900]]){
  for(const kind of ['disabled','shared',...(process.env.CAREER_SOURCE_CASES==='1'?['independent']:[])]){
   const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),origin=new URL(base).origin,requests=[];
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   if(kind==='independent')await context.route('**/career-365/src/firebase-auth-sdk.js',r=>r.fulfill({contentType:'text/javascript',body:mock}));
   const config=kind==='disabled'?null:kind==='shared'?{...own,projectId:'sky-playground-3c5af',appId:'1:807256166215:web:3b74201e02ba261b7ac662'}:own;
   const oldKey=accountSaveKey('same-uid',null),newKey=accountSaveKey('same-uid',own.projectId);
   await context.addInitScript(({config,guest,old,oldKey})=>{
    globalThis.CAREER_FIREBASE_CONFIG=config;
    if(!localStorage.getItem('isolation.seeded')){localStorage.setItem('isolation.seeded','1');localStorage.setItem('career-365.save.v1',JSON.stringify(guest));localStorage.setItem(oldKey,JSON.stringify(old));localStorage.setItem('career-365.identity.v1','same-uid');}
   },{config,guest:guest.s,old:old.s,oldKey});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));page.on('request',r=>requests.push(r.url()));
   await page.goto(base,{waitUntil:'networkidle'});
   // Store the old account in the durable legacy schema, not just a full JSON fallback.
   await page.evaluate(async({oldKey,old})=>{
    const db=await new Promise((ok,no)=>{const r=indexedDB.open('career-365.lives.v2',1);r.onupgradeneeded=()=>{r.result.createObjectStore('lives');r.result.createObjectStore('panels');};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
    const {panels,...state}=old;await new Promise((ok,no)=>{const tx=db.transaction(['lives','panels'],'readwrite');tx.objectStore('lives').put({state,run:'legacy-run',revision:5,count:panels.length},oldKey);panels.forEach((p,i)=>tx.objectStore('panels').put(p,[oldKey,'legacy-run',i]));tx.oncomplete=ok;tx.onerror=()=>no(tx.error);});db.close();
    localStorage.setItem(oldKey,JSON.stringify({format:'idb-v1',revision:5,run:'legacy-run',count:panels.length}));
   },{oldKey,old:old.s});
   const preserved=await page.evaluate(key=>localStorage.getItem(key),oldKey);
   await clickAndWait(page.locator('#continue'));if(await page.locator('#growth-dialog').isVisible())await clickAndWait(page.locator('#growth-dialog .primary'));
   assert.match(await page.locator('#profile').textContent(),/本機訪客人生/);
   await clickAndWait(page.locator('#account-open'));
   if(kind!=='independent'){
    await page.waitForFunction(()=>!document.querySelector('#account-feedback').textContent.includes('準備'));
    assert.match(await page.locator('#account-feedback').textContent(),kind==='disabled'?/尚未設定/:/獨立 Firebase 專案/);
    assert(await page.locator('#account-google').isDisabled());assert(await page.locator('#account-anonymous').isDisabled());
    assert(!requests.some(url=>url.includes('identitytoolkit.googleapis.com')||url.includes('securetoken.googleapis.com')));
    assert.equal(await page.evaluate(()=>globalThis.initializedProject),undefined);
   }else{
    await page.waitForFunction(()=>!document.querySelector('#account-anonymous').disabled);
    assert.equal(await page.evaluate(()=>globalThis.initializedProject),own.projectId);
    assert(requests.some(url=>url.endsWith('/career-365/src/firebase-auth-sdk.js')));
    await clickAndWait(page.locator('#account-anonymous'));
    await page.waitForFunction(()=>document.querySelector('#account-adopt').hidden===false);
    assert(await page.locator('#continue').isHidden()); // Same UID must not restore the old project's life.
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),newKey),null);
    await clickAndWait(page.locator('#account-adopt'));
    if(await page.locator('#growth-dialog').isVisible())await clickAndWait(page.locator('#growth-dialog .primary'));
    assert.equal((await page.evaluate(async key=>globalThis.__careerTestRead(key),newKey)).profile.name,'本機訪客人生');
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),identityStorageKey(own.projectId)),'same-uid');
    await clickAndWait(page.locator('#account-open'));
   }
   assert(await page.locator('#account-export-legacy').isVisible());
   const download=page.waitForEvent('download');await clickAndWait(page.locator('#account-export-legacy'));
   const file=await download,exported=JSON.parse(await readFile(await file.path(),'utf8'));
   assert.equal(exported.profile.name,'舊專案人生');assert.equal(exported.panels.length,old.s.panels.length);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),oldKey),preserved);
   assert(!requests.some(url=>url.includes('frogger-jump/src/firebase')));assert.deepEqual(errors,[]);
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   await context.close();console.log(`PASS ${width}x${height}: ${kind}, local play, legacy IndexedDB export, project isolation.`);
  }
 }
}finally{await browser.close();}
