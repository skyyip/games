// Encrypted files + real account/client APIs with an in-memory Firestore transport.
// No production sign-in, database writes, or Firebase credentials are used.
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BBL_URL||'http://127.0.0.1:5436/games/beat-bad-luck/';
const contents=`
import {createPlayerHub} from './beat-bad-luck/src/player-hub.js';
import {createPlayerAPI} from './beat-bad-luck/src/player-api.js';
import {createBackupUI} from './beat-bad-luck/src/backup-ui.js';
import {createBackup} from './beat-bad-luck/src/backup.js';
import {createMemoryFirestore} from './beat-bad-luck/tests/fixtures/player-memory.js';
import {fresh} from './beat-bad-luck/src/progress.js';
import {GIFT_ITEMS,scopeKey} from './beat-bad-luck/src/player-state.js';
(async()=>{
 let time=Date.now()-10000;const mem=createMemoryFirestore(()=>time),callbacks=new Set(),actor={user:null},session={currentUser:null};
 const user=id=>({uid:id,email:id+'@example.test',isAnonymous:false}),make=id=>createPlayerAPI({...mem,uid:id,currentUser:()=>user(id),now:()=>time});
 const alice=make('alice'),bob=make('bob'),item=GIFT_ITEMS.find(x=>x.kind==='weapon'),initial=fresh(time);
 initial.coins=111;initial.owned.push(item.id);initial.weaponUses[item.id]=4;
 await alice.save(initial,'阿明',0);await alice.publish('阿明');await bob.save(fresh(time),'阿花',0);await bob.publish('阿花');
 await alice.request(await bob.card());const friendship=(await bob.friends())[0];await bob.respond(friendship.id,'accepted');
 const backup={...initial,coins:4321,merit:222,weaponUses:{...initial.weaponUses,[item.id]:8}};
 const raw=await createBackup(backup,time);time++;await alice.send(friendship.id,item.token,1);
 let state={...fresh(time),coins:77},key=scopeKey(null),hub;localStorage.setItem(key,JSON.stringify(state));
 const notify=u=>{actor.user=u;session.currentUser=u;for(const fn of callbacks)fn(u);return Promise.resolve({user:u});};
 const auth={session,onAuthStateChanged:(s,fn)=>{callbacks.add(fn);queueMicrotask(()=>fn(actor.user));return()=>callbacks.delete(fn);},GoogleAuthProvider:class{setCustomParameters(){}},signInWithPopup:()=>notify(user(window.nextUID||'alice')),signInWithEmailAndPassword:()=>notify(user(window.nextUID||'alice')),signOut:()=>notify(null)};
 const ui=createBackupUI({getState:()=>state,beforeExport:()=>{},getImportContext:()=>hub?.importContext()??{key:'local',uid:null,label:''},canImport:()=>hub?.canImport()??true,isPlaying:()=>false,isPersistent:()=>true,onImport:async(next,context,backup)=>{if(context.uid)return hub.importBackup(backup,context);state=next;localStorage.setItem(key,JSON.stringify(state));}});
 hub=createPlayerHub({getState:()=>state,setState:s=>{state=s;ui.render();},switchScope:scope=>{key=scopeKey(scope);state=JSON.parse(localStorage.getItem(key)||JSON.stringify(fresh(time)));},saveLocal:()=>localStorage.setItem(key,JSON.stringify(state)),isPlaying:()=>false,cloudEnabled:true,storage:localStorage,loadAuth:async()=>auth,loadAPI:async()=>{
  const api=createPlayerAPI({...mem,uid:actor.user.uid,currentUser:()=>actor.user,now:()=>time}),restore=api.importBackup;
  api.importBackup=async(...args)=>{if(window.failRestore){window.failRestore=false;throw Object.assign(Error('unavailable'),{code:'unavailable'});}if(window.holdRestore)await new Promise(resolve=>window.releaseRestore=resolve);return restore(...args);};return api;
 }});
 document.getElementById('settings-import').onclick=()=>ui.requestImport(document.getElementById('settings-open'));
 document.getElementById('bbl-adopt-file').onclick=()=>ui.requestImport(document.getElementById('bbl-adopt-file'));
 for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>document.getElementById(b.dataset.close).close();
 window.restoreHarness={hub,raw,item,alice,bob,make,getState:()=>state,getGuest:()=>JSON.parse(localStorage.getItem(scopeKey(null))),switchUser:id=>notify(user(id))};
})();`;
const bundle=await build({stdin:{contents,resolveDir:resolve('.')},bundle:true,format:'iife',write:false,logLevel:'silent'});
const browser=await chromium.launch({headless:true});
try{
 for(const [width,mode] of [[390,'google'],[1280,'email'],[320,'first-account']]){
  const c=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
  await c.addInitScript(()=>localStorage.setItem('playground.language.v1','zh-Hant'));
  await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route(url=>url.href.split('?')[0]===base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
  await p.goto(base,{waitUntil:'networkidle'});await p.addScriptTag({content:bundle.outputFiles[0].text});await p.waitForFunction(()=>!!window.restoreHarness);
  await p.locator('#bbl-player-name-input').fill('本機玩家');await p.locator('#bbl-player-name-form button[type=submit]').click();await p.locator('#settings-open').click();await p.waitForFunction(()=>!document.getElementById('bbl-google').disabled);
  if(mode==='first-account')await p.evaluate(()=>window.nextUID='newbie');
  if(mode==='email'){await p.locator('#bbl-email').fill('alice@example.test');await p.locator('#bbl-password').fill('test-password');await p.locator('#bbl-email-submit').click();}else await p.locator('#bbl-google').click();
  if(mode==='first-account')await p.locator('#bbl-adopt-dialog[open]').waitFor();else await p.waitForFunction(()=>restoreHarness.hub.ready);
  const raw=await p.evaluate(()=>restoreHarness.raw);
  async function choose(selector='#settings-import',value=raw){const selecting=p.waitForEvent('filechooser');await p.locator(selector).click();await (await selecting).setFiles({name:'progress.bblsave',mimeType:'application/octet-stream',buffer:Buffer.from(value)});}
  if(mode==='first-account'){
   await choose('#bbl-adopt-file');await p.locator('#import-dialog[open]').waitFor();assert.equal(await p.locator('dialog[open]').count(),1);assert.match(await p.locator('#import-summary').textContent(),/newbie@example.test/);
   await p.locator('#confirm-import').click();await p.waitForFunction(()=>restoreHarness.hub.ready&&restoreHarness.getState().coins===4321);assert.equal((await p.evaluate(async()=>await restoreHarness.make('newbie').load())).revision,1);assert.equal((await p.evaluate(async()=>await restoreHarness.make('newbie').load())).name,'本機玩家');assert.equal(await p.evaluate(()=>restoreHarness.getGuest().coins),77);assert.equal(await p.locator('#bbl-adopt-dialog[open]').count(),0);
   assert.deepEqual(errors,[]);console.log('PASS first account: import directly from the initial account dialog; no fresh-save detour or guest overwrite.');await c.close();continue;
  }
  if(!await p.locator('#settings-dialog').evaluate(n=>n.open))await p.locator('#settings-open').click();assert(await p.locator('#settings-import').isEnabled());
  await choose('#settings-import','invalid backup');await p.waitForFunction(()=>document.getElementById('settings-save-status').textContent.includes('驗證失敗'));assert.equal(await p.evaluate(()=>restoreHarness.getState().coins),111);
  await choose();await p.locator('#import-dialog[open]').waitFor();assert.match(await p.locator('#import-summary').textContent(),/alice@example.test/);assert.match(await p.locator('#import-warning').textContent(),/互贈/);await p.locator('#cancel-import').click();await p.locator('#settings-dialog[open]').waitFor();assert.equal((await p.evaluate(async()=>await restoreHarness.alice.load())).state.coins,111);
  await choose();await p.locator('#import-dialog[open]').waitFor();await p.evaluate(()=>window.failRestore=true);await p.locator('#confirm-import').click();await p.waitForFunction(()=>document.getElementById('import-feedback').textContent.includes('未能儲存'));assert.equal(await p.evaluate(()=>restoreHarness.getState().coins),111);assert(await p.locator('#confirm-import').isEnabled());
  await p.evaluate(()=>window.holdRestore=true);await p.locator('#confirm-import').click();await p.waitForFunction(()=>typeof releaseRestore==='function');assert(await p.locator('#confirm-import').isDisabled());assert(await p.locator('#cancel-import').isDisabled());assert.equal(await p.evaluate(()=>restoreHarness.getState().coins),111);
  await p.evaluate(()=>{window.holdRestore=false;releaseRestore();});await p.waitForFunction(()=>restoreHarness.getState().coins===4321&&!restoreHarness.hub.importing);await p.locator('#settings-dialog[open]').waitFor();
  assert.equal(await p.evaluate(()=>restoreHarness.getState().weaponUses[restoreHarness.item.id]),3);assert.equal(await p.evaluate(()=>restoreHarness.getGuest().coins),77);assert.equal(await p.evaluate(()=>restoreHarness.alice.quota()),1);assert.equal((await p.evaluate(()=>restoreHarness.bob.gifts())).incoming.length,1);
  await choose();await p.locator('#import-dialog[open]').waitFor();await p.locator('#confirm-import').click();await p.waitForFunction(()=>!restoreHarness.hub.importing&&!document.getElementById('import-dialog').open);assert.equal(await p.evaluate(()=>restoreHarness.getState().weaponUses[restoreHarness.item.id]),3);
  await choose();await p.locator('#import-dialog[open]').waitFor();await p.evaluate(async()=>{const remote=await restoreHarness.alice.load();remote.state.coins=9000;await restoreHarness.alice.save(remote.state,remote.name,remote.revision);});await p.locator('#confirm-import').click();await p.waitForFunction(()=>document.getElementById('import-feedback').textContent.includes('較新的進度'));assert.equal(await p.evaluate(()=>restoreHarness.getState().coins),4321);assert.equal((await p.evaluate(()=>restoreHarness.alice.load())).state.coins,9000);await p.locator('#cancel-import').click();await p.locator('#settings-dialog[open]').waitFor();p.once('dialog',d=>d.accept());await p.locator('#bbl-cloud-pull').click();await p.waitForFunction(()=>restoreHarness.getState().coins===9000&&!restoreHarness.hub.blocked);
  // Account changes while the file chooser is open cannot redirect the old selection.
  const selecting=p.waitForEvent('filechooser');await p.locator('#settings-import').click();const chooser=await selecting;await p.evaluate(()=>restoreHarness.switchUser('bob'));await p.waitForFunction(()=>restoreHarness.hub.uid==='bob'&&restoreHarness.hub.ready);await chooser.setFiles({name:'progress.bblsave',mimeType:'application/octet-stream',buffer:Buffer.from(raw)});await p.waitForFunction(()=>document.getElementById('settings-save-status').textContent.includes('帳戶已切換'));assert.equal(await p.locator('#import-dialog[open]').count(),0);assert.notEqual((await p.evaluate(()=>restoreHarness.bob.load())).state.coins,4321);
  await choose();await p.locator('#import-dialog[open]').waitFor();await p.evaluate(()=>restoreHarness.switchUser('alice'));await p.waitForFunction(()=>restoreHarness.hub.uid==='alice'&&restoreHarness.hub.ready);assert.equal(await p.locator('#import-dialog[open]').count(),0);assert.equal((await p.evaluate(()=>restoreHarness.alice.load())).state.coins,9000);
  assert.deepEqual(errors,[]);console.log('PASS '+mode+' '+width+'px: encrypted account import, cancel, invalid file, failed write/retry, server acknowledgement, gift inventory and quota preservation, repeat restore, revision conflict and account-switch guards.');await c.close();
 }
}finally{await browser.close();}
