// Real-browser coverage for preparation choices, privacy and inventory boundaries.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fresh,STORAGE_KEY} from '../src/progress.js';
import {WEAPONS,WORRIES} from '../src/catalog.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://127.0.0.1:5198/beat-bad-luck/';
const output=process.env.PLAYGROUND_SCREENSHOTS||'/tmp/ritual-preparation-qa';
const errors=[];
const privateWorry='Private thought: keep my own worry';
await mkdir(output,{recursive:true});
async function setup({width=375,height=812,lang='zh-Hant',rich=false}={}) {
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce',hasTouch:width<900,isMobile:width<900});
 const seed=fresh();
 if(rich){seed.coins=50000;seed.merit=50000;seed.owned.push('flipflop');seed.weaponUses.flipflop=7;seed.equipped='flipflop';seed.ownedSkins.push('duck');seed.skinUses.duck=3;seed.selectedSkin='duck';seed.neighbourhood.active='bus';}
 await context.addInitScript(({seed,lang,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));if(!localStorage.getItem('beat-bad-luck.preferences.v1'))localStorage.setItem('beat-bad-luck.preferences.v1',JSON.stringify({version:1,sound:false}));localStorage.setItem('playground.language.v1',lang);Math.random=()=>.25;},{seed,lang,key:STORAGE_KEY});
 await context.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.stack));
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('#ritual-preparation').waitFor();await page.screenshot({path:`${output}/entry-${width}-${lang}.png`});
 return {page,context};
}
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORAGE_KEY);
const open=async(page,id)=>{const details=page.locator('#prepare-'+id);if(!await details.evaluate(e=>e.open))await details.locator(':scope>summary').click();};
async function presentation(page){
 const sizes=await page.evaluate(()=>({width:innerWidth,master:document.querySelector('.fong-intro .fong-logo').getBoundingClientRect().width,dock:document.querySelector('#quick-dock').getBoundingClientRect().height,start:document.querySelector('#quick-start').getBoundingClientRect().height}));assert.ok(Math.abs(sizes.master-(sizes.width<=600?61.6:84))<.1,'Master portrait is forty percent larger');assert.ok(sizes.dock<=84,'sticky dock remains compact');assert.ok(sizes.start>=44&&sizes.start<=46,'compact start keeps a 44px touch target');
 await open(page,'skin');const cards=await page.locator('#prepare-skin').evaluate(node=>{const free=node.querySelector('[data-skin=plain]'),grid=node.querySelector('.skin-owned-slot');return {sameGrid:free.parentElement===grid,standard:free.classList.contains('skin-card')&&!free.classList.contains('skin-free-card'),columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,freeWidth:free.getBoundingClientRect().width};});assert.equal(cards.sameGrid,true,'free paper belongs to the owned paper grid');assert.equal(cards.standard,true,'free paper uses the same card style');assert.equal(cards.columns,3,'paper choices keep three columns on phones too');assert.ok(cards.freeWidth>=44);
 for(const selector of ['#all-skins-label','#all-kits-label']){const style=await page.locator(selector).evaluate(node=>{const style=getComputedStyle(node);return {border:parseFloat(style.borderTopWidth),background:style.backgroundColor};});assert.ok(style.border>=2&&style.background!=='rgba(0, 0, 0, 0)','catalogue entry has a prominent filled outline');}
 await page.locator('#prepare-skin>summary').click();
 await page.locator('#prepare-worry').scrollIntoViewIfNeeded();
}
try {
 const {page,context}=await setup();
 assert.equal(await page.locator('#my-stall').evaluate(node=>node.tagName),'SECTION','stall is directly displayed rather than an accordion');
 assert.equal(await page.locator('#neighbourhood-hub').evaluate(node=>node.tagName),'SECTION','stories and collections are directly displayed');
 assert.equal(await page.locator('#secret-collection').evaluate(node=>node.tagName),'SECTION','secret collection is not collapsible');
 assert.equal(await page.locator('.comic-ending-book').evaluate(node=>node.tagName),'SECTION','collected endings are not collapsible');
 assert.equal(await page.locator('#worry-category').count(),0,'worry choices have no category selector');
 assert.equal(await page.locator('#worry-select optgroup').count(),0,'worries are listed directly without categories');
 assert.equal(await page.locator('#worry-select option').count(),WORRIES.length+1,'every worry remains selectable');
 assert.equal(await page.locator('#worry-required').textContent(),'衰嘢交出嚟');
 assert.equal(await page.locator('.preparation-step').count(),5,'optional-step code and DOM are retained');
 assert.equal(await page.locator('.preparation-step:visible').count(),3,'only three steps are shown');
 assert.equal(await page.locator('#prepare-commission').isHidden(),true);
 assert.equal(await page.locator('#prepare-events').isHidden(),true);
 assert.deepEqual(await page.locator('.preparation-step:visible .preparation-number').allTextContents(),['01','02','03']);
 await presentation(page);
 assert.equal(await page.locator('dialog[open]').count(),0,'daily gift must not interrupt preparation');
 assert.equal(await page.locator('#daily-reward-note').isVisible(),true);
 assert.equal((await saved(page)).coins,20);
 assert.equal(await page.locator('#my-stall').isVisible(),true);
 assert.equal(await page.locator('#start').isDisabled(),true);
 await page.locator('#quick-start').evaluate(node=>node.click());assert.equal(await page.evaluate(()=>document.activeElement.id),'worry-select');
 await page.locator('#worry-select').selectOption('teammates');
 assert.match(await page.locator('#preparation-receipt-worry').textContent(),/豬隊友/);
 assert.equal(await page.locator('#start').isEnabled(),true);
 await page.locator('[name=preparation-commission][value=yes]').evaluate(node=>{node.checked=true;node.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.locator('[data-preparation-story=bus]').evaluate(node=>node.click());
 assert.equal(await page.locator('#worry-select').inputValue(),'teammates','accepting a commission must preserve the preset worry');
 assert.match(await page.locator('#commission-target-note').textContent(),/心事已保留/);
 await page.locator('#write-own-worry').click();await page.locator('#worry-input').fill(privateWorry);
 await page.locator('[data-preparation-story=cafe]').evaluate(node=>node.click());
 assert.equal(await page.locator('#worry-input').inputValue(),privateWorry,'accepting a different story must not clear private text');
 assert.ok(!(JSON.stringify(await saved(page))).includes(privateWorry));
 assert.equal((await saved(page)).neighbourhood.active,'cafe','saved accepted story survives hidden optional steps');
 await page.locator('[name=preparation-events][value=on]').evaluate(node=>{node.checked=true;node.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.equal(await page.locator('#random-events').isChecked(),true);
 assert.equal(await page.locator('#prepare-commission').isHidden(),true);assert.equal(await page.locator('#prepare-events').isHidden(),true);assert.equal(await page.locator('#preparation-receipt-options').isHidden(),true);
 await open(page,'skin');assert.equal(await page.locator('#prepare-skin [data-skin=plain]').isVisible(),true);
 assert.equal(await page.locator('#prepare-skin .preparation-catalog').evaluate(e=>e.open),false);
 await open(page,'kit');assert.equal(await page.locator('[data-preparation-kit=bare-hand]').isVisible(),true);
 assert.match(await page.locator('#preparation-usage-note').textContent(),/不消耗/);
 await page.locator('#prepare-skin>summary').click();await page.locator('#prepare-kit>summary').click();
 await page.screenshot({path:`${output}/preparation-375-zh.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.locator('#start').click();assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'incense');
 for(const selector of ['[data-stick="0"]','[data-stick="1"]','[data-stick="2"]','#blow'])await page.locator(selector).evaluate(e=>e.click());
 await page.clock.fastForward(2100);await page.locator('#confirm-worry').evaluate(e=>e.click());await page.clock.fastForward(2100);
 assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'beat');
 assert.equal(await page.locator('#personality-hud').isHidden(),true,'hidden event preference cannot enable challenges');
 assert.match(await page.locator('#personality-hint').textContent(),/128/,'hidden saved commission is not attached to this ritual');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.preferences.v1')).randomEvents),true,'hidden event preference is preserved');
 assert.match(await page.locator('#doll-label').textContent(),/Private thought/);
 await page.locator('#hit-zone').press('Space');
 await page.clock.fastForward(60000);assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'tiger');
 await page.locator('#feed').evaluate(e=>e.click());await page.clock.fastForward(1700);
 await page.locator('#purify-next').evaluate(e=>e.click());await page.clock.fastForward(1100);
 await page.locator('#throw-blocks').evaluate(e=>e.click());await page.clock.fastForward(2500);
 assert.equal((await saved(page)).neighbourhood.chapters.cafe,0,'skipped commission cannot advance');
 assert.equal((await saved(page)).neighbourhood.active,'cafe');
 assert.ok(!(JSON.stringify(await saved(page))).includes(privateWorry));
 await page.locator('#loot-close').click();await page.locator('#change-worry').click();
 assert.equal(await page.locator('#worry-input').inputValue(),'');
 assert.equal(await page.locator('#start').isDisabled(),true);
 assert.ok(!(await page.locator('#preparation-receipt-worry').textContent()).includes(privateWorry),'new-worry action must refresh the preparation summary');
 await context.close();console.log('PASS fresh player: three steps, retained optional code/preferences, compact dock, larger Master, uniform three-column paper cards, prominent catalogues, full ritual and privacy');

 for(const config of [{width:320,height:568,lang:'zh-Hant'},{width:812,height:375,lang:'en'},{width:1280,height:900,lang:'en'}]) {
  const {page:p,context:c}=await setup({...config,rich:true});
    await presentation(p);
  await p.locator('#worry-select').selectOption('work');
  assert.match(await p.locator('#kit-selection-summary').textContent(),/7/);
  assert.match(await p.locator('#skin-selection-summary').textContent(),/3/);
  await open(p,'kit');await p.locator('#preparation-kit-catalog>summary').click();
  const kit=WEAPONS.find(w=>!w.starter&&!w.hidden&&w.id!=='flipflop'&&w.cost>0&&w.merit<=50000);
  const before=(await saved(p)).coins;
  await p.locator(`[data-preparation-kit="${kit.id}"]`).click();
  assert.equal(await p.locator('#purchase-dialog').isVisible(),true);
  assert.match(await p.locator('#purchase-spent').textContent(),config.lang==='en'?/balance after purchase/:/購後餘額/);
  await p.locator('#purchase-close').click();assert.equal((await saved(p)).coins,before,'cancel must not spend');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.preparationKit),kit.id);
  await p.locator(`[data-preparation-kit="${kit.id}"]`).click();await p.locator('#purchase-action').click();
  assert.ok((await saved(p)).coins<before);assert.equal((await saved(p)).equipped,kit.id);
  await p.locator('#purchase-continue').click();assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'setup','purchase returns to preparation, never starts automatically');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.preparationKit),kit.id);
  await p.locator('[data-preparation-kit=bare-hand]').click();
  await open(p,'skin');assert.equal(await p.locator('#prepare-skin .skin-owned-slot [data-skin=duck]').isVisible(),true);
  await p.locator('#prepare-skin [data-skin=plain]').click();
  assert.match(await p.locator('#preparation-usage-note').textContent(),config.lang==='en'?/No items/:/不消耗/);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:`${output}/preparation-${config.width}-${config.lang}.png`,fullPage:true});
  await p.reload({waitUntil:'networkidle'});
  assert.equal((await saved(p)).weaponUses.flipflop,7,'changing equipment must not consume old stock');
  assert.equal(await p.locator('#worry-select').inputValue(),'','personal worry must not persist across reload');
  await c.close();console.log(`PASS ${config.width} ${config.lang}: retained inventory, inline selection, purchase cancellation/confirmation/focus, no auto-start and responsive layout`);
 }
 assert.deepEqual(errors,[],'no page errors');
} finally {await browser.close();}
