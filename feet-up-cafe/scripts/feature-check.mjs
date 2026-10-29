import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.MOP_URL||'http://localhost:5260/feet-up-cafe/';
await mkdir('/tmp/feet-up-cafe-features',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'});await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 await context.addInitScript(()=>{Math.random=()=>.2;if(!localStorage.getItem('playground.cha-chaan-mop.v1'))localStorage.setItem('playground.cha-chaan-mop.v1',JSON.stringify({version:1,coins:777}));});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(base+'?lang=zh-Hant',{waitUntil:'networkidle'});await page.clock.pauseAt(new Date(Date.now()+1000));
 const original=await page.evaluate(()=>localStorage.getItem('playground.cha-chaan-mop.v1'));await page.locator('#events').uncheck();await page.locator('#start').click();await page.clock.runFor(7100);
 assert.match(await page.locator('#focus-readout').textContent(),/75/);await page.screenshot({path:'/tmp/feet-up-cafe-features/gold-guest.png'});
 const foot=await page.locator('#room').evaluate(canvas=>{const r=canvas.getBoundingClientRect(),s=Math.min(r.width/600,r.height/700);return{x:r.x+(r.width-600*s)/2+300*s,y:r.y+(r.height-700*s)/2+295*s};});
 await page.mouse.move(foot.x,foot.y);await page.mouse.down();await page.clock.runFor(300);await page.mouse.up();assert.match(await page.locator('#focus-readout').textContent(),/捉到/);assert(Number(await page.locator('#metric').textContent())>=1);await page.locator('#pause').click();assert.match(await page.locator('#live-goals').textContent(),/1\/2/);await page.locator('#pause-home').click();
 await page.locator('[data-mode=diner]').click();assert.match(await page.locator('#mode-lesson').textContent(),/護盾/);await page.locator('#start').click();const sources=new Set();
 let lastSource='';async function warning(){for(let i=0;i<100;i++){const text=await page.locator('#play-instruction').textContent();const source=text.split(' · ')[0];if(text.includes('左腳危險')&&source!==lastSource){lastSource=source;return text;}await page.clock.runFor(50);}throw Error('No next warning');}
 for(let n=0;n<4;n++){
  const message=await warning();sources.add(message.split(' · ')[0]);for(let step=0;step<40;step++){const countdown=await page.locator('#attack-countdown').textContent(),value=Number(countdown.match(/([\d.]+)s/)?.[1]);if(value>0&&value<=.2)break;await page.clock.runFor(50);}await page.keyboard.down('a');await page.clock.runFor(900);await page.keyboard.up('a');await page.screenshot({path:`/tmp/feet-up-cafe-features/dodge-${n+1}.png`});
 }
 assert.equal(sources.size,4);assert.match(await page.locator('#combo-readout').textContent(),/4/);assert.match(await page.locator('#focus-readout').textContent(),/護盾/);await page.locator('#pause').click();const goals=await page.locator('#live-goals').textContent();assert.match(goals,/壓線縮腳3\/3/);await page.locator('#resume').click();
 await warning();await page.clock.runFor(2200);assert.equal(await page.locator('#metric').textContent(),'0/3');assert.doesNotMatch(await page.locator('#focus-readout').textContent(),/護盾/);assert.match(await page.locator('#combo-readout').textContent(),/0/);
 await page.clock.runFor(61000);assert(await page.locator('#result-panel').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('playground.cha-chaan-mop.v1')),original);assert.deepEqual(errors,[]);console.log('PASS native inputs: timed gold guest catch and goal, all four attack directions, four clean dodges, precise-dodge goal, earned shield, shield save, completed round and original-game save untouched.');await context.close();
}finally{await browser.close();}
