import test from 'node:test';import assert from 'node:assert/strict';
import {RiverScene,MAX_CANVAS_PIXELS} from '../src/scene.js';import {FroggerGame} from '../src/game.js';
function withScene(run){
 const original={document:globalThis.document,matchMedia:globalThis.matchMedia,devicePixelRatio:globalThis.devicePixelRatio};let resets=0;
 const canvas=()=>{const ctx={setTransform(){},drawImage(){},clearRect(){},beginPath(){},ellipse(){},fill(){}};return {getContext:()=>ctx,set width(v){this.w=v;resets++;},get width(){return this.w;},set height(v){this.h=v;resets++;},get height(){return this.h;}};};
 Object.assign(globalThis,{document:{createElement:canvas},matchMedia:()=>({matches:false}),devicePixelRatio:3});
 try{const scene=new RiverScene(canvas());return run(scene,()=>resets);}finally{for(const [key,value]of Object.entries(original)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
}
test('large high-DPR scenes have a bounded backing store; identical resize does not reset Canvas',()=>withScene((s,resets)=>{
 assert(s.resize(1280,900));assert(s.canvas.width*s.canvas.height<=MAX_CANVAS_PIXELS+2000);const before=resets();assert.equal(s.resize(1280,900),false);assert.equal(resets(),before);assert(s.resize(390,600));assert.equal(s.pixelRatio,1.75);
}));
test('unchanged water is rasterized once and resized water invalidates the layer',()=>withScene(s=>{
 s.resize(400,500);let paints=0;s.paintWater=()=>paints++;s.water();s.water();assert.equal(paints,1);s.resize(401,500);s.water();assert.equal(paints,2);
}));
test('static platform cache responds to language, landing radius and role changes',()=>withScene(s=>{
 s.resize(400,500);const g=new FroggerGame({random:()=>.75,now:()=>0});g.start();let paints=0;s.paintPlatform=()=>paints++;let projection=s.projection(g);s.stump(g,g.target,1,projection);s.stump(g,g.target,1,projection);assert.equal(paints,1);g.useSkill();s.stump(g,g.target,1,projection);assert.equal(paints,2);s.zh=false;s.stump(g,g.target,1,projection);assert.equal(paints,3);s.stump(g,g.target,0,projection);assert.equal(paints,4);
}));
test('breathing pads and a newly landed or sinking current pad never reuse a frozen sprite',()=>withScene(s=>{
 s.resize(400,500);let clock=1000;const g=new FroggerGame({random:()=>.75,now:()=>clock});g.start();let paints=0;s.paintPlatform=()=>paints++;const projection=s.projection(g);g.target.kind='spinner';s.stump(g,g.target,1,projection);s.stump(g,g.target,1,projection);assert.equal(paints,2);g.landedAt=900;s.stump(g,g.current,0,projection);s.stump(g,g.current,0,projection);assert.equal(paints,4);clock=2000;g.current.sinking=true;s.stump(g,g.current,0,projection);s.stump(g,g.current,0,projection);assert.equal(paints,6);
}));
test('platform bitmaps stay bounded to the visible trio and reset releases them',()=>withScene(s=>{
 s.resize(400,500);const g=new FroggerGame({random:()=>.75,now:()=>0});g.start();s.paintPlatform=()=>{};s.animal=()=>{};s.ripples=()=>{};s.skillEffect=()=>{};s.paintWater=()=>{};
 for(let i=0;i<100;i++){s.draw(g);assert(s.padCache.size<=3);const previous=g.stumps.at(-1);g.stumps.shift();g.stumps.push({...previous,id:previous.id+1,y:previous.y+180});}s.reset();assert.equal(s.padCache.size,0);
}));

test('repeated animal poses reuse sprites; species and animation changes invalidate them within a fixed bound',()=>withScene(s=>{
 s.resize(400,500);let paints=0;s.paintAnimal=()=>paints++;
 s.animal(20,30,1,'frog',{squat:.25});s.animal(40,60,.8,'frog',{squat:.25});assert.equal(paints,1);
 s.animal(40,60,1,'mochi',{squat:.25});assert.equal(paints,2);
 for(let i=0;i<100;i++)s.animal(0,0,1,'mochi',{squat:i/20});assert(s.animalCache.size<=48);
 const count=s.animalCache.size;s.resize(401,500);assert.equal(s.animalCache.size,count);globalThis.devicePixelRatio=1;s.resize(401,500);assert.equal(s.animalCache.size,0);
}));

test('drifting turtles reuse artwork while following the live landing surface',()=>withScene(s=>{
 s.resize(400,500);let clock=1000;const g=new FroggerGame({random:()=>.75,now:()=>clock});g.start();g.target.kind='turtle';let paints=0;const points=[];s.paintPlatform=()=>paints++;s.ctx.drawImage=(canvas,x,y)=>points.push([x,y]);const projection=s.projection(g);
 s.stump(g,g.target,1,projection);clock+=800;s.stump(g,g.target,1,projection);assert.equal(paints,1);assert.notEqual(points[0][0],points[1][0]);
}));
test('settled special pads cache safely but landing reactions finish before caching',()=>withScene(s=>{
 s.resize(400,500);let clock=0;const g=new FroggerGame({random:()=>.75,now:()=>clock});g.start();let paints=0;s.paintPlatform=()=>paints++;const projection=s.projection(g);
 for(const kind of ['mushroom','duck','shell','ice']){g.target.kind=kind;s.stump(g,g.target,1,projection);const before=paints;s.stump(g,g.target,1,projection);assert.equal(paints,before);}
 g.current.kind='turtle';g.landedAt=0;clock=550;const before=paints;s.stump(g,g.current,0,projection);s.stump(g,g.current,0,projection);assert.equal(paints,before+2);clock=700;s.stump(g,g.current,0,projection);const settled=paints;s.stump(g,g.current,0,projection);assert.equal(paints,settled);
}));
test('hot animal poses survive cache eviction and same-DPR resize',()=>withScene(s=>{
 s.resize(400,500);s.paintAnimal=()=>{};s.animal(0,0,1,'frog',{});const hot=s.animalCache.values().next().value;
 for(let i=0;i<80;i++){s.animal(0,0,1,'frog',{});s.animal(0,0,1,'frog',{squat:1+i/20});}
 assert([...s.animalCache.values()].includes(hot));assert(s.animalCache.size<=48);s.resize(401,500);assert([...s.animalCache.values()].includes(hot));
}));

test('camera zoom scales one canonical platform bitmap instead of repainting every frame',()=>withScene(s=>{
 s.resize(400,500);const g=new FroggerGame({random:()=>.75,now:()=>0});g.start();let paints=0;const scales=[];s.paintPlatform=()=>paints++;s.zoomFrom=.6;s.zoomTarget=1.1;s.ctx.drawImage=(canvas,x,y,w)=>scales.push(w);
 for(let i=0;i<30;i++)s.stump(g,g.target,1,{s:.6+i/29*.5,point:()=>({x:200,y:300})});
 assert.equal(paints,1);assert(scales.at(-1)>scales[0]);s.zoomFrom=1.1;s.zoomTarget=.7;s.stump(g,g.target,1,{s:1,point:()=>({x:200,y:300})});assert.equal(paints,1);
}));
test('prewarmed flight poses do not rerasterize during a hop and the atlas remains bounded',()=>withScene(s=>{
 s.resize(400,500);let paints=0;s.paintAnimal=()=>paints++;s.prepareAnimal('frog');const before=paints;
 for(let i=0;i<=80;i++)s.animal(100,100,1,'frog',{airborne:true,flightPhase:i/80,anchorFeet:true});
 assert.equal(paints,before);assert(s.animalCache.size<=48);
}));
