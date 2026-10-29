import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,advance,feet,hitNPC,wetDiner,pause,resume,shout,attackOrigin} from '../src/game.js';
import {shiftGoals,shiftBonus,shiftRank} from '../src/shift.js';import {fresh,reward,settle,load,KEY} from '../src/progress.js';
function run(g,s){for(let left=s;left>1e-8;left-=1/60)advance(g,Math.min(left,1/60));}
function attack(g,kind='left'){g.attack={kind,approach:'east',start:g.time,impact:g.time+.5,end:g.time+.7,hit:false};g.nextAttack=Infinity;}
test('gold guests begin after seven seconds, award once and rotate with an expiry',()=>{
 const g=createGame({events:false},()=>.1);run(g,7.1);const gold=g.spotlight;assert(gold);const before=g.score;assert(hitNPC(g,gold.npc));assert.equal(g.spotlightPokes,1);assert(g.score-before>=100);assert(gold.claimed);run(g,1.5);hitNPC(g,gold.npc);assert.equal(g.spotlightPokes,1);run(g,9);assert.notEqual(g.spotlight.npc,gold.npc);
});
test('an expired gold guest has ordinary scoring and cannot earn its spotlight reward',()=>{
 const g=createGame({events:false});g.spotlight={npc:g.npcs[0],until:0,claimed:false};hitNPC(g,g.npcs[0]);assert.equal(g.spotlightPokes,0);assert.equal(g.score,25);
});
test('shout timing, guest windows and attacks freeze while paused',()=>{
 const g=createGame({events:false});run(g,7.2);shout(g);pause(g);const until=g.spotlight.until,time=g.time;run(g,20);assert.equal(g.time,time);assert.equal(g.spotlight.until,until);resume(g);run(g,.1);assert(g.time>time);
});
test('the first four diner attacks visit all four distinct sides, with readable advance warnings',()=>{
 const g=createGame({mode:'diner',events:false,duration:90},()=>.2),sides=new Set();let count=-1;
 for(let i=0;i<1600&&sides.size<4;i++){if(g.attackCount!==count&&g.attack){count=g.attackCount;sides.add(g.attack.approach);assert(g.attack.impact-g.attack.start>=.8);const p=attackOrigin(g.attack);assert(p.x>=0&&p.x<=600&&p.y>=0&&p.y<=700);}feet(g,0,'left',true);if(g.diners[0].stamina>70)feet(g,0,'left',false);advance(g,1/60);}
 assert.equal(sides.size,4);
});
test('a held key does not reset timing to fake a last-second dodge',()=>{
 const g=createGame({mode:'diner',events:false});attack(g);feet(g,0,'left',true);run(g,.3);feet(g,0,'left',true);run(g,.5);assert.equal(g.diners[0].dodges,1);assert.equal(g.perfectDodges,0);assert.equal(g.score,35);
});
test('a late lift earns a precise dodge only after surviving the entire attack',()=>{
 const g=createGame({mode:'diner',events:false});attack(g);run(g,.3);feet(g,0,'left',true);run(g,.5);assert.equal(g.perfectDodges,1);assert.equal(g.score,70);assert(g.diners[0].stamina<2);
 const b=createGame({mode:'diner',events:false});attack(b);run(b,.3);feet(b,0,'left',true);run(b,.24);feet(b,0,'left',false);run(b,.25);assert.equal(b.perfectDodges,0);assert.equal(b.diners[0].wet,1);
});
test('three consecutive clean dodges grant one shield; a shield saves once and breaks the streak',()=>{
 const g=createGame({mode:'diner',events:false});g.nextAttack=Infinity;
 for(let i=0;i<3;i++){attack(g);feet(g,0,'left',true);run(g,.8);feet(g,0,'left',false);run(g,.8);}
 assert.equal(g.dodgeStreak,3);assert(g.diners[0].shield);assert.equal(wetDiner(g,g.diners[0],300,400),false);assert.equal(g.diners[0].wet,0);assert.equal(g.shieldSaves,1);assert.equal(g.dodgeStreak,0);assert(!g.diners[0].shield);run(g,1.4);wetDiner(g,g.diners[0],300,400);assert.equal(g.diners[0].wet,1);
});
test('goals are optional, bounded for display, and bonus tips pay only at settlement',()=>{
 const g=createGame({events:false}),p=fresh();g.pokes=100;g.perfects=3;g.spotlightPokes=2;assert.equal(shiftGoals(g).length,3);assert.equal(shiftBonus(g),45);assert.equal(shiftRank(g),3);assert.equal(settle(p,g),p);g.status='finished';assert.equal(settle(p,g).coins,reward(g));
 const diner=createGame({mode:'diner',events:false});diner.diners[0].dodges=6;diner.perfectDodges=3;diner.food=diner.drink=100;assert.equal(shiftBonus(diner),47);
});
test('the independent edition never reads or rewrites the original mop-game save',()=>{
 const data=new Map([['playground.cha-chaan-mop.v1',JSON.stringify({...fresh(),coins:999})]]),seen=[];const storage={getItem:k=>{seen.push(k);return data.get(k);}};assert.equal(load(storage).coins,0);assert.deepEqual(seen,[KEY]);assert.notEqual(KEY,'playground.cha-chaan-mop.v1');assert(data.has('playground.cha-chaan-mop.v1'));
});
