import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.ROACH_RUSH_URL||'http://localhost:5173/roach-rush/';
const errors=[];let checks=0;const pass=text=>{checks++;console.log(`PASS ${text}`);};
async function setup(){
 const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'no-preference'});
 await context.addInitScript(()=>{Math.random=()=>.2;localStorage.setItem('playground.language.v1','en');});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 // Native click events avoid waiting on optional button spring frames under a paused test clock.
 await page.locator('#start').evaluate(el=>el.click());await page.clock.runFor(7000);
 return {context,page};
}
async function beginDrag(page){
 const mouse=page.locator('.critter[data-type="mouse"]').first();await mouse.focus();const r=await mouse.boundingBox();
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.clock.runFor(500);
 const c=await page.locator('#cage').boundingBox();return {near:{x:c.x+c.width+24,y:c.y+c.height/2},inside:{x:c.x+c.width/2,y:c.y+c.height/2}};
}
try{
 const {context,page}=await setup();const target=await beginDrag(page);
 assert.equal(await page.locator('#cage').evaluate(el=>el.classList.contains('is-open')),false);
 await page.mouse.move(target.near.x,target.near.y);assert.equal(await page.locator('#cage').evaluate(el=>el.classList.contains('is-open')),true);
 await page.locator('.cage-door').evaluate(async el=>{getComputedStyle(el).transform;await Promise.all(el.getAnimations().map(a=>a.finished));});
 const opened=await page.locator('.cage-door').evaluate(el=>getComputedStyle(el).transform);assert.ok(Math.abs(Number(opened.slice(7,-1).split(',')[0]))<.3);
 await page.screenshot({path:'/tmp/roach-cage-open.png'});
 pass('a charged mouse opens the door near the cage before entering the scoring area');
 await page.mouse.move(target.inside.x,target.inside.y);await page.mouse.up();assert.equal(await page.locator('#score').textContent(),'5');
 assert.equal(await page.locator('#cage').evaluate(el=>el.classList.contains('is-open')),true);
 const peak=await page.locator('.cage-art').evaluate(el=>{const a=el.getAnimations().find(a=>a.effect.getKeyframes().some(f=>String(f.transform).includes('1.16')));a.pause();a.currentTime=200;return getComputedStyle(el).transform;});
 assert.ok(Number(peak.slice(7,-1).split(',')[0])>1.1);assert.equal(await page.locator('#cage').evaluate(el=>el.classList.contains('is-open')),true);
 await page.screenshot({path:'/tmp/roach-cage-expanded.png'});
 await page.locator('.cage-art').evaluate(async el=>{const a=el.getAnimations().find(a=>a.playState==='paused');a.play();await a.finished;});
 await page.locator('#cage:not(.is-open)').waitFor();await page.locator('.cage-door').evaluate(async el=>{getComputedStyle(el).transform;await Promise.all(el.getAnimations().map(a=>a.finished));});
 const closed=await page.locator('.cage-door').evaluate(el=>getComputedStyle(el).transform);assert.ok(closed==='none'||Math.abs(Number(closed.slice(7,-1).split(',')[0])-1)<.01);
 assert.equal(await page.locator('#score').textContent(),'5');await context.close();pass('capture awards five once, expands and restores the cage, then closes the door');
 const failed=await setup(),p=failed.page,drop=await beginDrag(p);await p.mouse.move(drop.near.x,drop.near.y);await p.mouse.up();
 assert.equal(await p.locator('#score').textContent(),'0');assert.equal(await p.locator('#cage').evaluate(el=>el.classList.contains('is-open')),false);
 await p.locator('#end').evaluate(el=>el.click());assert.equal(await p.locator('#cage').evaluate(el=>el.classList.contains('is-open')),false);
 await failed.context.close();pass('a near miss closes the door without points and reset leaves no open-door state');
 assert.deepEqual(errors,[]);pass('no uncaught errors');console.log(`\n${checks} cage browser checks passed.`);
}finally{await browser.close();}
