import {weekendKey} from '../src/economy.js';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {adapter,RoomFixture} from './room-browser-fixture.mjs';
import {hkDay} from '../src/game.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild'),{chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,built=process.env.HKM_BUILD_DIR,manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8'));
const art=Object.fromEntries(Object.entries(manifest.assets).filter(([name])=>name.startsWith('hong-kong-millionaire/assets/')).flatMap(([name,url])=>[[name.split('/').at(-1).replace('.svg',''),new URL('../'+url,base).href],[name.split('/').at(-1),new URL('../'+url,base).href]]));
const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/app.js',import.meta.url))],bundle:true,write:false,format:'esm',logLevel:'silent',plugins:[{name:'room-fixture',setup(b){b.onResolve({filter:/^\.\/cloud\.js$/},args=>args.importer.endsWith('/src/app.js')?{path:'fixture',namespace:'room'}:undefined);b.onLoad({filter:/.*/,namespace:'room'},()=>({contents:adapter,loader:'js'}));if(process.env.HKM_TEST_ARCADE_SOURCE)b.onLoad({filter:/\/src\/arcade-ui\.js$/},async args=>({contents:await readFile(process.env.HKM_TEST_ARCADE_SOURCE,'utf8'),loader:'js',resolveDir:fileURLToPath(new URL('../src/',import.meta.url))}));b.onLoad({filter:/\/src\/art\.js$/},()=>({contents:'export const ART='+JSON.stringify(art),loader:'js'}));}}]});
const qa=new RoomFixture(),browser=await chromium.launch({headless:true}),errors=[];let checks=0;
async function open(uid,width=390,height=844,entry=null,skew=0){
 const mobile=['guest','shop'].includes(uid)&&browser.browserType().name()==='webkit';const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...(mobile?{isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 await c.addInitScript(({uid,now,entry,skew})=>{globalThis.QA_UID=uid;globalThis.qaSkew=skew;globalThis.qaServerNow=now;globalThis.testNow=now+skew;const Native=Date;globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.testNow]));}static now(){return globalThis.testNow;}};Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{globalThis.copied=text;}}});if(entry)localStorage.setItem('sky.hk-millionaire.today.v1',JSON.stringify(entry));},{uid,now:qa.now,entry,skew});
 await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 await c.route(base,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('room-qa.js',base).href;await c.route(harness,r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 const page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));await page.exposeBinding('qaRPC',(_,method,args)=>qa.rpc(uid,method,args));await page.exposeBinding('qaWatch',({page},type,key,d)=>{qa.subscriptions.push({page,type,key,d,uid});setTimeout(()=>qa.broadcast(),0);});
 await page.goto(base,{waitUntil:'networkidle'});await page.addScriptTag({type:'module',url:harness});await page.waitForFunction(()=>!document.querySelector('#google-login').disabled);return {c,page,harness};
}
const original=qa.rpc.bind(qa),calls=[];let failChecks=false;
qa.rpc=async(uid,name,args)=>{calls.push({uid,name,args});if(name==='purchaseStatus'&&failChecks)throw Error('unavailable');return original(uid,name,args);};
const shopCalls=uid=>calls.filter(c=>c.uid===uid&&c.name==='shop').length;
async function seedPending(page,uid,action){await page.evaluate(({uid,action})=>localStorage.setItem('sky.hkm.shop.pending.'+uid,JSON.stringify(action)),{uid,action});}
try{
 qa.now=Date.UTC(2026,10,28,4);
 for(const entry of ['arcade','collection'])for(const receipt of [true,false]){
  const uid=entry+'-'+receipt,person=qa.person(uid),action={type:'pass',requestId:crypto.randomUUID()};
  if(receipt)await qa.rpc(uid,'shop',[action]);else{person.w.pass=weekendKey(hkDay(qa.now));person.w.spent=80000;}
  person.w.passUses=2;const spent=person.w.spent,before=shopCalls(uid),t=await open(uid);await seedPending(t.page,uid,action);
  await t.page.locator(entry==='arcade'?'#lobby-arcade':'#lobby-collection').click();await t.page.waitForFunction(uid=>!localStorage.getItem('sky.hkm.shop.pending.'+uid),uid);
  assert.equal(shopCalls(uid),before);assert.equal(person.w.spent,spent);assert.equal(person.w.passUses,2);checks+=3;
  if(entry==='arcade'){await t.page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);assert(await t.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isEnabled());assert((await t.page.locator('.weekend-compact').last().textContent()).includes('3／5'));checks+=2;}
  else{await t.page.getByRole('button',{name:'抽一張文化卡',exact:true}).click();await t.page.locator('#shop-confirm-dialog').waitFor();assert.equal(shopCalls(uid),before);assert.equal(person.w.spent,spent);checks+=2;}
  await t.c.close();
 }
 // A committed checkout with a lost response is confirmed without replaying the shop transaction.
 {
  const uid='existing-draw',t=await open(uid);await t.page.locator('#lobby-collection').click();await t.page.waitForFunction(()=>document.querySelector('#wallet-balance').textContent!=='—');
  const action={type:'draw',requestId:crypto.randomUUID()};await qa.rpc(uid,'shop',[action]);await seedPending(t.page,uid,action);const before=shopCalls(uid),spent=qa.person(uid).w.spent;
  await t.page.getByRole('button',{name:'抽一張文化卡',exact:true}).click();await t.page.locator('#shop-confirm-dialog').waitFor();
  assert.equal(await t.page.locator('#culture-card-dialog[open]').count(),0);assert.equal(shopCalls(uid),before);assert.equal(qa.person(uid).w.spent,spent);assert.equal(qa.person(uid).w.draws,1);checks+=4;await t.c.close();
 }
 for(const entry of ['arcade','collection']){
  const uid='lost-'+entry,t=await open(uid);await t.page.locator(entry==='arcade'?'#lobby-arcade':'#lobby-collection').click();
  await t.page.getByRole('button',{name:entry==='arcade'?'購買本週末通行':'抽一張文化卡',exact:true}).click();qa.failShop=true;
  await t.page.locator(entry==='arcade'?'#arcade-ticket-buy':'#shop-confirm-buy').click();await t.page.waitForFunction(uid=>!localStorage.getItem('sky.hkm.shop.pending.'+uid),uid);
  assert.equal(shopCalls(uid),1);assert.equal(qa.person(uid).w.spent,entry==='arcade'?80000:10000);checks+=2;
  if(entry==='collection'){await t.page.locator('#culture-card-dialog').waitFor();assert.equal(qa.person(uid).w.draws,1);checks++;}
  await t.c.close();
 }
 // Failed verification preserves the record; later manual verification is read-only if already paid.
 const uid='network',action={type:'pass',requestId:crypto.randomUUID()};await qa.rpc(uid,'shop',[action]);const t=await open(uid);await seedPending(t.page,uid,action);failChecks=true;
 await t.page.locator('#lobby-arcade').click();await t.page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);
 assert(await t.page.locator('#arcade-ticket-recover').isVisible());assert(await t.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isDisabled());checks+=2;
 const before=shopCalls(uid);failChecks=false;await t.page.locator('#arcade-ticket-recover').click();await t.page.waitForFunction(()=>!document.querySelector('#arcade-ticket-recover').offsetParent);
 assert.equal(shopCalls(uid),before);assert(await t.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isEnabled());checks+=2;await t.c.close();
 // An unpaid record is not automatically submitted when opening either screen.
 for(const entry of ['arcade','collection']){
  const uid='unpaid-'+entry,t=await open(uid),action={type:'pass',day:hkDay(qa.now),requestId:crypto.randomUUID()};await seedPending(t.page,uid,action);
  await t.page.locator(entry==='arcade'?'#lobby-arcade':'#lobby-collection').click();await t.page.waitForTimeout(300);
  assert.equal(shopCalls(uid),0);assert.equal(qa.person(uid).w.spent,0);assert(await t.page.evaluate(uid=>!!localStorage.getItem('sky.hkm.shop.pending.'+uid),uid));checks+=3;await t.c.close();
 }
 assert.deepEqual(errors,[]);console.log('Purchase recovery: '+checks+' browser checks passed (pending tickets in both screens, missing receipts with valid entitlement, lost responses, no automatic purchases).');
}finally{await browser.close();}
