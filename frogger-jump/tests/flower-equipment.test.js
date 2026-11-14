import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS,DROWN_MS} from '../src/game.js';
import {ANIMALS} from '../src/animals.js';import {SKILLS,COMPANIONS} from '../src/equipment.js';import {FLOWER_IDS} from '../src/flowers.js';
function rig(options={}){let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start(options);return {g,step(ms){now+=ms;g.update();},hop(error=0){g.beginCharge();this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);g.release();this.step(g.jump.duration);}};}
test('flower families retain original IDs and all eight have usable distinct skills',()=>{
 assert.equal(FLOWER_IDS.length,8);for(const id of FLOWER_IDS){const {g}=rig({animal:id}),a=ANIMALS.find(a=>a.id===id);assert(a);assert.equal(g.animal,id);assert(g.useSkill());assert.equal(g.skillCharges,0);assert.equal(g.score,0);assert.equal(g.bonusCoins,0);}
 for(const id of ['black-sprout','purple-sprout','ice-sprout']){const {g}=rig({animal:id});g.current.sinking=true;g.deadline=2500;g.stumps[1].sinking=true;g.stumps[1].angler=true;g.useSkill();assert.equal(g.stumps[1].angler,true,'reinforcing a pad does not also remove fish');if(id!=='ice-sprout')assert.equal(g.deadline,null);if(id==='ice-sprout')assert(g.fishShield);}
 const {g}=rig({animal:'pink-sprout'});g.useSkill();assert(g.fishShield&&g.softLanding);
 const white=rig({animal:'white-sprout'}).g;white.stumps[1].thorns=white.stumps[2].thorns=true;white.useSkill();assert(white.stumps.slice(1).every(p=>!p.thorns));
});
test('shears clear thorns, anchor rescues timers, and bubble shield protects one real fish collision',()=>{
 const shears=rig({skill:'prune'}).g;shears.stumps[1].thorns=shears.stumps[2].thorns=true;assert(shears.useEquipment());assert(shears.stumps.slice(1).every(p=>!p.thorns));assert.equal(shears.gearCharges,0);assert.equal(shears.useEquipment(),false);
 const anchor=rig({skill:'anchor'}).g;anchor.current.sinking=anchor.stumps[1].sinking=true;anchor.deadline=2500;anchor.stumps[1].angler=true;assert(anchor.useEquipment());assert.equal(anchor.deadline,null);assert(!anchor.current.sinking&&!anchor.stumps[1].sinking);assert(anchor.stumps[1].angler);
 const r=rig({skill:'shield'}),g=r.g;Object.assign(g.target,{x:0,y:180,angler:true});g.update();assert(g.useEquipment());r.step(1000);r.hop();assert.equal(g.score,1);assert.equal(g.drainEvents().filter(e=>e.type==='fish-blocked').length,1);assert.equal(g.fishShield,false);assert.equal(g.gearCharges,0);
});
test('crab waits for actual thorns and only clears one next pad per run',()=>{
 const {g}=rig({companion:'crab'});g.update();assert(g.companionReady);g.stumps[1].thorns=g.stumps[2].thorns=true;g.update();assert(!g.stumps[1].thorns);assert(g.stumps[2].thorns);assert(!g.companionReady);g.stumps[1].thorns=true;g.update();assert(g.stumps[1].thorns);g.start({companion:'crab'});assert(g.companionReady);
});
test('beaver reinforces the first occupied timed pad, and never grants a fall rescue',()=>{
 const r=rig({companion:'beaver'}),g=r.g;g.target.sinking=true;r.hop();assert.equal(g.score,1);assert(!g.current.sinking);assert.equal(g.deadline,null);assert(!g.companionReady);g.current.sinking=true;g.deadline=g.clock+100;r.step(101);assert.equal(g.state,'drowning');r.step(DROWN_MS);assert.equal(g.state,'over');
});
test('koi pays one earned centre bonus and waits when the per-landing bonus is already full',()=>{
 const r=rig({companion:'koi'}),g=r.g;r.hop(30);assert(g.companionReady);assert.equal(g.bonusCoins,0);g.target.kind='shell';r.hop();assert(g.companionReady);assert.equal(g.bonusCoins,3);r.hop();assert(!g.companionReady);assert.equal(g.bonusCoins,4);r.hop();assert.equal(g.bonusCoins,4);
});
test('every animal and equipment loadout respects shared assistance limits without granting scores or coins',()=>{
 for(const a of ANIMALS)for(const gear of SKILLS){const {g}=rig({animal:a.id,skill:gear.id});const base=g.stumps[1].r;g.skillCharges=3;g.useSkill();g.useSkill();g.useSkill();g.useEquipment();assert(g.stumps[1].r<=Math.min(90,base+22));assert.equal(g.skillCharges,0);assert.equal(g.gearCharges,0);assert.equal(g.score,0);assert.equal(g.bonusCoins,0);}
 for(const item of [...SKILLS,...COMPANIONS]){assert(Number.isSafeInteger(item.price)&&item.price>0);assert(item.descriptionZh&&item.descriptionEn);}
});
