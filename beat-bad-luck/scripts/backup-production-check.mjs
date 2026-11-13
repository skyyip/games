// Production entry, real Auth/Firestore SDKs, local Firebase emulators only.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createBackup} from '../src/backup.js';
import {fresh} from '../src/progress.js';
const require=createRequire(new URL('../package.json',import.meta.url));
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing'),sdk=require('firebase/firestore');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const env=await initializeTestEnvironment({projectId:'demo-beat-bad-luck',firestore:{host:'127.0.0.1',port:8087}});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await context.addInitScript(()=>{window.BBL_EMULATORS=true;window.BBL_FIREBASE_CONFIG={apiKey:'fake-api-key',projectId:'demo-beat-bad-luck',authDomain:'demo-beat-bad-luck.firebaseapp.com',appId:'demo-web-app'};localStorage.setItem('playground.language.v1','zh-Hant');});
 await context.route('https://**',route=>route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BBL_URL||'http://127.0.0.1:5436/games/beat-bad-luck/',{waitUntil:'networkidle'});
 await page.locator('#bbl-name-dialog[open]').waitFor();await page.locator('#bbl-player-name-input').fill('備份玩家');await page.locator('#bbl-player-name-form button[type=submit]').click();
 const guest=await page.evaluate(()=>localStorage.getItem('beat-bad-luck.stall.v1'));
 await page.locator('#settings-open').click();await page.waitForFunction(()=>!document.getElementById('bbl-email-submit').disabled);
 const email='restore-'+Date.now()+'@example.test';await page.locator('#bbl-account-mode').selectOption('register');await page.locator('#bbl-email').fill(email);await page.locator('#bbl-password').fill('LocalEmulatorOnly123');await page.locator('#bbl-email-submit').click();
 await page.locator('#bbl-adopt-dialog[open]').waitFor();
 const uid=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('firebase:authUser:'));return JSON.parse(localStorage.getItem(key)).uid;});
 const backup=await createBackup({...fresh(),coins:4321,merit:222});
 const choosing=page.waitForEvent('filechooser');await page.locator('#bbl-adopt-file').click();await (await choosing).setFiles({name:'progress.bblsave',mimeType:'application/octet-stream',buffer:Buffer.from(backup)});
 await page.locator('#import-dialog[open]').waitFor();assert.match(await page.locator('#import-summary').textContent(),new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(await page.locator('dialog[open]').count(),1);await page.screenshot({path:'/tmp/bbl-account-import-confirm.png'});
 await page.locator('#confirm-import').click();await page.waitForFunction(()=>!document.getElementById('import-dialog').open);await page.waitForFunction(()=>document.getElementById('save-tools-status').textContent.includes('同步到目前帳戶'));
 const db=env.authenticatedContext(uid).firestore(),remote=await sdk.getDoc(sdk.doc(db,'bbl_saves',uid));assert(remote.exists());assert.equal(JSON.parse(remote.data().payload).coins,4321);assert.equal(remote.data().revision,1);assert.equal(remote.data().name,'備份玩家');assert.equal(await page.evaluate(()=>localStorage.getItem('beat-bad-luck.stall.v1')),guest);
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#settings-open').click();await page.waitForFunction(()=>!document.getElementById('settings-import').disabled);assert.match(await page.locator('#bbl-account-state').textContent(),new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal((await sdk.getDoc(sdk.doc(db,'bbl_saves',uid))).data().revision,1);assert.deepEqual(errors,[]);
 console.log('PASS built production entry: real Email registration, direct encrypted backup import, cloud revision 1, retained guest save and signed-in import after reload. Only local Auth/Firestore emulators used.');
}finally{await browser.close();await env.cleanup();}
