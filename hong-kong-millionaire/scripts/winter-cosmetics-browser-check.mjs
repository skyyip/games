import {GEAR} from '../src/economy.js';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {adapter,RoomFixture} from './room-browser-fixture.mjs';
import {hkDay,questionFor} from '../src/game.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild'),{chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,built=process.env.HKM_BUILD_DIR,manifest=JSON.parse(await readFile(built+'/build-manifest.json','utf8'));
const art=Object.fromEntries(Object.entries(manifest.assets).filter(([name])=>name.startsWith('hong-kong-millionaire/assets/')).flatMap(([name,url])=>[[name.split('/').at(-1).replace('.svg',''),new URL('../'+url,base).href],[name.split('/').at(-1),new URL('../'+url,base).href]]));
const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/app.js',import.meta.url))],bundle:true,write:false,format:'esm',logLevel:'silent',plugins:[{name:'room-fixture',setup(b){b.onResolve({filter:/^\.\/cloud\.js$/},args=>args.importer.endsWith('/src/app.js')?{path:'fixture',namespace:'room'}:undefined);b.onLoad({filter:/.*/,namespace:'room'},()=>({contents:adapter,loader:'js'}));b.onLoad({filter:/\/src\/reward-effects\.js$/},async args=>({contents:await readFile(args.path,'utf8')+'\nglobalThis.qaExit=playExit;',loader:'js',resolveDir:fileURLToPath(new URL('../src/',import.meta.url))}));b.onLoad({filter:/\/src\/art\.js$/},()=>({contents:'export const ART='+JSON.stringify(art),loader:'js'}));}}]});
const qa=new RoomFixture();qa.now=Date.UTC(2026,10,26,4);const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
async function open(uid,width=390,height=844,entry=null,skew=0){
 const mobile=['guest','shop'].includes(uid)&&browser.browserType().name()==='webkit';const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...(mobile?{isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 await c.addInitScript(({uid,now,entry,skew})=>{globalThis.QA_UID=uid;globalThis.qaSkew=skew;globalThis.qaServerNow=now;globalThis.testNow=now+skew;const Native=Date;globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[globalThis.testNow]));}static now(){return globalThis.testNow;}};Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{globalThis.copied=text;}}});if(entry)localStorage.setItem('sky.hk-millionaire.today.v1',JSON.stringify(entry));},{uid,now:qa.now,entry,skew});
 await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
 await c.route(base,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
 const harness=new URL('room-qa.js',base).href;await c.route(harness,r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 const page=await c.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await page.exposeBinding('qaRPC',(_,method,args)=>qa.rpc(uid,method,args));await page.exposeBinding('qaWatch',({page},type,key,d)=>{qa.subscriptions.push({page,type,key,d,uid});setTimeout(()=>qa.broadcast(),0);});
 await page.goto(base,{waitUntil:'networkidle'});await page.addScriptTag({type:'module',url:harness});await page.waitForFunction(()=>!document.querySelector('#google-login').disabled);return {c,page,harness};
}
const added=GEAR.slice(24),exitIds=['exit-redvan','exit-tram','exit-ferry','exit-gondola'];
try{
 // Purchase/equip uses the real shop UI; reloading must restore all three new themes.
 const user=await open('winter-shop',390),{page,c,harness}=user;
 await page.locator('#lobby-collection').click();await page.locator('[data-tab=gear]').click();
 for(const gear of added){
  const tile=page.locator('[data-gear-id='+gear.id+']'),before=qa.state('winter-shop').balance;
  await tile.getByRole('button',{name:'購買',exact:true}).click();await page.locator('#shop-confirm-buy').click();await page.waitForFunction(()=>!document.querySelector('#shop-refresh').disabled);
  assert.equal(qa.state('winter-shop').balance,before-gear.price);checks++;
  await tile.getByRole('button',{name:'套用',exact:true}).click();await page.locator('#shop-confirm-buy').click();await page.waitForFunction(()=>!document.querySelector('#shop-refresh').disabled);
  assert.equal(qa.person('winter-shop').w[gear.kind],gear.id);assert.equal(qa.state('winter-shop').balance,before-gear.price);checks+=2;
  if(gear.kind==='frame'){
   assert((await tile.locator('.gear-preview').evaluate(n=>getComputedStyle(n,'::after').backgroundImage)).includes(gear.id));
   await tile.locator('.gear-preview').screenshot({path:'/tmp/hkm-winter-'+gear.id+'.png'});checks++;
  }else if(gear.kind==='theme'){
   await tile.locator('img').evaluate(i=>i.decode());
   await page.reload({waitUntil:'networkidle'});await page.addScriptTag({type:'module',url:harness});
   await page.waitForFunction(id=>document.documentElement.dataset.hkmTheme===id,gear.id);
   assert((await page.locator('body').evaluate(n=>getComputedStyle(n).backgroundImage)).includes(gear.id));
   await page.screenshot({path:'/tmp/hkm-winter-'+gear.id+'.png',fullPage:false});checks++;
   await page.locator('#lobby-collection').click();await page.locator('[data-tab=gear]').click();
  }else{await tile.locator('img').evaluate(i=>i.decode());assert((await tile.locator('img').getAttribute('src')).includes(gear.id));checks++;}
 }
 await page.locator('#collection-dialog .close-button').click();
 // The detail artwork maximum is 330 * 1.2 and the dialog maximum 430 * 1.2.
 await page.setViewportSize({width:1280,height:900});await page.locator('#lobby-collection').click();await page.locator('[data-tab=cards]').click();await page.locator('.culture-tile').first().click();
 const size=await page.locator('#culture-card-dialog').evaluate(n=>({dialog:n.getBoundingClientRect().width,face:n.querySelector('.culture-face').getBoundingClientRect().width}));
 assert.equal(size.dialog,516);assert.equal(size.face,396);checks+=2;await page.locator('.card-done').click();await page.locator('#collection-dialog .close-button').click();
 // The real result-card canvas must export with the illustrated frames and themes.
 await page.locator('#start').click();await page.locator('#walk').click();await page.locator('#confirm-walk').click();await page.locator('#result-screen').waitFor({state:'visible'});
 const download=page.waitForEvent('download');await page.locator('#download-result-card').click();const png=await download;
 assert(png.suggestedFilename().endsWith('.png'));assert.equal(await png.failure(),null);checks+=2;await c.close();
 // All four exits are invoked through both daily and arcade settlement paths.
 for(const kind of ['daily','retry'])for(const id of exitIds){
  const uid=kind+'-'+id,person=qa.person(uid);person.w.exit=id;person.w.owned=[id];
  if(kind==='retry'){person.w.retryBoughtDay=hkDay(qa.now);}
  const t=await open(uid,390);await t.page.addInitScript(()=>{globalThis.spoken=[];speechSynthesis.speak=v=>spoken.push(v.text);});
  await t.page.evaluate(()=>{globalThis.spoken=[];speechSynthesis.speak=v=>spoken.push(v.text);});
  if(kind==='daily'){await t.page.locator('#start').click();await t.page.locator('#walk').click();await t.page.locator('#confirm-walk').click();}
  else{await t.page.locator('#lobby-arcade').click();await t.page.getByRole('button',{name:'開始再挑戰',exact:true}).click();await t.page.getByRole('button',{name:/割禾青/}).click();await t.page.getByRole('button',{name:'確認離場',exact:true}).click();}
  const layer=t.page.locator('.redvan-exit');await layer.waitFor();assert(await layer.evaluate((n,id)=>n.classList.contains(id),id));
  await layer.locator('img').evaluate(i=>i.decode());assert((await layer.locator('img').getAttribute('src')).includes(id));
  assert.equal(await layer.evaluate(n=>getComputedStyle(n).pointerEvents),'none');assert.equal(await t.page.evaluate(()=>spoken.length),0);checks+=4;
  if(id!=='exit-redvan'){
   await layer.locator('.redvan-car').evaluate(n=>{for(const a of n.getAnimations())a.currentTime=1600;});
   await layer.screenshot({path:'/tmp/hkm-winter-'+kind+'-'+id+'.png'});
   const metrics=await layer.evaluate(n=>{const r=n.getBoundingClientRect(),car=n.querySelector('.redvan-car').getBoundingClientRect();return {inside:car.left>=r.left&&car.right<=r.right,overflow:getComputedStyle(n).overflow};});assert(metrics.inside&&metrics.overflow==='hidden',JSON.stringify(metrics));checks++;
  }
  await layer.waitFor({state:'detached'});person.w.exit=id==='exit-redvan'?'exit-tram':'exit-redvan';person.w.owned.push(person.w.exit);
  await t.page.reload({waitUntil:'networkidle'});await t.page.addScriptTag({type:'module',url:t.harness});
  const completed=kind==='daily'?qa.dailyRuns.get(uid):[...qa.sessions.values()].find(r=>r.uid===uid);assert(completed?.reason==='walk');
  // Invoke the real renderer again with a different style after its module state is reset.
  await t.page.evaluate(({run,id})=>qaExit(run,id),{run:completed,id:person.w.exit});
  assert.equal(await t.page.locator('.redvan-exit').count(),0);checks++;await t.c.close();
 }
 // Reduced motion keeps a static vehicle; sound requires the player's explicit opt-in.
 const reduced=qa.person('reduced');reduced.w.exit='exit-gondola';reduced.w.owned=['exit-gondola'];const r=await open('reduced',320);await r.page.emulateMedia({reducedMotion:'reduce'});
 await r.page.locator('#start').click();await r.page.locator('#walk').click();await r.page.locator('#confirm-walk').click();await r.page.locator('.redvan-exit').waitFor();
 assert.equal(await r.page.locator('.redvan-car').evaluate(n=>getComputedStyle(n).animationName),'none');checks++;await r.page.locator('.redvan-exit').waitFor({state:'detached'});await r.c.close();
 for(const outcome of ['default','wrong']){
  const p=qa.person(outcome);if(outcome==='wrong'){p.w.exit='exit-tram';p.w.owned=['exit-tram'];}
  const t=await open(outcome);await t.page.locator('#start').click();await t.page.locator('#options button').first().waitFor();
  if(outcome==='default'){await t.page.locator('#walk').click();await t.page.locator('#confirm-walk').click();}
  else{const run=qa.dailyRuns.get(outcome),wrong=(questionFor(run).answer+1)%4;await t.page.locator('#options [data-choice="'+wrong+'"]').click();await t.page.locator('#confirm-answer').click();}
  await t.page.locator('#result-screen').waitFor({state:'visible'});assert.equal(await t.page.locator('.redvan-exit').count(),0);checks++;await t.c.close();
 }
 qa.person('sound').w.exit='exit-ferry';qa.person('sound').w.owned=['exit-ferry'];const sound=await open('sound');
 await sound.page.evaluate(()=>{globalThis.spoken=[];speechSynthesis.speak=v=>spoken.push(v.text);});await sound.page.locator('#lobby-collection').click();await sound.page.locator('#reward-sound').check();await sound.page.locator('#collection-dialog .close-button').click();
 await sound.page.locator('#start').click();await sound.page.locator('#walk').click();await sound.page.locator('#confirm-walk').click();await sound.page.locator('.redvan-exit').waitFor();assert.equal(await sound.page.evaluate(()=>spoken.length),1);checks++;await sound.c.close();
 assert.deepEqual(errors,[]);console.log('Winter cosmetics browser: '+checks+' checks passed (10 purchases/equips, theme refresh, larger detail, share PNG, 8 settlement exits, reduced motion).');
}finally{await browser.close();}
