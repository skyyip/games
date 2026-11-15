import test from 'node:test';
import assert from 'node:assert/strict';
import {FroggerGame,distance,MAX_JUMP,CHARGE_UP_MS} from '../src/game.js';
import {surface,VARIANTS} from '../src/platforms.js';
import {ANIMALS,rewardCoins} from '../src/animals.js';
import {COMPANIONS} from '../src/equipment.js';
function rig(kind='stump',animal='frog'){
 let now=0;const g=new FroggerGame({random:()=>.75,now:()=>now});g.start({animal});g.target.kind=kind;
 return {g,step(ms){now+=ms;g.update();},hop(error=0){assert(g.beginCharge());this.step((distance(g.frog,g.target)+error)/MAX_JUMP*CHARGE_UP_MS);assert(g.release());this.step(g.jump.duration);}};
}
test('economy provides early role choice and a short first companion goal without stronger expensive skins',()=>{
 assert.equal(ANIMALS.filter(a=>a.price===0).length,1);
 for(const role of new Set(ANIMALS.map(a=>a.ability)))assert(Math.min(...ANIMALS.filter(a=>a.ability===role).map(a=>a.price))<=320);
 assert(Math.max(...ANIMALS.map(a=>a.price))<=1600);
 const byId=Object.fromEntries(COMPANIONS.map(c=>[c.id,c.price]));
 assert(byId.koi<=rewardCoins(20)*2);assert(byId.crab<byId.ray);assert(byId.ray<byId.hippo);
 assert.equal(rewardCoins(20),51);assert.equal(rewardCoins(50),121);
});
test('moving hermit crabs have a bounded shared surface, predict the landing and carry the rider',()=>{
 assert(VARIANTS.includes('hermit'));const r=rig('hermit'),g=r.g;const p={...g.target};
 for(let t=0;t<10000;t+=100){const top=surface(p,t);assert(Math.abs(top.x-p.x)<=14);assert(Math.abs(top.y-p.y)<=4);assert.equal(top.r,p.r);}
 r.hop();assert.equal(g.score,1);r.step(700);assert.equal(g.frog.x,surface(g.current,g.clock).x+g.riderOffset.x);
 const before=g.frog;g.pause();r.step(5000);assert.deepEqual(g.frog,before);
});
test('anchor skills freeze moving pads at their current position without teleporting or stacking width',()=>{
 for(const kind of ['hermit','turtle','spinner','lotus']){
  const r=rig(kind,'stone-dwarf'),g=r.g;g.current.kind=kind;r.step(100);const before=surface(g.current,g.clock),target=surface(g.target,g.clock);
  assert(g.useSkill());assert.equal(surface(g.current,g.clock).x,before.x);assert.equal(surface(g.current,g.clock).r,before.r);
  r.step(5000);assert.equal(surface(g.current,g.clock).x,before.x);assert.equal(surface(g.target,g.clock).x,target.x);
  assert.equal(g.useSkill(),false);assert.equal(g.skillCharges,0);assert(g.target.r<=target.r/.76+8);
 }
});
test('a beaver bridge rewards precision by anchoring only the next pad, leaving other hazards intact',()=>{
 const r=rig('beaver'),g=r.g;g.stumps[2].sinking=true;g.stumps[2].angler=true;g.stumps[2].thorns=true;r.hop();
 assert.equal(g.score,1);assert(g.stumps[1].reinforced);assert.equal(g.stumps[1].sinking,false);assert(g.stumps[1].angler);assert(g.stumps[1].thorns);assert.equal(g.bonusCoins,0);assert.equal(g.skillCharges,1);
 const edge=rig('beaver');edge.g.stumps[2].sinking=true;edge.hop(30);assert.equal(edge.g.target.sinking,true);
});
test('firefly rewards require both the lit window and true centre accuracy',()=>{
 const seen=new Set();for(let offset=0;offset<5000;offset+=200){const r=rig('firefly'),g=r.g;r.step(offset);r.hop();assert.equal(g.score,1);const glowing=surface(g.current,g.landedAt).glowing;seen.add(glowing);assert.equal(g.bonusCoins,glowing?1:0);assert.equal(g.drainEvents().find(e=>e.type==='land').coins,glowing?3:2);}
 assert.deepEqual(seen,new Set([true,false]));const edge=rig('firefly');edge.hop(30);assert.equal(edge.g.bonusCoins,0);
 const assisted=rig('firefly','duck');assisted.g.useSkill();assisted.hop(70);assert.equal(assisted.g.score,1);assert(assisted.g.jump.corrected);assert.equal(assisted.g.bonusCoins,0);
});
test('a shield waits through safe landings, blocks one later fish and then permits another activation',()=>{
 const r=rig('stump','mochi'),g=r.g;g.skillCharges=2;assert(g.useSkill());
 for(let i=0;i<3;i++){r.hop();assert(g.fishShield);assert.equal(g.skillCharges,1);assert.equal(g.useSkill(),false);}
 g.target.angler=true;g.update();r.step(1000);r.hop();assert.equal(g.state,'idle');assert.equal(g.score,4);
 assert.equal(g.fishShield,false);assert.equal(g.skillPending,null);assert.equal(g.drainEvents().filter(e=>e.type==='fish-blocked').length,1);
 assert(g.useSkill());assert.equal(g.skillCharges,0);
});
test('a hippo rescue preserves an unspent animal fish shield instead of leaving a stuck pending skill',()=>{
 const r=rig('stump','mochi'),g=r.g;g.start({animal:'mochi',companion:'hippo'});assert(g.useSkill());r.hop(180);
 assert.equal(g.state,'idle');assert.equal(g.score,0);assert.equal(g.companionReady,false);assert(g.fishShield);assert.equal(g.skillPending,'shield');
 g.target.angler=true;g.update();r.step(1000);r.hop();assert.equal(g.state,'idle');assert.equal(g.fishShield,false);assert.equal(g.skillPending,null);
});
