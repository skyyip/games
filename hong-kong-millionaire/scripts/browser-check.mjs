// Check the actual compiled landing page, with auth unavailable and no fixture bypass.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL,browser=await chromium.launch({headless:true}),errors=[];let checks=0;
try{
 for(const width of [320,390,768,1280]){
  const c=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await c.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  await c.addInitScript(()=>{globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base,{waitUntil:'networkidle'});
  assert.equal(await p.locator('#guest-start,#sensory-dialog,.sensory-link,[data-practice]').count(),0);
  assert((await p.locator('#start').textContent()).includes('登入／註冊'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('#start').click();assert(await p.locator('#account-dialog').isVisible());assert(!await p.locator('#game-screen').isVisible());
  assert(await p.locator('#auth-retry').isVisible());assert(await p.locator('#google-login').isDisabled());assert.equal(await p.evaluate(()=>localStorage.getItem('sky.hk-millionaire.today.v1')),null);checks+=8;
  await p.screenshot({path:`/tmp/hkm-login-${width}.png`,fullPage:true});await c.close();
 }
 const c=await browser.newContext({serviceWorkers:'block'}),p=await c.newPage();await p.goto(new URL('../',base).href,{waitUntil:'networkidle'});
 const cards=await p.locator('.game-card:not([hidden])').evaluateAll(nodes=>nodes.map(n=>n.dataset.game));assert.equal(cards[1],'hong-kong-millionaire');assert.equal(cards.filter(id=>id==='hong-kong-millionaire').length,1);
 const list=await p.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.flatMap(n=>{const json=JSON.parse(n.textContent);return (json['@graph']??[]).filter(x=>x['@type']==='ItemList');}));
 assert(list.some(l=>l.itemListElement[1].url.endsWith('/hong-kong-millionaire/')));checks+=3;
 await c.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:4,homepagePosition:2,loginRequired:true,pageErrors:0}));
}finally{await browser.close();}
