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
try{
 qa.now=Date.UTC(2026,10,28,4);
 const a=await open('same-account');await a.page.locator('#lobby-arcade').click();
 await a.page.getByRole('button',{name:'購買本週末通行',exact:true}).click();await a.page.locator('#arcade-ticket-buy').click();await a.page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);
 for(let i=0;i<2;i++){
  await a.page.getByRole('button',{name:'開始週末挑戰',exact:true}).click();await a.page.locator('.arcade-options button').first().waitFor();
  await a.page.getByRole('button',{name:'割禾青',exact:true}).click();await a.page.getByRole('button',{name:'確認離場',exact:true}).click();await a.page.locator('.arcade-result').waitFor();await a.page.getByRole('button',{name:'返回遊樂場',exact:true}).click();
 }
 const b=await open('same-account');assert.notEqual(a.c,b.c);assert.equal(await b.page.evaluate(()=>localStorage.getItem('sky.hkm.shop.pending.same-account')),null);checks+=2;
 await b.page.locator('#lobby-arcade').click();await b.page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);
 assert((await b.page.locator('.weekend-compact').last().textContent()).includes('3／5'));assert(await b.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isEnabled());checks+=2;
 const paid=qa.person('same-account').w.spent;await b.page.getByRole('button',{name:'開始週末挑戰',exact:true}).click();await b.page.locator('.arcade-options button').first().waitFor();
 assert.equal(qa.person('same-account').w.passUses,3);assert.equal(qa.person('same-account').w.spent,paid);checks+=2;await b.c.close();await a.c.close();
 // A delayed refresh after a change on another device must repaint and release the start button.
 const w=qa.person('reconnect').w;w.pass=weekendKey(hkDay(qa.now));w.passUses=5;
 const t=await open('reconnect');await t.page.locator('#lobby-arcade').click();await t.page.waitForFunction(()=>!document.querySelector('#arcade-retry').disabled);assert(await t.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isDisabled());checks++;
 w.passUses=2;w.revision++;
 const original=qa.rpc.bind(qa);qa.rpc=async(uid,name,args)=>{if(uid==='reconnect'&&name==='wallet')await new Promise(resolve=>setTimeout(resolve,350));return original(uid,name,args);};
 await t.page.locator('#arcade-retry').click();await t.page.waitForTimeout(600);
 assert((await t.page.locator('.weekend-compact').last().textContent()).includes('3／5'),'The fresh quota is rendered after the delayed wallet read');
 assert(await t.page.getByRole('button',{name:'開始週末挑戰',exact:true}).isEnabled());checks+=2;await t.c.close();
 // Both quiz modes scale the visible answer text by exactly 90%, retaining their touch targets.
 for(const [width,height,daily,extra]of [[320,568,12.96,12.96],[390,844,13.8996,13.8996],[1280,900,13.5,13.5],[812,375,10.8,13.5]])for(const kind of ['daily','retry']){
  const uid=kind+width;qa.person(uid).w.retryBoughtDay=hkDay(qa.now);const t=await open(uid,width,height);
  if(kind==='daily')await t.page.locator('#start').click();else{await t.page.locator('#lobby-arcade').click();await t.page.getByRole('button',{name:'開始再挑戰',exact:true}).click();}
  const buttons=t.page.locator(kind==='daily'?'#options button':'.arcade-options button');await buttons.first().waitFor();
  const font=await buttons.first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize));assert(Math.abs(font-(kind==='daily'?daily:extra))<.03,JSON.stringify({width,height,kind,font}));
  if(width<700){assert(await buttons.first().evaluate(n=>n.getBoundingClientRect().height>=52));assert.equal(await buttons.first().evaluate(n=>getComputedStyle(n.parentElement).gridTemplateColumns.split(' ').length),2);checks+=2;}
  assert(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks+=2;await t.c.close();
 }
 assert.deepEqual(errors,[]);console.log('Weekend devices and answer sizing: '+checks+' checks passed (two isolated devices, same account, 3/5 entitlement, delayed refresh, 90% fonts).');
}finally{await browser.close();}
