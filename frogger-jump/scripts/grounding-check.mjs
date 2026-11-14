import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const bundle=await build({stdin:{contents:"export {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from './src/game.js';export {RiverScene} from './src/scene.js';export {ANIMALS} from './src/animals.js';",resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,format:'esm',platform:'browser'});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:920},deviceScaleFactor:1,serviceWorkers:'block'});
 await context.route('**/*',route=>route.request().url().endsWith('harness.js')?route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}):route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><style>body{margin:0;background:#f8f7eb;font:14px system-ui}main{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:12px}article{min-width:0;position:relative}h2{font-size:14px}.river-water-layer{position:absolute;z-index:-1;left:0;bottom:0}article{isolation:isolate}canvas{display:block;background:#94caba;width:100%;border-radius:16px}</style></head><body><main></main></body></html>'}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://frog-check.local/');
 const report=await page.evaluate(async()=>{
  const {FroggerGame,RiverScene,ANIMALS,distance,MAX_JUMP,CHARGE_UP_MS}=await import('/harness.js');
  const samples=[['frog','stump',30],['bunny','lily',-30],['usagi','turtle',30],['mermaid','shell',-35],['elf-mage','mushroom',30],['shisa','lotus',-30],['momonga','ice',20],['red-sprout','duck',30]];
  for(const [animal,kind,offset]of samples){const card=document.createElement('article'),heading=document.createElement('h2'),canvas=document.createElement('canvas');heading.textContent=`${animal} · ${kind} · ${offset>0?'+':''}${offset}`;card.append(heading,canvas);document.querySelector('main').append(card);const g=new FroggerGame({random:()=>.75,now:()=>1000});g.start({animal});g.current.kind=kind;g.riderOffset={x:0,y:offset};g.landedAt=800;const scene=new RiverScene(canvas);scene.resize(300,360);scene.draw(g);}
  let flightFrames=0,flightVectorPaints=0;const timings=[];
  for(const animal of ANIMALS){let now=1000;const g=new FroggerGame({random:()=>.75,now:()=>now});g.start({animal:animal.id});const canvas=document.createElement('canvas'),s=new RiverScene(canvas);s.resize(390,560);s.prepareAnimal(animal.id);const paint=s.paintAnimal.bind(s);s.paintAnimal=(...args)=>{flightVectorPaints++;return paint(...args);};
   for(let hop=0;hop<3;hop++){s.draw(g);g.beginCharge();now+=distance(g.frog,g.target)/MAX_JUMP*CHARGE_UP_MS;g.update();g.release();const at=now;
    for(let t=0;t<g.jump.duration;t+=1000/60){now=at+t;g.update();const start=performance.now();s.draw(g);timings.push(performance.now()-start);flightFrames++;}
    now=at+g.jump.duration;g.update();if(g.state!=='idle')throw Error(`hop failed: ${animal.id}`);
   }
  }
  timings.sort((a,b)=>a-b);return {species:ANIMALS.length,flightFrames,flightVectorPaints,drawP95Ms:timings[Math.floor(timings.length*.95)],drawMaxMs:timings.at(-1)};
 });
 assert.equal(report.species,38);assert.equal(report.flightVectorPaints,0,'prewarmed hops must not rasterize animal vector art');assert(report.flightFrames>3000);assert.deepEqual(errors,[]);await page.screenshot({path:'/tmp/frog-grounding-gallery.png',fullPage:true});await writeFile('/tmp/frog-flight-performance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await context.close();
}finally{await browser.close();}
