import test from 'node:test';
import assert from 'node:assert/strict';
import {RoachGame,SPRAY_DELAY,DURATIONS} from '../src/game.js';
const area={x:.5,y:.5,radiusX:.12,radiusY:.12};
function setup(){let now=0;const game=new RoachGame({random:()=>.2,now:()=>now});game.start();game.entities.clear();return {game,set:t=>{now=t;}};}
function mouse(game,x=.5,y=.5){const e=game.spawnMouse();Object.assign(e,{x,y,heading:Math.PI/2,desired:Math.PI/2,turnAt:Infinity});return e;}
test('only two- and three-minute rounds are playable',()=>{
  assert.deepEqual(DURATIONS,[120,180]);assert.equal(new RoachGame().remaining,120000);
  assert.equal(new RoachGame({duration:180}).remaining,180000);assert.throws(()=>new RoachGame({duration:60}));
});
test('three independent sprays all release, with no duplicate points for overlapping clouds',()=>{
  const {game,set}=setup(),a=game.spawnRoach(0),b=game.spawnRoach(0);Object.assign(a,{x:.2,y:.5});Object.assign(b,{x:.8,y:.5});
  for(const x of [.2,.8,.2])assert.ok(game.useSpray({...area,x}));assert.equal(game.spraysLeft,0);assert.equal(game.sprayClouds.length,3);assert.equal(game.useSpray(area),null);
  set(SPRAY_DELAY);const events=game.advance(new Set([a.id,b.id]));assert.equal(events.sprayed.length,2);assert.equal(game.score,2);assert.ok(game.sprayClouds.every(c=>c.applied));
  set(SPRAY_DELAY+50);assert.equal(game.advance().sprayed.length,0);assert.equal(game.score,2);
});
test('three traps can be placed, invalid drops cost nothing, and replay restores both inventories',()=>{
  const {game}=setup();assert.equal(game.placeTrap({...area,x:-1}),null);assert.equal(game.trapsLeft,3);
  for(const x of [.2,.5,.8])assert.ok(game.placeTrap({...area,x}));assert.equal(game.trapsLeft,0);assert.equal(game.traps.size,3);assert.equal(game.placeTrap(area),null);
  game.useSpray(area);game.start();assert.equal(game.trapsLeft,3);assert.equal(game.spraysLeft,3);assert.equal(game.traps.size,0);assert.equal(game.sprayClouds.length,0);
});
test('a trap ignores roaches and ants, catches exactly one mouse for five points and then disappears',()=>{
  const {game,set}=setup(),trap=game.placeTrap(area),roach=game.spawnRoach(0),ant=game.spawnAnt();Object.assign(roach,{x:.5,y:.5});Object.assign(ant,{x:.5,y:.5});
  const frozen=new Set([roach.id,ant.id]);set(16);assert.equal(game.advance(frozen).trapped.length,0);assert.equal(trap.armed,true);
  const first=mouse(game);set(32);const events=game.advance(frozen);assert.equal(events.trapped.length,1);assert.equal(events.trapped[0].trapId,trap.id);assert.equal(game.score,5);assert.equal(game.stats.trapped,1);assert.equal(trap.armed,false);assert.equal(game.traps.has(trap.id),false);
  assert.equal(game.entities.has(first.id),false);assert.equal(game.catchMouse(first.id,1000,true),null);assert.equal(game.entities.has(roach.id),true);assert.equal(game.entities.has(ant.id),true);assert.equal(game.stats.antsHit,0);
  const next=mouse(game);set(48);assert.equal(game.advance(frozen).trapped.length,0);assert.equal(game.entities.has(next.id),true);assert.equal(game.score,5);
});
test('fast mice crossing a small trap are caught even when both frame endpoints lie outside it',()=>{
  const {game,set}=setup(),m=mouse(game,.45,.5);game.placeTrap({...area,x:.458,radiusX:.002,radiusY:.02});set(50);
  const events=game.advance();assert.equal(events.trapped.length,1);assert.equal(events.trapped[0].id,m.id);assert.equal(game.score,5);
});
test('overlapping traps cannot award twice for one mouse, and a held mouse is not caught at its stale floor position',()=>{
  const {game,set}=setup(),m=mouse(game),first=game.placeTrap(area),second=game.placeTrap(area);
  set(16);assert.equal(game.advance(new Set([m.id])).trapped.length,0);assert.equal(first.armed,true);
  set(32);assert.equal(game.advance().trapped.length,1);assert.equal(game.score,5);assert.equal(first.armed,false);assert.equal(game.traps.has(first.id),false);assert.equal(second.armed,true);
  const another=mouse(game);set(48);assert.equal(game.advance().trapped[0].id,another.id);assert.equal(game.score,10);assert.equal(game.traps.size,0);
});
test('trap capture and placement never score after the absolute deadline',()=>{
  const {game,set}=setup();mouse(game);set(119999);game.placeTrap(area);set(120000);const events=game.advance();assert.equal(events.finished,true);assert.equal(events.trapped.length,0);assert.equal(game.score,0);
  game.start();set(240000);assert.equal(game.placeTrap(area),null);assert.equal(game.trapsLeft,3);
});
