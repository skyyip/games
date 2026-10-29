// Real-browser coverage for preparation choices, privacy and inventory boundaries.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fresh,STORAGE_KEY} from '../src/progress.js';
import {WEAPONS,WORRIES,WORRY_GROUPS} from '../src/catalog.js';
import {SKINS} from '../src/skins.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BEAT_BAD_LUCK_URL||'http://127.0.0.1:5198/beat-bad-luck/';
const output=process.env.PLAYGROUND_SCREENSHOTS||'/tmp/ritual-preparation-qa';
const errors=[];
const privateWorry='Private thought: keep my own worry';
await mkdir(output,{recursive:true});
async function setup({width=375,height=812,lang='zh-Hant',rich=false,motion='reduce'}={}) {
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:motion,hasTouch:width<900,isMobile:width<900});
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
async function closeCatalogue(page,type,escape=false){
 const dialog=page.locator('#'+type+'-catalog-dialog'),trigger=page.locator('#all-'+(type==='skin'?'skins':'kits')+'-label');
 if(escape)await page.keyboard.press('Escape');else await dialog.locator('.catalog-close').click();
 await dialog.waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>document.activeElement.id),await trigger.getAttribute('id'),'closing restores the catalogue trigger');
 assert.equal(await page.locator(type==='skin'?'#prepare-skin .skin-owned-slot':'#preparation-owned-kits').evaluate(node=>!node.closest('dialog')),true,'owned shortcuts return to the preparation step');
}
async function modalPresentation(page,type){
 const dialog=page.locator('#'+type+'-catalog-dialog'),scroll=dialog.locator('.catalog-scroll');
 await page.waitForFunction(id=>document.getElementById(id).dataset.motion==='open',type+'-catalog-dialog');
 assert.equal(await dialog.isVisible(),true);const headingSize=await dialog.locator('h2').evaluate(n=>parseFloat(getComputedStyle(n).fontSize));assert.ok(Math.abs(headingSize-(page.viewportSize().width<=600?15.3:17))<.01,'top-left catalogue title is fifteen percent smaller');assert.equal(await dialog.evaluate(node=>node.matches(':modal')),true,'catalogue uses a native modal');
 const metrics=await scroll.evaluate(node=>{const style=getComputedStyle(node),header=node.previousElementSibling.getBoundingClientRect();return {height:node.clientHeight,total:node.scrollHeight,overflow:style.overflowY,header:header.top,page:scrollY,html:getComputedStyle(document.documentElement).overflow};});
 assert.ok(metrics.total>metrics.height,'long catalogue has inner overflow');assert.equal(metrics.overflow,'auto');assert.equal(metrics.html,'hidden','background page is locked');
 await scroll.evaluate(node=>node.scrollTop=node.scrollHeight);assert.ok(await scroll.evaluate(node=>node.scrollTop)>0);
 assert.equal(await page.evaluate(()=>scrollY),metrics.page,'inner scroll never moves the page');assert.equal(await dialog.locator('.catalog-heading').evaluate(node=>node.getBoundingClientRect().top),metrics.header,'close remains in a fixed header');
 await scroll.evaluate(node=>node.scrollTop=0);
 if(await page.evaluate(()=>matchMedia('(any-pointer:coarse)').matches)){
  const session=await page.context().newCDPSession(page),r=await scroll.boundingBox();
  try{const x=Math.round(r.x+r.width/2),y=Math.round(r.y+r.height*.7);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let step=1;step<=12;step++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-step*10}]});await page.waitForTimeout(20);}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await scroll.evaluate(node=>node.scrollTop)>20,'a real finger swipe scrolls the modal catalogue');assert.equal(await page.evaluate(()=>scrollY),metrics.page);}finally{await session.detach();}
 }
 await dialog.locator('.catalog-close').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>Boolean(document.activeElement.closest('.catalog-dialog'))),true,'keyboard focus stays inside');
 await page.screenshot({path:`${output}/catalogue-${type}-${page.viewportSize().width}.png`});
 await closeCatalogue(page,type,true);
 await page.locator('#all-'+(type==='skin'?'skins':'kits')+'-label').click();await scroll.evaluate(node=>node.scrollTop=0);
}
async function presentation(page){
 const sizes=await page.evaluate(()=>({width:innerWidth,master:parseFloat(getComputedStyle(document.querySelector('.fong-intro .fong-logo')).width),dock:document.querySelector('#quick-dock').getBoundingClientRect().height,start:document.querySelector('#quick-start').getBoundingClientRect().height}));assert.ok(Math.abs(sizes.master-(sizes.width<=600?61.6:84))<.1,'Master portrait is forty percent larger');assert.ok(sizes.dock<=64,'sticky dock remains compact');assert.ok(sizes.start>=44&&sizes.start<=46,'compact start keeps a 44px touch target');
 await open(page,'skin');const cards=await page.locator('#prepare-skin').evaluate(node=>{const free=node.querySelector('[data-skin=plain]'),grid=node.querySelector('.skin-owned-slot');return {sameGrid:free.parentElement===grid,standard:free.classList.contains('skin-card')&&!free.classList.contains('skin-free-card'),columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,freeWidth:free.getBoundingClientRect().width};});assert.equal(cards.sameGrid,true,'free paper belongs to the owned paper grid');assert.equal(cards.standard,true,'free paper uses the same card style');assert.equal(cards.columns,3,'paper choices keep three columns on phones too');assert.ok(cards.freeWidth>=44);
 for(const selector of ['#all-skins-label','#all-kits-label']){const style=await page.locator(selector).evaluate(node=>{const style=getComputedStyle(node);return {border:parseFloat(style.borderTopWidth),background:style.backgroundColor,font:parseFloat(style.fontSize)};});assert.ok(style.border>=2&&style.background!=='rgba(0, 0, 0, 0)','catalogue entry has a prominent filled outline');assert.ok(Math.abs(style.font-12.75*1.25)<.01,'catalogue text is 25% larger than its previous rendered size');}
 const selected=await page.locator('#prepare-skin').evaluate(node=>{const style=getComputedStyle(node),body=node.querySelector('.preparation-body'),preview=node.querySelector('.preparation-preview');return {border:style.borderTopWidth,color:style.borderTopColor,inner:getComputedStyle(body).borderTopWidth,height:preview.getBoundingClientRect().height,margin:getComputedStyle(preview).marginTop};});assert.equal(selected.border,'1px');assert.notEqual(selected.color,'rgba(0, 0, 0, 0)');assert.equal(selected.inner,'0px');assert.equal(selected.margin,'-20px');assert.ok(Math.abs(selected.height-107.1)<.1);
 await page.locator('#prepare-skin>summary').click();
 const quote=await page.locator('.fong-intro>div:last-child>p:last-child').evaluate(node=>({size:parseFloat(getComputedStyle(node).fontSize),font:getComputedStyle(node).fontFamily}));assert.ok(Math.abs(quote.size-15*1.15*1.15)<.01);assert.match(quote.font,/Iansui.*Fredoka/);assert.equal(await page.locator('#preparation-title,#preparation-help,.preparation-intro').count(),0);
 const walletLabel=await page.locator('.stall-wallet>.bbl-kicker').evaluate(n=>parseFloat(getComputedStyle(n).fontSize));assert.ok(Math.abs(walletLabel-13.8)<.01,'sanctuary label is another twenty percent larger');
 const level=await page.locator('.player-level-badge').evaluate(node=>{const label=document.querySelector('#player-level-label'),r=node.getBoundingClientRect(),l=label.getBoundingClientRect();return {inside:Boolean(node.closest('.stall-wallet')),beside:node.nextElementSibling===label,left:r.right<=l.left+1,center:Math.abs(r.y+r.height/2-l.y-l.height/2)};});assert.equal(level.inside,true);assert.equal(level.beside,true);assert.equal(level.left,true);assert.ok(level.center<1);assert.equal(await page.locator('.fong-intro .player-level-badge').count(),0);
 await page.locator('#prepare-worry').scrollIntoViewIfNeeded();
}
try {
 const {page,context}=await setup();
 assert.equal(await page.locator('#my-stall').evaluate(node=>node.tagName),'SECTION','stall is directly displayed rather than an accordion');
 assert.equal(await page.locator('#neighbourhood-hub').evaluate(node=>node.tagName),'SECTION','collections are directly displayed');
 assert.equal(await page.locator('#journey-tab-stories,#journey-panel-stories,#journey-summary,#commission-list,#street-keepsakes,#my-stall-label').count(),0,'removed story tab, contents and redundant headings stay absent');
 assert.deepEqual(await page.locator('.journey-tabs .collection-launch-label').allTextContents(),['趣味稱號','攤位名場面','平安籤冊']);
 assert.equal(await page.locator('#neighbourhood-hub').evaluate(node=>node.nextElementSibling?.classList.contains('records-card')&&!node.closest('#stall-dashboard,#my-stall')),true,'three collection tabs sit outside the stall and immediately before records');
 assert.equal(await page.locator('[data-shortcut=stall]').evaluate(node=>Boolean(node.closest('#stall-showcase-dialog .stall-modal-tools'))),true,'decorating shortcut sits at the top-left of the stall dialog');
 assert.equal(await page.locator('#worry-input').isVisible(),false,'private input stays in its closed dialog');
 assert.equal(await page.locator('#worry-ready-note,#worry-selection-summary').count(),0);assert.equal(await page.locator('.custom-label').textContent(),'或寫低你的小心事');assert.ok(Math.abs(await page.locator('#worry-privacy').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))-13*1.1*.85)<.01);
 assert.equal(await page.locator('#secret-collection').evaluate(node=>node.tagName),'SECTION','secret collection is not collapsible');
 assert.equal(await page.locator('.comic-ending-book').evaluate(node=>node.tagName),'SECTION','collected endings are not collapsible');
 assert.equal(await page.locator('#worry-category').count(),0,'worry choices have no category selector');
 assert.equal(await page.locator('#worry-select optgroup').count(),WORRY_GROUPS.length,'native headings group related worries');
 assert.equal(await page.locator('#worry-select option').count(),WORRIES.length+1,'every worry remains selectable');
 assert.equal(await page.locator('#worry-required').textContent(),'衰嘢死開！');assert.equal(await page.locator('#prepare-worry-title').textContent(),'今日有咩令你心很累？');assert.equal(await page.locator('#worry-question').textContent(),'選擇一件心塞塞事');assert.equal(await page.locator('#worry-input').getAttribute('placeholder'),'');
 assert.equal(await page.locator('.preparation-step').count(),5,'optional-step code and DOM are retained');
 assert.equal(await page.locator('.preparation-step:visible').count(),3,'only three steps are shown');
 assert.equal(await page.locator('#prepare-commission').isHidden(),true);
 assert.equal(await page.locator('#prepare-events').isHidden(),true);
 assert.deepEqual(await page.locator('.preparation-step:visible .preparation-number').allTextContents(),['01','02','03']);
 await presentation(page);
 await page.locator('#worry-select').selectOption('work');assert.equal(await page.locator('#worry-input').isVisible(),false,'preset selection keeps the editor hidden');await page.locator('#worry-select').selectOption('');
 assert.equal(await page.locator('dialog[open]').count(),0,'daily gift must not interrupt preparation');
 assert.equal(await page.locator('#daily-reward-note').isVisible(),true);
 assert.equal((await saved(page)).coins,16);
 assert.equal(await page.locator('#my-stall').isVisible(),true);
 assert.equal(await page.locator('#start').isDisabled(),true);
 await page.locator('#quick-start').evaluate(node=>node.click());assert.equal(await page.evaluate(()=>document.activeElement.id),'worry-select');
 await page.locator('#worry-select').selectOption('teammates');
 assert.equal(await page.locator('#worry-select').inputValue(),'teammates');
 assert.equal(await page.locator('#start').isEnabled(),true);assert.equal(await page.locator('#start .work-shoe').evaluate(n=>getComputedStyle(n).animationName),'none','reduced motion keeps the invitation still');await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await page.locator('#start .work-shoe').evaluate(n=>getComputedStyle(n).animationName),'preparation-shoe-hop');await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[name=preparation-commission][value=yes]').evaluate(node=>{node.checked=true;node.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.locator('[data-preparation-story=bus]').evaluate(node=>node.click());
 assert.equal(await page.locator('#worry-select').inputValue(),'teammates','accepting a commission must preserve the preset worry');
 assert.match(await page.locator('#commission-target-note').textContent(),/心事已保留/);
 assert.equal(await page.locator('#write-own-worry').count(),0,'private worry needs no reveal button');
 await page.locator('#write-worry').click();await page.locator('#worry-input').fill(privateWorry);await page.locator('#save-worry').click();await page.locator('#worry-dialog').waitFor({state:'hidden'});
 await page.locator('[data-preparation-story=cafe]').evaluate(node=>node.click());
 assert.equal(await page.locator('#worry-input').inputValue(),privateWorry,'accepting a different story must not clear private text');
 assert.ok(!(JSON.stringify(await saved(page))).includes(privateWorry));
 assert.equal((await saved(page)).neighbourhood.active,'cafe','saved accepted story survives hidden optional steps');
 await page.locator('[name=preparation-events][value=on]').evaluate(node=>{node.checked=true;node.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.equal(await page.locator('#random-events').isChecked(),true);
 assert.equal(await page.locator('#prepare-commission').isHidden(),true);assert.equal(await page.locator('#prepare-events').isHidden(),true);assert.equal(await page.locator('.preparation-start').evaluate(n=>n.children.length===1&&n.firstElementChild.id==='start'),true,'start area contains only the primary action');
 await open(page,'skin');assert.equal(await page.locator('#prepare-skin [data-skin=plain]').isVisible(),true);
 assert.equal(await page.locator('#skin-catalog-dialog').evaluate(e=>e.open),false);
 await open(page,'kit');assert.equal(await page.locator('[data-preparation-kit=bare-hand]').isVisible(),true);
 assert.equal(await page.locator('.preparation-receipt,#preparation-usage-note').count(),0);
 await page.locator('#prepare-skin>summary').click();await page.locator('#prepare-kit>summary').click();
 await page.screenshot({path:`${output}/preparation-375-zh.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.locator('#start').click();assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'incense');
 for(const selector of ['[data-stick="0"]','[data-stick="1"]','[data-stick="2"]','#blow'])await page.locator(selector).evaluate(e=>e.click());
 await page.clock.fastForward(2100);await page.locator('#confirm-worry').evaluate(e=>e.click());await page.clock.fastForward(2100);
 assert.equal(await page.locator('#play-panel').getAttribute('data-phase'),'beat');
 assert.equal(await page.locator('#personality-hud').isHidden(),true,'hidden event preference cannot enable challenges');
 assert.match(await page.locator('#personality-hint').textContent(),/88/,'hidden saved commission is not attached to this ritual');
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
 assert.equal(await page.locator('#worry-selection-summary').count(),0);
 await context.close();console.log('PASS fresh player: three steps, retained optional code/preferences, compact dock, larger Master, uniform three-column paper cards, modal private input with draft cancellation, collection launch buttons, prominent modal catalogues, full ritual and privacy');

 for(const config of [{width:320,height:568,lang:'zh-Hant'},{width:390,height:844,lang:'zh-Hant',motion:'no-preference'},{width:812,height:375,lang:'en'},{width:1280,height:900,lang:'en'}]) {
  const {page:p,context:c}=await setup({...config,rich:true});
    await presentation(p);
  await p.locator('#worry-select').selectOption('work');
  assert.match(await p.locator('#kit-selection-summary').textContent(),/7/);
  assert.match(await p.locator('#skin-selection-summary').textContent(),/3/);
  await open(p,'kit');await p.locator('#all-kits-label').click();await modalPresentation(p,'kit');
  const kit=WEAPONS.find(w=>!w.starter&&!w.hidden&&w.id!=='flipflop'&&w.cost>0&&w.merit<=50000);
  const before=(await saved(p)).coins;
  await p.locator(`[data-preparation-kit="${kit.id}"]`).click();
  assert.equal(await p.locator('#purchase-dialog').isVisible(),true);const title=await p.locator('#purchase-title').evaluate(n=>{const actual=parseFloat(getComputedStyle(n).fontSize),value=n.style.getPropertyValue('font-size'),priority=n.style.getPropertyPriority('font-size');n.style.removeProperty('font-size');const base=parseFloat(getComputedStyle(n).fontSize);n.style.setProperty('font-size',value,priority);return {actual,base};});assert.ok(Math.abs(title.actual-title.base*1.2*.85)<.01,'purchase title is fifteen percent smaller');
  assert.match(await p.locator('#purchase-spent').textContent(),config.lang==='en'?/balance after purchase/:/購後餘額/);
  await p.locator('#purchase-close').click();assert.equal((await saved(p)).coins,before,'cancel must not spend');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.preparationKit),kit.id);
  await p.locator(`[data-preparation-kit="${kit.id}"]`).click();await p.locator('#purchase-action').click();
  assert.ok((await saved(p)).coins<before);assert.equal((await saved(p)).equipped,kit.id);
  await p.locator('#purchase-continue').click();assert.equal(await p.locator('#play-panel').getAttribute('data-phase'),'setup','purchase returns to preparation, never starts automatically');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.preparationKit),kit.id);
  await p.locator('[data-preparation-kit=bare-hand]').click();await closeCatalogue(p,'kit');
  await open(p,'skin');await p.locator('#all-skins-label').click();await modalPresentation(p,'skin');assert.equal(await p.locator('#prepare-skin .skin-owned-slot [data-skin=duck]').isVisible(),true);
  const look=SKINS.find(s=>!s.starter&&!['plain','duck'].includes(s.id)),paperBalance=(await saved(p)).coins;
  await p.locator(`[data-skin="${look.id}"]`).click();await p.locator('#purchase-close').click();
  assert.equal((await saved(p)).coins,paperBalance,'closing the paper confirmation never spends oil');assert.equal(await p.evaluate(()=>document.activeElement.dataset.skin),look.id);
  await p.locator(`[data-skin="${look.id}"]`).click();await p.locator('#purchase-action').click();await p.locator('#purchase-continue').click();
  assert.equal((await saved(p)).selectedSkin,look.id);assert.equal(await p.locator('#skin-catalog-dialog [data-skin="'+look.id+'"]').getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.skin),look.id,'confirmed paper moves to the owned grid without losing focus');
  await p.locator('#prepare-skin [data-skin=plain]').click();await closeCatalogue(p,'skin');
  assert.equal(await p.locator('.preparation-start').evaluate(n=>n.children.length===1&&n.firstElementChild.id==='start'),true);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:`${output}/preparation-${config.width}-${config.lang}.png`,fullPage:true});
  await p.locator('#journey-tab-album').click();await p.reload({waitUntil:'networkidle'});
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('beat-bad-luck.preferences.v1')).section),'album','the remembered collection category survives reload');assert.equal(await p.locator('.collection-dialog[open]').count(),0,'reload keeps all collection dialogs closed');
  assert.equal((await saved(p)).weaponUses.flipflop,7,'changing equipment must not consume old stock');
  assert.equal(await p.locator('#worry-select').inputValue(),'','personal worry must not persist across reload');
  await c.close();console.log(`PASS ${config.width} ${config.lang}: retained inventory, touch-scroll modal catalogues, paper/kit purchase cancellation/confirmation/focus, no auto-start and responsive layout`);
 }
 assert.deepEqual(errors,[],'no page errors');
} finally {await browser.close();}
