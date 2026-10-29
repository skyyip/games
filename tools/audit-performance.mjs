// Cold local-browser measurements. Compare the same Chromium, viewport and CPU setting.
import {writeFile} from 'node:fs/promises';
import {games} from './game-catalog.mjs';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.PERF_ORIGIN||'http://localhost:5270',out=process.env.PERF_OUT||'/tmp/playground-performance.json';
const browser=await chromium.launch({headless:true}),results=[];
const metrics=async session=>Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
async function sample(page,session){const before=await metrics(session);await page.evaluate(()=>{window.__sample={frames:0,mutations:0};});await page.waitForTimeout(1000);const after=await metrics(session),counts=await page.evaluate(()=>window.__sample);return {...counts,scriptMs:Math.round((after.ScriptDuration-before.ScriptDuration)*1000),taskMs:Math.round((after.TaskDuration-before.TaskDuration)*1000),layouts:after.LayoutCount-before.LayoutCount,recalc:after.RecalcStyleCount-before.RecalcStyleCount};}
const routes=process.env.PERF_GAMES?process.env.PERF_GAMES.split(','):['',...games.map(g=>g.slug)];
try{for(const slug of routes){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const native=requestAnimationFrame;window.requestAnimationFrame=callback=>native(time=>{if(window.__sample)window.__sample.frames++;callback(time);});new MutationObserver(records=>{if(window.__sample)window.__sample.mutations+=records.length;}).observe(document,{subtree:true,childList:true,characterData:true,attributes:true});});
 const session=await context.newCDPSession(page);await session.send('Performance.enable');await session.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto(origin+'/'+(slug?slug+'/':''),{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);
 const load=await page.evaluate(()=>({resources:performance.getEntriesByType('resource').filter(r=>new URL(r.name).origin===location.origin).length,bytes:performance.getEntriesByType('resource').filter(r=>new URL(r.name).origin===location.origin).reduce((n,r)=>n+r.encodedBodySize,0),fontBytes:performance.getEntriesByType('resource').filter(r=>/\.(woff2?|ttf)(\?|$)/.test(r.name)).reduce((n,r)=>n+r.encodedBodySize,0),dom:document.getElementsByTagName('*').length,domReadyMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd)}));
 const idle=await sample(page,session);let active=null,started=false;
 if(slug){
  if(['balance-bridge','marble-maze','floating-balance'].includes(slug)){const touch=page.locator('input[name=mode][value=touch]');if(await touch.count())await touch.check({force:true});}
  if(slug==='beat-bad-luck'){const select=page.locator('#worry-select');if(await select.count()){const value=await select.locator('option').evaluateAll(opts=>opts.find(o=>o.value)?.value);if(value)await select.selectOption(value);}}
  const start=page.locator('#start');if(await start.count()&&await start.isVisible()&&await start.isEnabled()){await start.click({timeout:10000});started=true;if(['balance-bridge','marble-maze','floating-balance'].includes(slug))await page.waitForTimeout(3300);
   const enter={ 'memory-trace':['#view'], 'dice-party':['#ready','#roll'], 'line-up':['#ready'], 'just-a-sec':['#ready'], 'tap-and-spill':['#go'] }[slug]||[];
   for(const selector of enter){const button=page.locator(selector);if(await button.isVisible()&&await button.isEnabled())await button.click();}
   active=await sample(page,session);}
  if(slug==='flick-force'){const surface=page.locator('#runway');await surface.scrollIntoViewIfNeeded();const r=await surface.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height*.75);await page.mouse.down();await page.mouse.move(r.x+r.width/2,r.y+r.height*.25,{steps:4});await page.mouse.up();started=true;active=await sample(page,session);}
 }
 const row={slug:slug||'landing',...load,idle,active,started,errors};results.push(row);console.log(JSON.stringify(row));await context.close();
}await writeFile(out,JSON.stringify({cpuThrottle:4,viewport:[390,844],serviceWorkers:'blocked',results},null,2));}finally{await browser.close();}
