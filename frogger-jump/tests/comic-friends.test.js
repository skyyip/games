import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,MAX_JUMP,CHARGE_UP_MS,distance} from '../src/game.js';
import {ANIMALS} from '../src/animals.js';
import {freshProfile,buyAnimal,readProfile,settleLocal} from '../src/profile.js';
function rig(animal){let now=0;const g=new FroggerGame({random:()=>.75,now:()=>now});g.start({animal});return {g,step(ms){now+=ms;g.update();},hop(){g.beginCharge();this.step(distance(g.frog,g.target)/MAX_JUMP*CHARGE_UP_MS);g.release();this.step(g.jump.duration);}};}
test('Chiikawa cheer protects the next hop and widens the actual target beyond thorns',()=>{
 const r=rig('chiikawa'),g=r.g;g.stumps[1].thorns=true;const target=g.target,before=target.r;
 g.beginCharge();assert(g.useSkill());assert.equal(g.state,'idle');assert(g.fishShield);assert(g.softLanding);assert.equal(g.stumps[1].thorns,true);assert.equal(target.r,before+6);assert.equal(g.skillCharges,0);assert.equal(g.useSkill(),false);
 r.hop();assert.equal(g.score,1);assert.equal(g.current,target);assert.equal(g.fishShield,false);assert.equal(g.softLanding,false);
});
test('Chiikawa fish protection is consumed by a real airborne collision without losing the run',()=>{
 const r=rig('chiikawa'),g=r.g;Object.assign(g.target,{x:0,y:180,angler:true});g.update();g.useSkill();r.step(1000);r.hop();assert.equal(g.state,'idle');assert.equal(g.score,1);assert.equal(g.drainEvents().filter(e=>e.type==='fish-blocked').length,1);assert.equal(g.jump.shield,false);
});
test('Hachiware clears both upcoming pads and updates the aim while leaving a current deadline intact',()=>{
 const r=rig('hachiware'),g=r.g;g.target.sinking=true;r.hop();const deadline=g.deadline;
 Object.assign(g.stumps[1],{thorns:true,angler:true});Object.assign(g.stumps[2],{sinking:true,thorns:true});const radius=g.stumps[1].r;
 assert(g.useSkill());assert.equal(g.targetIndex,1);assert.equal(g.deadline,deadline);assert.equal(g.current.sinking,true);assert.equal(g.target.r,radius+8);
 for(const pad of g.stumps.slice(1)){assert(!pad.thorns&&!pad.sinking&&!pad.angler);assert(pad.reinforced);}assert.equal(g.fish,null);
});
test('Usagi rescues a timed pad and cushions the real landing target without erasing a thorn skip',()=>{
 const r=rig('usagi'),g=r.g;g.target.sinking=true;r.hop();assert(g.deadline);g.stumps[1].thorns=true;const target=g.target,before=target.r;
 assert(g.useSkill());assert.equal(g.deadline,null);assert.equal(g.current.sinking,false);assert(g.softLanding);assert.equal(target.r,before+16);assert.equal(g.stumps[1].thorns,true);assert.equal(g.skillCharges,0);
 r.hop();assert.equal(g.score,2);assert.equal(g.current,target);assert.equal(g.softLanding,false);
});
test('all three comic friends purchase exactly once, reload, and settle their own runs',()=>{
 for(const a of ANIMALS.filter(a=>['chiikawa','hachiware','usagi'].includes(a.id))){
  let p=buyAnimal({...freshProfile('漫畫朋友'),coins:a.price},a.id);assert.equal(p.coins,0);p=readProfile(JSON.stringify(p));assert.equal(p.selected,a.id);assert(p.owned.includes(a.id));assert.equal(buyAnimal(p,a.id).coins,0);
  const done=settleLocal(p,{id:a.id+'-run',score:1,animal:a.id});assert.equal(done.reward,3);assert.equal(done.profile.bestAnimal,a.id);assert.equal(settleLocal(done.profile,{id:a.id+'-run',score:1,animal:a.id}).reward,0);
 }
});
