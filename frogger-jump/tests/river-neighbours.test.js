import test from 'node:test';
import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from '../src/game.js';
import {availableVariants,FRIEND_UNLOCKS,VARIANTS,surface} from '../src/platforms.js';
function rig(kind='stump',animal='frog'){
 let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start({animal});g.target.kind=kind;
 return {g,step(ms){now+=ms;g.update();},hop(error=0){assert(g.beginCharge());this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);assert(g.release());this.step(g.jump.duration);}};
}
test('new neighbours unlock progressively without raising the special-pad encounter rate',()=>{
 assert.equal(availableVariants(20).length,10);assert.equal(availableVariants(51).length,14);
 for(const [kind,at]of Object.entries(FRIEND_UNLOCKS)){assert(!availableVariants(at-1).includes(kind));assert(availableVariants(at).includes(kind));}
 for(const score of [0,20,30,40,50,100]){
  let seed=52;const g=new FroggerGame({random:()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32)});g.start();g.score=score;
  for(let i=0;i<1000;i++){const pad=g.generate(g.stumps.at(-1),i+3);assert((FRIEND_UNLOCKS[pad.kind]??0)<=score+3);g.stumps.shift();g.stumps.push(pad);}
 }
 assert.equal(VARIANTS.length,14);
});
test('bee pollen rewards only the next truly centred success and obeys the existing coin cap',()=>{
 const r=rig('bee'),g=r.g;r.hop();assert(g.pollenReady);assert.equal(g.bonusCoins,0);
 g.target.kind='stump';r.hop();assert.equal(g.bonusCoins,1);assert(!g.pollenReady);r.hop();assert.equal(g.bonusCoins,1);
 const edge=rig('bee');edge.hop(30);assert(!edge.g.pollenReady);
 const miss=rig('bee');miss.hop();miss.g.target.kind='stump';miss.hop(30);assert.equal(miss.g.bonusCoins,0);assert(!miss.g.pollenReady);
 const capped=rig('bee');capped.hop();capped.g.target.kind='shell';capped.hop();assert.equal(capped.g.drainEvents().filter(e=>e.type==='land').at(-1).coins,5);
});
test('snail grace lasts one successful landing, never stacks, and pauses with the game',()=>{
 const r=rig('snail'),g=r.g;r.hop();assert.equal(g.sinkGrace,800);
 g.target.kind='snail';r.hop();assert.equal(g.sinkGrace,800);
 g.target.kind='ice';g.target.sinking=true;r.hop();assert.equal(g.sinkRemaining,4300);assert.equal(g.sinkGrace,0);
 g.pause();r.step(10000);assert.equal(g.sinkRemaining,4300);g.resume();r.step(4299);assert.equal(g.state,'idle');r.step(1);assert.equal(g.state,'drowning');
 const dry=rig('snail');dry.hop();dry.g.target.kind='stump';dry.hop();assert.equal(dry.g.sinkGrace,0);dry.g.target.sinking=true;dry.hop();assert.equal(dry.g.sinkRemaining,2500);
 const edge=rig('snail');edge.hop(30);assert.equal(edge.g.sinkGrace,0);
});
test('crab clears just the following pad after a centre landing and preserves other hazards',()=>{
 const r=rig('crab'),g=r.g;g.stumps[2].thorns=true;g.stumps[2].angler=true;r.hop();assert(!g.stumps[1].thorns);assert(g.stumps[1].angler);assert.equal(g.bonusCoins,0);assert.equal(g.skillCharges,1);
 const edge=rig('crab');edge.g.stumps[2].thorns=true;edge.hop(30);assert(edge.g.stumps[1].thorns);
});
test('kingfisher buoy shares predictable bounded motion, carries the rider, and anchors without teleporting',()=>{
 const r=rig('kingfisher','stone-dwarf'),g=r.g,pad={...g.target};
 for(let t=0;t<10000;t+=100){const p=surface(pad,t);assert(Math.abs(p.y-pad.y)<=10);assert(Math.abs(p.x-pad.x)<=4);assert.equal(p.r,pad.r);}
 r.hop();assert.equal(g.score,1);r.step(700);assert.equal(g.frog.y,surface(g.current,g.clock).y+g.riderOffset.y);
 const before=surface(g.current,g.clock);assert(g.useSkill());r.step(5000);assert.equal(surface(g.current,g.clock).x,before.x);assert.equal(surface(g.current,g.clock).y,before.y);
});
test('rescue and restart clear unspent pollen and snail buffs without awarding extra coins',()=>{
 const r=rig('bee','capybara'),g=r.g;r.hop();g.sinkGrace=800;assert(g.useSkill());r.hop(200);assert.equal(g.state,'idle');assert(!g.pollenReady);assert.equal(g.sinkGrace,0);assert.equal(g.bonusCoins,0);
 g.pollenReady=true;g.sinkGrace=800;g.start();assert(!g.pollenReady);assert.equal(g.sinkGrace,0);assert.equal(g.skillCharges,1);
});
