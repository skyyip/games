import test from 'node:test';import assert from 'node:assert/strict';
import {placeBurstRing} from '../src/ring-layout.js';
test('random rings stay inside the central 80% of portrait and landscape arenas without overlapping touch targets',()=>{
 let seed=7;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(const [width,height]of [[264,210],[320,340],[720,112],[700,500]])for(let trial=0;trial<200;trial++){
  const occupied=[];
  for(let i=0;i<3;i++){
   const position=trial===0?{x:0,y:0}:trial===1?{x:.999,y:.999}:{x:random(),y:random()},p=placeBurstRing(width,height,occupied,position);
   assert(p,JSON.stringify({width,height,occupied,position}));assert(p.size>=44);assert(p.x-p.size/2>=width*.1+6-1e-9&&p.y-p.size/2>=height*.1+6-1e-9);assert(p.x+p.size/2<=width*.9-6+1e-9&&p.y+p.size/2<=height*.9-6+1e-9);
   for(const other of occupied)assert(Math.abs(p.x-other.x)>=(p.size+other.size)/2+8||Math.abs(p.y-other.y)>=(p.size+other.size)/2+8);
   occupied.push(p);
  }
 }
});
test('an unobstructed ring can appear across the central 80% of the arena, independently of the paper body',()=>{
 for(const x of [0,.2,.5,.8,.999])for(const y of [0,.2,.5,.8,.999]){
  const p=placeBurstRing(320,340,[],{x,y});assert.equal(p.x,32+6+p.size/2+x*(256-12-p.size));assert.equal(p.y,34+6+p.size/2+y*(272-12-p.size));
 }
});
