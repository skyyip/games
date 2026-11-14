import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS,DROWN_MS} from '../src/game.js';
import {ANIMALS} from '../src/animals.js';import {COMPANIONS} from '../src/equipment.js';import {FLOWER_IDS} from '../src/flowers.js';
function rig(options={}){let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start(options);return {g,step(ms){now+=ms;g.update();},hop(error=0){g.beginCharge();this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);g.release();this.step(g.jump.duration);}};}
test('all eight flower families keep their save IDs and named animal abilities',()=>{assert.equal(FLOWER_IDS.length,8);for(const id of FLOWER_IDS){const {g}=rig({animal:id});assert(ANIMALS.find(a=>a.id===id));assert.equal(g.animal,id);assert(g.useSkill());assert.equal(g.skillCharges,0);assert.equal(g.score,0);assert.equal(g.bonusCoins,0);}});
test('crab waits for actual thorns and only clears one next pad per run',()=>{
 const {g}=rig({companion:'crab'});g.update();assert(g.companionReady);g.stumps[1].thorns=g.stumps[2].thorns=true;g.update();assert(!g.stumps[1].thorns);assert(g.stumps[2].thorns);assert(!g.companionReady);g.stumps[1].thorns=true;g.update();assert(g.stumps[1].thorns);g.start({companion:'crab'});assert(g.companionReady);
});
test('beaver reinforces the first occupied timed pad, and never grants a fall rescue',()=>{
 const r=rig({companion:'beaver'}),g=r.g;g.target.sinking=true;r.hop();assert.equal(g.score,1);assert(!g.current.sinking);assert.equal(g.deadline,null);assert(!g.companionReady);g.current.sinking=true;g.deadline=g.clock+100;r.step(101);assert.equal(g.state,'drowning');r.step(DROWN_MS);assert.equal(g.state,'over');
});
test('koi pays one earned centre bonus and waits when the per-landing bonus is already full',()=>{
 const r=rig({companion:'koi'}),g=r.g;r.hop(30);assert(g.companionReady);assert.equal(g.bonusCoins,0);g.target.kind='shell';r.hop();assert(g.companionReady);assert.equal(g.bonusCoins,3);r.hop();assert(!g.companionReady);assert.equal(g.bonusCoins,4);r.hop();assert.equal(g.bonusCoins,4);
});
test('every animal and companion combination respects the shared charge and radius limits',()=>{for(const a of ANIMALS)for(const buddy of COMPANIONS){const {g}=rig({animal:a.id,companion:buddy.id}),base=g.stumps[1].r;g.skillCharges=3;assert(g.useSkill());assert.equal(g.useSkill(),false);assert.equal(g.skillCharges,2);assert(g.stumps[1].r<=Math.min(90,base+8));assert.equal(g.score,0);assert.equal(g.bonusCoins,0);assert.equal(typeof g.useEquipment,'undefined');assert(!('equippedSkill' in g));}});
