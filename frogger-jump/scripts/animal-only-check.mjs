// Isolated local save migration and real UI controls. No production Firebase writes.
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {freshProfile,PROFILE_KEY} from '../src/profile.js';
import {RETIRED_COMPANION_PRICES,RETIRED_PURCHASE_FIELDS} from '../src/retired-companions.js';
import {RETIRED_SKILL_PRICES} from '../src/retired-skills.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.FROGGER_URL||'http://127.0.0.1:5440/games/frogger-jump/';
const fixture=await build({stdin:{contents:"import {FroggerGame} from './src/game.js';const start=FroggerGame.prototype.start;FroggerGame.prototype.start=function(options){const result=start.call(this,options);globalThis.animalOnlyModel=this;return result;};import('./src/app.js');",resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,format:'esm',write:false,logLevel:'silent'});
const legacy={...freshProfile('RiverTester'),coins:100,owned:['frog','bunny'],selected:'bunny',ownedSkills:Object.keys(RETIRED_SKILL_PRICES),equippedSkill:'shield',ownedCompanions:Object.keys(RETIRED_COMPANION_PRICES),companion:'hippo'};
const browser=await chromium.launch({headless:true}),errors=[];let checks=0;
try{
 for(const [width,height,language]of [[320,700,'zh-Hant'],[390,844,'zh-Hant'],[812,375,'en'],[1280,900,'en']]){
  const c=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,serviceWorkers:'block'});
  await c.addInitScript(({key,profile,language})=>{globalThis.FROGGER_FIREBASE_CONFIG=null;localStorage.setItem('playground.language.v1',language);if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(profile));Math.random=()=>.75;},{key:PROFILE_KEY,profile:legacy,language});
  await c.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:''}));
  const p=await c.newPage();p.on('pageerror',error=>errors.push(error.message));await p.goto(base,{waitUntil:'networkidle'});
  const read=()=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),PROFILE_KEY);
  let profile=await read();assert.equal(profile.coins,6980);for(const key of RETIRED_PURCHASE_FIELDS)assert(!Object.hasOwn(profile,key));assert.equal(profile.selected,'bunny');checks+=3;
  await p.locator('#animal-open').click();assert.equal(await p.locator('.animal-card').count(),38);assert.equal(await p.locator('.shop-tabs,.shop-unequip,#companion-status,#companion-help-body').count(),0);assert(!(await p.locator('#animal-dialog').textContent()).match(/河中夥伴|Companions/));assert.equal(await p.locator('#animal-dialog').evaluate(node=>node.scrollWidth>node.clientWidth),false);await p.locator('[data-close="animal-dialog"]').click();checks+=4;
  await p.locator('#precision-guide>summary').click();const tops=await p.locator('.guide-list li').evaluateAll(rows=>rows.map(row=>Math.abs(row.querySelector('.guide-icon').getBoundingClientRect().top-row.querySelector('h3').getBoundingClientRect().top)));assert(tops.every(delta=>delta<1),JSON.stringify({width,tops}));await p.locator('#precision-guide').screenshot({path:`/tmp/animal-guide-top-${width}.png`});assert.equal(await p.locator('#river-friends-list li').count(),14);checks+=2;
  await p.reload({waitUntil:'networkidle'});profile=await read();assert.equal(profile.coins,6980);checks++;
  if(width===390){
   // Replace only the entry script with an instrumented copy to observe the real active skill.
   await c.route(base,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'')});});
   const harness=new URL('animal-only-qa.js',base).href;await c.route(harness,route=>route.fulfill({contentType:'text/javascript',body:fixture.outputFiles[0].text}));
   await p.reload({waitUntil:'networkidle'});await p.addScriptTag({type:'module',url:harness});await p.waitForFunction(()=>globalThis.animalOnlyModel);await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#start').click();
   await p.evaluate(()=>{const g=animalOnlyModel;Object.assign(g.stumps[1],{x:0,y:180,r:62,kind:'stump',sinking:false,thorns:false,angler:false});Object.assign(g.stumps[2],{x:0,y:360,r:62,kind:'stump',sinking:false,thorns:false,angler:false});document.dispatchEvent(new Event('languagechange'));});
   await p.locator('#skill-button').click();assert.equal(await p.locator('#skill-count').textContent(),'0');assert.equal(await p.evaluate(()=>animalOnlyModel.targetIndex),2);assert.equal(await p.evaluate(()=>'companion' in animalOnlyModel),false);
   await p.locator('#jump-control').focus();await p.keyboard.down('Space');await p.clock.runFor(360/540*1000);await p.keyboard.up('Space');await p.clock.runFor(750);assert.equal(await p.locator('#score').textContent(),'1');assert.match(await p.locator('#play-hint').textContent(),/本次 \+3/);
   await p.locator('#jump-control').focus();await p.keyboard.down('Space');await p.clock.runFor(1);await p.keyboard.up('Space');await p.clock.runFor(2800);await p.locator('#result-dialog').waitFor({state:'visible'});assert.equal(await p.locator('#earned-coins').textContent(),'+4');assert.equal((await read()).coins,6984);checks+=7;
  }
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await c.close();checks++;
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:4,legacyRefund:6880,animalOnlyShop:38,riverPads:14,pageErrors:0}));
}finally{await browser.close();}
