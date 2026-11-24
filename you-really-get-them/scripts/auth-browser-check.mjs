import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {firebaseSDKSource,installBrowserFirebaseFixture} from '../tests/fixtures/firebase-sdk.mjs';
if(!process.env.GRID_RUSH_PLAYWRIGHT_MODULE)throw Error('Set GRID_RUSH_PLAYWRIGHT_MODULE to an installed Playwright module.');
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.YRGT_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1';
let checks=0;const errors=[];
async function open(options={}){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent,serviceWorkers:'block'});
  await context.addInitScript(installBrowserFirebaseFixture,options);
  await context.route('https://www.gstatic.com/firebasejs/**',route=>route.fulfill({contentType:'text/javascript',body:firebaseSDKSource}));
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.waitForFunction(()=>!document.querySelector('#authBtn').disabled);
  return {context,page};
}
async function menu(page){await page.locator('#actionMenu').evaluate(node=>node.open=true)}
async function login(page){await menu(page);await page.locator('#authBtn').click();await page.locator('#googleSignIn').click()}
async function signedIn(page,name='Google P'){
  await page.waitForFunction(text=>document.querySelector('#authBtn').textContent.startsWith('登出 · '+text),name);
  assert(await page.locator('#authBtn').isEnabled());checks++;
}
try{
  // No Firestore response: identity works immediately, before and after reload.
  {
    const {context,page}=await open({profileMode:'pending'});
    await page.evaluate(()=>{
      localStorage.setItem('yrgt-save-v1:guest',JSON.stringify({coins:30,cards:['d_1']}));
      localStorage.setItem('yrgt-save-v1:google-player',JSON.stringify({coins:120,cards:['m_1']}));
    });
    const initialURL=page.url();await login(page);await signedIn(page);
    assert.equal(page.url(),initialURL);assert.equal(await page.locator('#modal').evaluate(node=>node.open),false);
    assert.equal(await page.evaluate(()=>__yrgtFirebase.calls[0].kind),'signIn');
    assert.equal(await page.evaluate(()=>__yrgtFirebase.calls[0].activation),true);checks++;
    assert.equal(await page.evaluate(()=>__yrgtFirebase.writes.length),0);
    assert.equal(await page.locator('#playerNameBtn').isDisabled(),true);checks+=5;
    await page.reload();await signedIn(page);
    assert.equal(await page.locator('#modal').evaluate(node=>node.open),false);
    assert.equal(await page.evaluate(()=>__yrgtFirebase.writes.length),0);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:google-player')).cards),['m_1']);
    assert.deepEqual(await page.evaluate(()=>__yrgtFirebase.options.persistence.map(p=>p.type)),['LOCAL','SESSION']);checks+=4;
    await menu(page);await page.locator('#authBtn').click();await page.reload();
    await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='登入');checks++;
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:guest')).cards),['d_1']);checks++;
    await context.close();
  }
  // Once the profile arrives, its name and collection are applied.
  {
    const {context,page}=await open();await login(page);await signedIn(page,'雲端玩家');
    assert.equal(await page.locator('#modal').evaluate(node=>node.open),false);
    assert.equal(await page.locator('#playerNameBtn').textContent(),'玩家：雲端玩家');
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('yrgt-save-v1:google-player')).cards),['w_1','c_1']);
    assert.equal(await page.evaluate(()=>__yrgtFirebase.writes.length),0);checks+=4;
    await page.reload();await signedIn(page,'雲端玩家');await context.close();
  }
  // A profile failure must neither log out the player nor overwrite favorites.
  {
    const {context,page}=await open({profileMode:'error'});await login(page);await signedIn(page);
    assert((await page.locator('#authBtn').getAttribute('title')).includes('暫時未能同步'));
    assert.equal(await page.evaluate(()=>__yrgtFirebase.writes.length),0);checks+=2;
    await page.reload();await signedIn(page);await context.close();
  }
  // Session storage is sufficient for a refresh if local persistence is unavailable.
  {
    const {context,page}=await open({sessionOnly:true});await login(page);await signedIn(page,'雲端玩家');
    await page.reload();await signedIn(page,'雲端玩家');await context.close();
  }
  for(const code of ['auth/popup-blocked','auth/popup-closed-by-user']){
    const {context,page}=await open({popupError:code}),url=page.url();await login(page);
    await page.waitForFunction(()=>{const feedback=document.querySelector('#authFeedback')?.textContent;return feedback&&feedback!=='處理中…'&&!document.querySelector('#googleSignIn').disabled});
    assert.equal(page.url(),url);assert(await page.locator('#googleSignIn').isEnabled());
    assert.equal(await page.locator('#authBtn').textContent(),'登入');checks+=3;
    await page.evaluate(()=>__yrgtFirebase.popupError=null);await page.locator('#googleSignIn').click();await signedIn(page,'雲端玩家');
    await context.close();
  }
  // Linking a signed-in guest retains their Firebase uid.
  {
    const {context,page}=await open({profileMode:'pending'});
    await menu(page);await page.locator('#authBtn').click();await page.locator('#anonymousSignIn').click();
    await page.waitForFunction(()=>document.querySelector('#authBtn').textContent==='訪客 · 升級');
    await login(page);await signedIn(page);
    assert.equal(await page.evaluate(()=>__yrgtFirebase.auth.currentUser.uid),'guest-player');
    assert.equal(await page.evaluate(()=>__yrgtFirebase.calls[0].kind),'link');checks+=2;
    await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`Auth browser regression: ${checks} checks passed (Chromium, iOS Chrome UA, Firebase SDK double). This does not verify real iOS or Google OAuth.`);
}finally{await browser.close()}
