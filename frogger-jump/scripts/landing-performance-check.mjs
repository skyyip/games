import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const bundle=await build({stdin:{contents:"export {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from './src/game.js';export {RiverScene,MAX_ANIMAL_SPRITES} from './src/scene.js';export {ANIMALS} from './src/animals.js';export {surface} from './src/platforms.js';",resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,format:'esm'});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:3,serviceWorkers:'block'});
 await context.route('**/*',r=>r.request().url().endsWith('/harness.js')?r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}):r.fulfill({contentType:'text/html',body:'<!doctype html><body><main></main></body>'}));
 const page=await context.newPage();await page.goto('http://river-performance.local/');
 const report=await page.evaluate(async()=>{
  const {FroggerGame,RiverScene,MAX_ANIMAL_SPRITES,ANIMALS,distance,MAX_JUMP,CHARGE_UP_MS,surface}=await import('/harness.js');
  const samples=[],failures=[];let frames=0,prepared=0;
  for(const a of ANIMALS){
   const canvas=document.createElement('canvas');document.querySelector('main').replaceChildren(canvas);
   const scene=new RiverScene(canvas);scene.resize(390,600);
   let rasterizations=0;const paint=scene.paintAnimal;scene.paintAnimal=function(...args){rasterizations++;return paint.apply(this,args);};
   scene.prepareAnimal(a.id);prepared+=rasterizations;const warm=rasterizations;
   // Scene DPR changes with the canvas pixel budget; sprite DPR should remain stable.
   scene.resize(1280,900);scene.resize(390,600);
   let now=0;const g=new FroggerGame({random:()=>.75,now:()=>now});g.start({animal:a.id});
   for(const kind of ['stump','hermit','firefly','beaver']){
    Object.assign(g.target,{kind,sinking:false,thorns:false,angler:false});
    g.beginCharge();now+=distance(g.frog,g.target)/MAX_JUMP*CHARGE_UP_MS;g.update();g.release();
    const end=g.jump.at+g.jump.duration;
    while(now<end+700){now=Math.min(now+1000/60,end+700);g.update();const at=performance.now();scene.draw(g);samples.push(performance.now()-at);frames++;}
    if(g.state!=='idle')failures.push(a.id+': '+kind+' failed');
   }
   if(rasterizations!==warm)failures.push(a.id+': unexpected pose rasterization '+(rasterizations-warm));
   if(scene.animalCache.size>MAX_ANIMAL_SPRITES)failures.push(a.id+': atlas budget');
   if(scene.padCache.size>3)failures.push(a.id+': pad budget');
  }
  samples.sort((a,b)=>a-b);
  return {animals:ANIMALS.length,landings:ANIMALS.length*4,frames,prepared,failures,drawCpuMs:{p50:samples[Math.floor(samples.length*.5)],p95:samples[Math.floor(samples.length*.95)],max:samples.at(-1)}};
 });
 assert.equal(report.animals,38);assert.deepEqual(report.failures,[]);console.log(JSON.stringify(report,null,2));await context.close();
}finally{await browser.close();}
