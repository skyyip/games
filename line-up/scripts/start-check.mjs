// Regression for script-enabled previews that prohibit native form submission.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.LINE_UP_URL||'http://localhost:5173/line-up/';
let checks=0;
try {
  for(const language of ['zh-Hant','en'])for(const action of ['click','tap','button-enter','name-enter']) {
    const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',
      viewport:{width:action==='tap'?375:1440,height:900},hasTouch:action==='tap',isMobile:action==='tap'});
    await context.addInitScript(language=>{
      localStorage.setItem('playground.language.v1',language);Math.random=()=>.99;
    },language);
    await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
    const host=new URL('__start-check__',base).href;
    await context.route(host,r=>r.fulfill({contentType:'text/html',body:
      `<iframe title="Game preview" sandbox="allow-scripts allow-same-origin" src="${base}" style="width:100%;height:850px;border:0"></iframe>`}));
    const page=await context.newPage(),errors=[],blocked=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.text().includes('Blocked form submission'))blocked.push(message.text());});
    await page.goto(host);const frame=page.frameLocator('iframe');
    await frame.locator('#player-0').fill('Sky');
    if(action==='click')await frame.locator('#start').click();
    if(action==='tap')await frame.locator('#start').tap();
    if(action==='button-enter')await frame.locator('#start').press('Enter');
    if(action==='name-enter')await frame.locator('#player-0').press('Enter');
    assert.equal(await frame.locator('#handoff').isVisible(),true);
    assert.equal(await frame.locator('#setup').isVisible(),false);
    assert.equal(await frame.locator('#next-player').textContent(),'Sky');
    if(action==='click') {
      for(let player=0;player<2;player++) {
        await frame.locator('#ready').click();await frame.locator('#whole-outline').click();await frame.locator('#lock').click();
      }
      assert.equal(await frame.locator('#result').isVisible(),true);
      await frame.locator('#again').click();assert.equal(await frame.locator('#handoff').isVisible(),true);
      assert.equal(await frame.locator('#next-player').textContent(),'Sky');
    }
    assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);
    console.log(`PASS ${language}: ${action} starts inside a sandbox without allow-forms`);checks++;
    await context.close();
  }
  console.log(`\n${checks} sandboxed-start checks passed.`);
} finally {await browser.close();}
