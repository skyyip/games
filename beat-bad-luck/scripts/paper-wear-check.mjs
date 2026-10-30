// Exercise the real hit counter, then inspect every skin with the painted wear stages.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fresh,STORAGE_KEY} from '../src/progress.js';
import {hkDay} from '../src/ritual-rewards.js';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5260/beat-bad-luck/',output='/tmp/bbl-paper-wear';
const click=(p,s)=>p.locator(s).evaluate(n=>n.click());
await mkdir(output,{recursive:true});
try{
 for(const [width,height,skin]of [[320,568,'duck'],[390,844,'history-heshen'],[1280,900,'plain']]){
  const c=await browser.newContext({viewport:{width,height},hasTouch:width<900,serviceWorkers:'block',reducedMotion:'reduce'});
  await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
  const seed={...fresh(),lastDaily:hkDay(Date.now()),ownedSkins:skin==='plain'?['plain']:['plain',skin],selectedSkin:skin,skinUses:skin==='plain'?{}:{[skin]:10}};
  await c.addInitScript(({seed,key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));Math.random=()=>.4;},{seed,key:STORAGE_KEY});
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(base,{waitUntil:'networkidle'});
  await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));await p.locator('#worry-select').selectOption('work');await click(p,'#start');for(let i=0;i<3;i++)await click(p,`[data-stick="${i}"]`);await click(p,'#blow');await p.clock.fastForward(2100);await click(p,'#confirm-worry');await p.clock.fastForward(2100);
  const paper=p.locator('#paper-doll'),samples=[];
  async function sample(hits){
   const current=await paper.evaluate(n=>({wear:Number(n.style.getPropertyValue('--paper-wear')),style:n.style.cssText,stage:n.dataset.wearStage,holes:[...n.querySelectorAll('mask .paper-edge-loss')].map(p=>getComputedStyle(p).transform),crease:Number(getComputedStyle(n.querySelector('.paper-deep-crease')).opacity)}));
   assert(Math.abs(current.wear-hits/100)<.01,`${skin}: ${hits} hits`);assert.equal(current.stage,String(Math.min(3,Math.floor(current.wear*4))));samples.push(current);
   await paper.screenshot({path:`${output}/${skin}-${hits}.png`});return current;
  }
  await sample(0);await p.clock.fastForward(2000);assert.equal(await paper.evaluate(n=>Number(n.style.getPropertyValue('--paper-wear'))),0);
  for(let hits=1;hits<=100;hits++){await p.locator('#hit-zone').press('Space');await p.clock.runFor(70);if([10,35,70,100].includes(hits))await sample(hits);}
  assert.equal(samples.at(-1).crease,1);assert.notDeepEqual(samples[0].holes,samples.at(-1).holes);
  await p.locator('#pause').click();await p.clock.fastForward(5000);assert.equal(await paper.evaluate(n=>Number(n.style.getPropertyValue('--paper-wear'))),1);await p.locator('#resume').click();
  await p.clock.fastForward(60000);await click(p,'#feed');await p.clock.fastForward(1700);await click(p,'#purify-next');await p.clock.fastForward(1100);await click(p,'#throw-blocks');await p.clock.fastForward(2500);assert(await p.locator('#result').isVisible());
  const saved=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),STORAGE_KEY);assert.equal(saved.neighbourhood.album[0].wear,1);if(skin!=='plain')assert.equal(saved.skinUses[skin],9);
  if(width===390){
   await p.locator('#loot-close').click();await click(p,'#to-stall');await p.setViewportSize({width:680,height:900});
   const result=await p.evaluate(async({base,states})=>{
    const[{SKINS},{dollArt}]=await Promise.all([import(new URL('src/skins.js',base)),import(new URL('src/art.js',base))]);
    const gallery=document.createElement('section');gallery.id='wear-gallery';gallery.style.cssText='position:relative;z-index:100;background:#25413a;padding:12px;display:grid;grid-template-columns:repeat(4,140px);gap:8px;width:600px';
    document.body.append(gallery);const ids=new Set();
    for(const skin of SKINS)for(const state of states){const cell=document.createElement('figure');cell.style.cssText='margin:0;color:#fff';const art=document.createElement('div');art.className='paper-doll';art.style.cssText=state.style+';position:relative;inset:auto;width:140px;height:160px;transform:none;translate:none;rotate:none;scale:none';art.innerHTML=dollArt('work',0,skin.id);cell.append(art);const label=document.createElement('figcaption');label.textContent=skin.nameZh+' · '+Math.round(state.wear*100);cell.append(label);gallery.append(cell);const mask=art.querySelector('mask');if(!mask||ids.has(mask.id))throw Error('Missing/shared mask '+skin.id);ids.add(mask.id);if(!art.querySelector('[mask]')||!art.querySelector('.paper-patch'))throw Error('Missing wear '+skin.id);const scale=getComputedStyle(art.querySelector('mask .paper-edge-loss')).transform;if(state.wear===1&&scale==='matrix(0, 0, 0, 0, 0, 0)')throw Error('Invisible tears '+skin.id);}
    return {skins:SKINS.length,cells:gallery.children.length};
   },{base,states:[samples[0],samples[2],samples[3],samples[4]]});
   assert.equal(result.cells,result.skins*4);await p.locator('#wear-gallery').screenshot({path:`${output}/all-skins.png`});console.log(`PASS all ${result.skins} skins: four wear stages, unique resolved masks, creases, fibres, patches and missing edges.`);
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${skin}: 0/10/35/70/100 hit wear, idle/pause stability, full ritual, fortune wear and single inventory use.`);await c.close();
 }
}finally{await browser.close();}
