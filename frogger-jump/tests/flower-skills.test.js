import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS,DROWN_MS} from '../src/game.js';
import {ANIMALS} from '../src/animals.js';import {RETIRED_COMPANION_PRICES} from '../src/retired-companions.js';import {FLOWER_IDS} from '../src/flowers.js';
function rig(options={}){let now=0;const g=new FroggerGame({now:()=>now,random:()=>.75});g.start(options);return {g,step(ms){now+=ms;g.update();},hop(error=0){g.beginCharge();this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);g.release();this.step(g.jump.duration);}};}
test('all eight flower families keep their save IDs and named animal abilities',()=>{assert.equal(FLOWER_IDS.length,8);for(const id of FLOWER_IDS){const {g}=rig({animal:id});assert(ANIMALS.find(a=>a.id===id));assert.equal(g.animal,id);assert(g.useSkill());assert.equal(g.skillCharges,0);assert.equal(g.score,0);assert.equal(g.bonusCoins,0);}});
test('legacy companion options provide no automatic rescue, adjustment, coins or passive slots',()=>{
 for(const id of Object.keys(RETIRED_COMPANION_PRICES)){const r=rig({companion:id}),g=r.g;r.hop();assert.equal(g.bonusCoins,0);assert(!('companion' in g));assert(!('companionReady' in g));r.hop(100);assert.equal(g.state,'drowning');}
});
test('cross-hop absorbs koi precision rewards only when a skill is spent and the centre is earned',()=>{
 const r=rig({animal:'bunny'}),g=r.g;assert(g.useSkill());r.hop();assert.equal(g.score,1);assert.equal(g.bonusCoins,1);assert.equal(g.skillCharges,0);r.hop();assert.equal(g.bonusCoins,1);
 const edge=rig({animal:'bunny'});edge.g.useSkill();edge.hop(30);assert.equal(edge.g.bonusCoins,0);
 const capped=rig({animal:'bunny'});capped.g.stumps[2].kind='shell';capped.g.useSkill();capped.hop();assert.equal(capped.g.bonusCoins,3);
 const automatic=rig();automatic.g.target.thorns=true;automatic.hop();assert.equal(automatic.g.jump.steps,2);assert.equal(automatic.g.bonusCoins,0);
});
test('all animals keep one bounded active skill and no independent support slot',()=>{for(const a of ANIMALS){const {g}=rig({animal:a.id}),base=g.stumps[1].r;g.skillCharges=2;assert(g.useSkill());assert.equal(g.useSkill(),false);assert.equal(g.skillCharges,1);assert(g.stumps[1].r<=Math.min(90,base+8));assert.equal(g.score,0);assert.equal(g.bonusCoins,0);assert.equal(typeof g.useEquipment,'undefined');assert(!('equippedSkill' in g));assert(!('companion' in g));}});
