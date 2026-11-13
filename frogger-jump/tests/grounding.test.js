import test from 'node:test';import assert from 'node:assert/strict';
import {landingOffset,soleOffset,PAD_DEPTH} from '../src/grounding.js';
import {RiverScene} from '../src/scene.js';import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from '../src/game.js';import {surface} from '../src/platforms.js';import {ANIMALS} from '../src/animals.js';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function scene(){const s=Object.create(RiverScene.prototype);s.reduced={matches:false};return s;}
const projection={s:1,point:p=>({x:200+p.x,y:500-p.y*.74})};
test('the sole uses the platform ellipse perspective, including protected edge landings',()=>{
 for(const kind of ['stump','lily','turtle','lotus','shell','mushroom'])for(const offset of [{x:0,y:32},{x:40,y:-25},{x:100,y:90}]){
  const top={kind,r:62},raw={...offset},p=landingOffset(top,offset),rx=kind==='shell'?62*.83:62,ry=62*PAD_DEPTH*(kind==='shell'?.67:1);
  assert((p.x/rx)**2+(p.y/ry)**2<1);assert.deepEqual(offset,raw,'contact correction must not change collision or coin accuracy');assert.equal(Math.sign(p.y),-Math.sign(offset.y));
 }
 close(landingOffset({kind:'stump',r:62},{x:0,y:32}).y,-32*PAD_DEPTH);
});
test('every species has a planted sole during charging and landing compression',()=>{
 for(const a of ANIMALS){const idle=soleOffset(a.id),charge=soleOffset(a.id,{squat:1});assert(idle>0);assert(charge>0&&charge<idle);}
});
test('moving and sinking pads carry the rider and shadow on the same top surface',()=>{
 let now=1000;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start();const s=scene();g.riderOffset={x:12,y:15};g.landedAt=800;
 for(const kind of ['turtle','duck','ice','mushroom']){g.current.kind=kind;g.current.sinking=kind==='ice';g.deadline=kind==='ice'?900:null;
  for(const dt of [0,60,150]){now=1000+dt;const frame=s.platformFrame(g,g.current,projection),offset=landingOffset(surface(g.current,g.clock),g.riderOffset,g.clock-g.landedAt),p=s.riderContact(g,projection);close(p.x,frame.x+offset.x);close(p.y,frame.y+offset.y);}
 }
});
test('off-centre hops join the planted pose continuously at takeoff and landing',()=>{
 let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start();g.riderOffset={x:12,y:25};Object.assign(g.target,{x:0,y:200,r:62});const s=scene(),before=s.riderContact(g,projection);g.beginCharge();now+=distance(g.frog,g.target)/MAX_JUMP*CHARGE_UP_MS;g.update();g.release();const start=s.riderContact(g,projection);close(start.x,before.x);close(start.y,before.y);
 now+=g.jump.duration;const end=s.riderContact(g,projection);g.update();assert.equal(g.state,'idle');const landed=s.riderContact(g,projection);close(end.x,landed.x);close(end.y,landed.y);assert.deepEqual(g.jump.end,g.jump.visualEnd);
});
