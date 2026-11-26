import {installContentAccount} from './content-account-fixture.mjs';
// Built-page checks: contrast, clipboard boundaries, native copy, and normal gameplay.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {newRun,act,hkDay,questionFor} from '../src/game.js';
const DAILY_KEY='qa.hkm.content-run';

const {chromium}=await import(pathToFileURL(process.env.GRID_RUSH_PLAYWRIGHT_MODULE));
const base=process.env.HKM_TEST_URL||'http://127.0.0.1:5445/games/hong-kong-millionaire/';
const now=Date.UTC(2026,10,16,4),errors=[],ratios=[];
const browser=await chromium.launch({headless:true});
let checks=0;
const equal=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
function luminance(color){
 const channels=color.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255);
 return channels.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
}
function contrast(foreground,background){
 const a=luminance(foreground),b=luminance(background);
 return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
async function clipboard(page,selector,type='copy'){
 return page.locator(selector).evaluate((node,type)=>{
  const selection=getSelection(),range=document.createRange();
  range.selectNodeContents(node);selection.removeAllRanges();selection.addRange(range);
  const data=new DataTransfer();data.setData('text/plain','sentinel');
  const event=new ClipboardEvent(type,{bubbles:true,cancelable:true,clipboardData:data});
  document.dispatchEvent(event);selection.removeAllRanges();
  return {blocked:event.defaultPrevented,text:data.getData('text/plain')};
 },type);
}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 await installContentAccount(context,base);
 await context.addInitScript(now=>{
  globalThis.HK_MILLIONAIRE_FIREBASE_CONFIG=null;
  const Native=Date;
  globalThis.Date=class extends Native{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{globalThis.fairplayShared=text;}}});
 },now);
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base,{waitUntil:'networkidle'});
 equal(await page.locator('.bank-ticket').count(),0);
 await page.locator('#start').click();await page.locator('#question-title').waitFor({state:'visible'});
 const firstQuestionAt=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).run.questionAt,DAILY_KEY);
 equal(await page.locator('#question-title').evaluate(node=>getComputedStyle(node).userSelect),'none');
 equal(await page.locator('#question-image').getAttribute('draggable'),'false');
 for(const selector of ['#question-title','#options']){
  for(const type of ['copy','cut'])equal(await clipboard(page,selector,type),{blocked:true,text:''});
 }
 equal(await page.evaluate(()=>{
  const range=document.createRange();range.selectNodeContents(document.body);
  const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
  const event=new ClipboardEvent('copy',{bubbles:true,cancelable:true});
  document.dispatchEvent(event);selection.removeAllRanges();return event.defaultPrevented;
 }),true);
 for(const [selector,type]of [['#question-title','selectstart'],['#options button span','contextmenu'],['#visual-frame','contextmenu'],['#question-image','dragstart']]){
  equal(await page.locator(selector).first().evaluate((node,type)=>{
   const event=new Event(type,{bubbles:true,cancelable:true});node.dispatchEvent(event);return event.defaultPrevented;
  },type),true);
 }
 // Exercise a real browser copy shortcut even if someone overrides the CSS selection rule.
 await page.locator('#question-title').evaluate(node=>{
  node.style.userSelect='text';const range=document.createRange();range.selectNodeContents(node);
  const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
  document.addEventListener('copy',event=>{globalThis.fairplayNativeCopyBlocked=event.defaultPrevented;},{once:true});
 });
 await page.keyboard.press('Control+c');
 await page.waitForFunction(()=>globalThis.fairplayNativeCopyBlocked!==undefined);
 equal(await page.evaluate(()=>fairplayNativeCopyBlocked),true);
 await page.locator('#question-title').evaluate(node=>{node.style.removeProperty('user-select');getSelection().removeAllRanges();});
 await page.locator('#life-phone').click();await page.locator('#phone-dialog').waitFor({state:'visible'});
 equal(await clipboard(page,'#phone-hint'),{blocked:true,text:''});
 await page.locator('[data-close="phone-dialog"]').last().click();
 await page.locator('#options button').first().click();
 equal(await clipboard(page,'#answer-dialog-title'),{blocked:true,text:''});
 await page.locator('[data-close="answer-dialog"]').last().click();
 await page.locator('#account-open').click();await page.locator('#display-name').fill('測試街坊');
 for(const type of ['copy','cut','contextmenu'])equal(await page.locator('#display-name').evaluate((node,type)=>{
  const event=new Event(type,{bubbles:true,cancelable:true});node.dispatchEvent(event);return event.defaultPrevented;
 },type),false);
 await page.locator('[data-close="account-dialog"]').last().click();
 equal(await page.locator('#current-prize').evaluate(node=>{
  const event=new Event('contextmenu',{bubbles:true,cancelable:true});node.dispatchEvent(event);return event.defaultPrevented;
 }),false);
 equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).run.questionAt,DAILY_KEY),firstQuestionAt);
 const current=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).run,DAILY_KEY);
 await page.locator(`[data-choice="${(questionFor(current).answer+1)%4}"]`).click();
 await page.locator('#confirm-answer').click();await page.locator('#result-screen').waitFor({state:'visible'});
 await page.locator('#copy-share').click();equal((await page.evaluate(()=>fairplayShared)).includes('香港百萬富翁'),true);
 await page.locator('#review-today').click();await page.locator('#review-list .book-card').first().click();
 equal(await clipboard(page,'#detail-title'),{blocked:false,text:'sentinel'});

 // Both ladders, safety-net rows, and already-correct current rows must keep full contrast.
 for(const correct of [0,4,9]){
  let run=newRun(hkDay(now),now);
  for(let i=0;i<correct;i++){run=act(run,{type:'answer',choice:questionFor(run).answer},now+100);run=act(run,{type:'next'},now+200);}
  await page.evaluate(({key,run})=>localStorage.setItem(key,JSON.stringify({day:run.day,owner:'guest',token:crypto.randomUUID(),revision:0,run})),{key:DAILY_KEY,run});
  await page.reload({waitUntil:'networkidle'});await page.locator('#start').click();
  async function checkLadders(){
   const rows=await page.locator('.prize-ladder li.current').evaluateAll(nodes=>nodes.map(node=>({
    background:getComputedStyle(node).backgroundColor,colors:[...node.children].map(child=>getComputedStyle(child).color),current:node.getAttribute('aria-current')
   })));
   equal(rows.length,2);
   for(const row of rows){equal(row.current,'step');for(const color of row.colors){const ratio=contrast(color,row.background);assert(ratio>=7,`Current prize contrast ${ratio}`);checks++;ratios.push(ratio);}}
  }
  await checkLadders();
  if(correct===0){
   await page.locator('.prize-sidebar').screenshot({path:'/tmp/hkm-current-prize-desktop.png'});
   await page.setViewportSize({width:390,height:900});await page.locator('#ladder-open').click();
   await page.locator('#ladder-dialog').screenshot({path:'/tmp/hkm-current-prize-mobile.png'});
   await page.locator('[data-close="ladder-dialog"]').click();await page.setViewportSize({width:1280,height:900});
  }
  await page.locator(`[data-choice="${questionFor(run).answer}"]`).click();await page.locator('#confirm-answer').click();
  await page.locator('#next-question').waitFor({state:'visible'});await checkLadders();
 }
 equal(errors,[]);
 console.log(JSON.stringify({checks,minimumContrast:Number(Math.min(...ratios).toFixed(2)),nativeCopyBlocked:true,pageErrors:0}));
 await context.close();
}finally{await browser.close();}
