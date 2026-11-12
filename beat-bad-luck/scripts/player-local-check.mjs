// Production entry point: no fake Auth or Firestore transport is injected.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.BBL_URL||'http://127.0.0.1:5434/games/beat-bad-luck/';
try{
 for(const blocked of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  // Explicitly exercise the local-only fallback even when production has a config.
  await context.addInitScript(()=>{globalThis.BBL_FIREBASE_CONFIG=null;});
  await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  if(blocked)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}}));
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base,{waitUntil:'networkidle'});
  await p.locator('#bbl-name-dialog[open]').waitFor();
  await p.locator('#bbl-player-name-input').fill('阿明<img src=x>');
  await p.locator('#bbl-player-name-form button[type=submit]').click();
  assert.equal(await p.locator('#prepare-worry-title strong').textContent(),'阿明<img src=x>');
  assert.equal(await p.locator('#prepare-worry-title').textContent(),'阿明<img src=x>！今日有咩令你心塞？');
  assert.equal(await p.locator('#prepare-worry-title img').count(),0);
  if(!blocked){await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('#bbl-name-dialog[open]').count(),0);assert.equal(await p.locator('#prepare-worry-title strong').textContent(),'阿明<img src=x>');}
  await p.locator('#settings-open').click();
  assert.equal(await p.locator('#settings-dialog[open]').count(),1);
  assert.equal(await p.locator('dialog[open]').count(),1);
  assert.equal(await p.locator('#bbl-account-dialog,#bbl-account-open').count(),0);
  for(const selector of ['#bbl-account-form','#settings-sound','#settings-voice','#settings-export','#settings-import'])assert.equal(await p.locator('#settings-dialog '+selector).count(),1);
  assert.ok(!(await p.locator('#settings-save-help').textContent()).includes('匯出為加密 .bblsave 文件，匯入不需密碼。'));assert(await p.locator('#bbl-google').isDisabled());
  assert.match(await p.locator('#bbl-account-feedback').textContent(),/Firebase/);
  if(!blocked){const pending=p.waitForEvent('download');await p.locator('#settings-export').click();assert.match((await pending).suggestedFilename(),/\.bblsave$/);}
  await p.locator('#settings-dialog .dialog-x').click();
  await p.locator('#worry-select').selectOption('noise');
  await p.locator('#start').click();
  await p.locator('#play-panel[data-phase="incense"]').waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS production local entry: safe highlighted name, '+(blocked?'blocked-storage play':'persisted name on reload')+', disabled unconfigured login, ritual starts.');
  await context.close();
 }
 if(process.env.BBL_PORTABLE_DIR){
  for(const name of ['beat-bad-luck.html','beat-bad-luck-skills-demo.html']){
   const html=await readFile(process.env.BBL_PORTABLE_DIR+'/'+name,'utf8'),context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));
   await p.route('https://preview.test/**',r=>r.fulfill({body:'<iframe sandbox="allow-scripts" style="width:100vw;height:100vh"></iframe>',contentType:'text/html'}));
   await p.goto('https://preview.test/');await p.locator('iframe').evaluate((n,content)=>n.srcdoc=content,html);
   const frame=p.frameLocator('iframe');await frame.locator('#bbl-name-skip').click();await frame.locator('#worry-select').selectOption('noise');await frame.locator('#start').click();await frame.locator('#play-panel[data-phase="incense"]').waitFor();
   assert.deepEqual(errors,[]);console.log('PASS opaque local-only portable entry: '+name);await context.close();
  }
 }
}finally{await browser.close();}
