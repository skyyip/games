import test from 'node:test';import assert from 'node:assert/strict';
import {FroggerGame,CHARGE_UP_MS,MAX_JUMP,DROWN_MS,distance} from '../src/game.js';
import {FISH_WARNING_MS,FISH_LEAP_MS,fishPose} from '../src/fish.js';
import {animal} from '../src/animals.js';
import {freshProfile,buyAnimal,readProfile} from '../src/profile.js';
function rig(kind='frog'){
 let at=0;const g=new FroggerGame({random:()=>.75,now:()=>at});g.start({animal:kind});Object.assign(g.target,{x:0,y:180,angler:true});g.update();
 return {g,step(ms){at+=ms;g.update();},jump(){assert(g.beginCharge());this.step(distance(g.current,g.target)/MAX_JUMP*CHARGE_UP_MS);assert(g.release());}};
}
test('fish warns ahead and leaps high at the gap midpoint before submerging',()=>{
 const r=rig(),g=r.g;assert.equal(g.fish.phase,'warning');assert.equal(g.fish.x,0);assert.equal(g.fish.y,90);
 r.step(FISH_WARNING_MS+FISH_LEAP_MS/2);assert.equal(g.fish.phase,'leaping');assert(g.fish.lift>=150);assert.equal(g.state,'idle');
 r.step(FISH_LEAP_MS/2+1);assert.equal(g.fish.phase,'submerged');assert.equal(g.state,'idle');
});
test('midair collision eats the animal before landing and awards no landing score',()=>{
 const r=rig(),g=r.g;r.step(1000);r.jump();r.step(g.jump.duration);
 assert.equal(g.state,'drowning');assert.equal(g.score,0);assert.equal(g.fall.reason,'angler');assert(g.fall.airborne);assert(g.fall.lift>80);assert(g.fall.at<g.jump.at+g.jump.duration);
 r.step(DROWN_MS);assert.equal(g.state,'over');assert.equal(g.drainEvents().filter(e=>e.type==='over').length,1);
});
test('swept collision still catches the fish when one delayed frame spans the whole jump',()=>{
 const fine=rig(),coarse=rig();for(const r of [fine,coarse]){r.step(1000);r.jump();}
 for(let i=0;i<100;i++)fine.step(8);coarse.step(800);
 assert.equal(fine.g.fall.reason,'angler');assert.equal(coarse.g.fall.reason,'angler');assert(Math.abs(fine.g.fall.at-coarse.g.fall.at)<10);
});
test('hopping during the warning or after the fish dives passes safely',()=>{
 for(const delay of [0,FISH_WARNING_MS+FISH_LEAP_MS+1]){const r=rig();r.step(delay);r.jump();r.step(r.g.jump.duration);assert.equal(r.g.state,'idle');assert.equal(r.g.score,1);assert.equal(r.g.fish,null);}
});
test('pausing freezes both the advance warning and an airborne fish',()=>{
 const r=rig(),g=r.g;r.step(400);g.pause();const warning=g.fish;r.step(60000);assert.deepEqual(g.fish,warning);g.resume();r.step(1000);g.pause();const leap=g.fish;r.step(60000);assert.deepEqual(g.fish,leap);g.resume();assert.equal(g.fish.phase,'leaping');
});
test('moving fish cannot eat an animal standing on a pad or on a different flight path',()=>{
 const r=rig();for(let i=0;i<20;i++)r.step(500);assert.equal(r.g.state,'idle');
 const other=rig();other.step(1000);other.jump();const hazard={...other.g.fishHazard,x:2000};assert.equal(fishPose(hazard,1650).phase,'leaping');other.g.fishHazard=hazard;other.step(other.g.jump.duration);assert.equal(other.g.score,1);
});
test('Mochi star courage blocks exactly one fish and expires after the next hop',()=>{
 const r=rig('mochi'),g=r.g;g.useSkill();assert(g.fishShield);r.step(1000);r.jump();assert.equal(g.fishShield,false);assert(g.jump.shield);r.step(g.jump.duration);assert.equal(g.score,1);assert.equal(g.jump.shield,false);assert.equal(g.skillCharges,0);assert.equal(g.drainEvents().filter(e=>e.type==='fish-blocked').length,1);
 const safe=rig('mochi');safe.g.useSkill();safe.jump();safe.step(safe.g.jump.duration);assert.equal(safe.g.fishShield,false);assert.equal(safe.g.skillCharges,0);
});
test('Otter and stabilizing skills clear the approaching fish immediately',()=>{
 for(const id of ['otter','penguin','monkey','panda','fox','capybara']){const r=rig(id);assert(r.g.fish);r.g.useSkill();assert.equal(r.g.fish,null);assert.equal(r.g.target.angler,false);}
});
test('new prices and the original starmouse survive purchase and wallet reload',()=>{
 assert.equal(animal('fox').price,960);assert.equal(animal('capybara').price,1000);assert.equal(animal('mochi').price,1080);
 const p=readProfile(JSON.stringify(buyAnimal({...freshProfile('河岸朋友'),coins:1080},'mochi')));assert.equal(p.coins,0);assert.equal(p.selected,'mochi');assert(p.owned.includes('mochi'));
});
