import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from '../src/game.js';
import {VARIANTS,surface,dangerous} from '../src/platforms.js';
import {freshProfile,settleLocal} from '../src/profile.js';
function rig(kind='stump',species='frog'){
 let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start({animal:species});g.target.kind=kind;g.target.sinking=kind==='ice';
 return {g,step(ms){now+=ms;g.update();},hop(error=0){assert(g.beginCharge());this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);assert(g.release());this.step(g.jump.duration);}};
}
test('all seven special pads occur sparingly, while no visible trio has two dangers',()=>{
 let seed=55,seen=new Set(),special=0;const g=new FroggerGame({random:()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32)});g.start();
 for(let i=0;i<20000;i++){assert(g.stumps.filter(dangerous).length<=1);const p=g.stumps.at(-1);if(VARIANTS.includes(p.kind)){special++;seen.add(p.kind);}g.stumps.shift();g.stumps.push(g.generate(p,p.id+1));}
 assert.equal(seen.size,7);assert(special/20000>.09&&special/20000<.15);
});
test('flower and rotating leaf visuals share their bounded breathing landing radius',()=>{
 for(const kind of ['lotus','spinner']){const p={id:2,x:0,y:200,r:54,kind},radii=[];for(let t=0;t<10000;t+=100)radii.push(surface(p,t).r);assert(Math.min(...radii)>=41);assert(Math.max(...radii)<=54);assert(Math.max(...radii)-Math.min(...radii)>10);const r=rig(kind);r.hop();assert.equal(r.g.score,1);}
});
test('turtle is pre-aimed at its future centre and carries its rider with it',()=>{
 const r=rig('turtle'),g=r.g;g.beginCharge();r.step(350);const expected=surface(g.target,g.clock+560+g.power*180);g.release();assert.deepEqual(g.jump.visualEnd,{x:expected.x,y:expected.y});r.step(g.jump.duration);assert.equal(g.score,1);r.step(700);assert.equal(g.frog.x,surface(g.current,g.clock).x);assert.notEqual(g.frog.x,g.current.x);g.pause();const x=g.frog.x;r.step(4000);assert.equal(g.frog.x,x);
});
test('duck slide blocks a new hold until it settles and pause freezes it',()=>{
 const r=rig('duck'),g=r.g;r.hop();assert.equal(g.beginCharge(),false);r.step(200);const pos=g.frog.y;g.pause();r.step(20000);assert.equal(g.frog.y,pos);g.resume();r.step(240);assert.equal(g.frog.y,g.current.y+18);assert(g.beginCharge());
});
test('ice cracks over 3.5 seconds; penguin reinforcement cancels the deadline',()=>{
 const r=rig('ice'),g=r.g;r.hop();assert.equal(g.sinkRemaining,3500);r.step(3499);assert.equal(g.state,'idle');r.step(1);assert.equal(g.state,'drowning');
 const p=rig('ice','penguin');p.hop();p.step(1000);assert(p.g.useSkill());assert.equal(p.g.deadline,null);p.step(10000);assert.equal(p.g.state,'idle');assert(p.g.current.reinforced);
});
test('mushroom centre grants precisely one softer landing, consumed on release',()=>{
 const r=rig('mushroom'),g=r.g;r.hop();assert(g.softLanding);g.target.r=40;r.hop(48);assert.equal(g.score,2);assert.equal(g.softLanding,false);g.target.r=40;r.hop(48);assert.equal(g.state,'drowning');
});
test('lotus and shell pay centre bonuses only, and settlement is idempotent',()=>{
 for(const [kind,bonus]of [['lotus',2],['shell',3]]){const r=rig(kind);r.hop();assert.equal(r.g.bonusCoins,bonus);const first=settleLocal(freshProfile('River'),{id:kind,score:1,animal:'frog',bonusCoins:bonus});assert.equal(first.reward,3+bonus);assert.equal(settleLocal(first.profile,{id:kind,score:1,animal:'frog',bonusCoins:bonus}).reward,0);const edge=rig(kind);edge.hop(30);assert.equal(edge.g.score,1);assert.equal(edge.g.bonusCoins,0);}
 assert.throws(()=>settleLocal(freshProfile(),{id:'bad',score:1,animal:'frog',bonusCoins:4}),/invalid-run/);
});
