// Real game/controller with a test-only instance hook; Firebase is disabled.
import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.FROGGER_URL||'http://localhost:5260/frogger-jump/',out=process.env.FROGGER_SCREENSHOTS||'/tmp/frogger-fish-ui';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{for(const [width,height,lang]of [[320,568,'zh-Hant'],[390,844,'zh-Hant'],[812,375,'en'],[1280,900,'en']]){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:width===812?'reduce':'no-preference'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.route('**/frogger-jump/src/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('this.random=random;','(globalThis.froggerInstances??=[]).push(this);this.random=random;')});});
 await context.addInitScript(({lang})=>{globalThis.FROGGER_FIREBASE_CONFIG=null;localStorage.setItem('playground.language.v1',lang);Math.random=()=>.75;localStorage.setItem('frogger-jump.profile.v2',JSON.stringify({version:2,name:'河岸星星',coins:5000,owned:['frog','mochi'],selected:'frog',best:0,runs:[]}));},{lang});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('#river-weather,[class*=weather-]').count(),0);
 const actions=await page.locator('#animal-open,#leaderboard-open').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert(actions.every(h=>h<=58));
 const gap=await page.evaluate(()=>{const name=document.querySelector('#player-name'),button=document.querySelector('#player-world-rank');button.hidden=false;return button.getBoundingClientRect().top-name.getBoundingClientRect().bottom;});assert(gap>=9);await page.locator('#player-world-rank').evaluate(n=>n.hidden=true);
 await page.screenshot({path:`${out}/home-${width}.png`,fullPage:true});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.locator('#start').click();await page.clock.runFor(50);
 assert.equal(await page.locator('#skill-button').evaluate(n=>n.parentElement.className),'play-controls');
 const skill=await page.locator('#skill-button').boundingBox(),hold=await page.locator('#hold-button').boundingBox();assert(skill.height<=48);assert(skill.x>=0&&skill.y>=0&&skill.x+skill.width<=width&&skill.y+skill.height<=height);if(height>500)assert(Math.abs(skill.y-hold.y)<5);
 // Inject a route while keeping real game inputs, timing, collision and rendering.
 await page.evaluate(()=>{const g=froggerInstances[0];g.start();Object.assign(g.target,{x:0,y:180,angler:true});g.syncFish();});
 await page.locator('#pause').click();const frozen=await page.evaluate(()=>froggerInstances[0].fish);await page.clock.runFor(5000);assert.deepEqual(await page.evaluate(()=>froggerInstances[0].fish),frozen);await page.locator('#resume').click();await page.clock.runFor(20);
 assert.match(await page.locator('#hazard').textContent(),lang==='en'?/WARNING/:/預警/);await page.screenshot({path:`${out}/warning-${width}.png`});
 await page.clock.runFor(980);await page.locator('#jump-control').focus();await page.keyboard.down('Space');await page.clock.runFor(333);await page.keyboard.up('Space');await page.clock.runFor(180);await page.screenshot({path:`${out}/leap-${width}.png`});await page.clock.runFor(120);
 assert.equal(await page.locator('#play-shell').getAttribute('data-state'),'drowning');assert.equal(await page.locator('#river').getAttribute('data-fall-stage'),'predator');assert.equal(await page.evaluate(()=>froggerInstances[0].fall.reason),'angler');assert.equal(await page.locator('#score').textContent(),'0');await page.screenshot({path:`${out}/caught-${width}.png`});await page.clock.runFor(2100);assert(await page.locator('#result-dialog').isVisible());
 await page.locator('#again').click();await page.clock.runFor(30);await page.evaluate(()=>{const g=froggerInstances[0];g.start({animal:'mochi'});Object.assign(g.target,{x:0,y:180,angler:true});g.syncFish();});
 await page.locator('#pause').click();await page.locator('#resume').click();await page.clock.runFor(20);await page.locator('#skill-button').click();assert.equal(await page.locator('#skill-count').textContent(),'0');await page.clock.runFor(980);
 await page.locator('#jump-control').focus();await page.keyboard.down('Space');await page.clock.runFor(333);await page.keyboard.up('Space');await page.clock.runFor(300);await page.screenshot({path:`${out}/shield-${width}.png`});await page.clock.runFor(650);
 assert.equal(await page.locator('#score').textContent(),'1');assert.equal(await page.locator('#play-shell').getAttribute('data-state'),'idle');assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));assert.deepEqual(errors,[]);
 console.log(`PASS ${width}×${height}: compact controls, restored skill position, no weather overlays, advance fish warning, paused hazard, midair capture, star shield and safe landing.`);await context.close();
}}finally{await browser.close();}
