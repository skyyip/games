import test from 'node:test';
import assert from 'node:assert/strict';
import {RoachGame,HOLES,ANT_MIN_LIFETIME,ANT_MAX_LIFETIME,ANT_DEPARTURE_GAP,MAX_ANTS,distanceToSegment,antFlick} from '../src/game.js';
const setup=(duration=60)=>{let now=0;const game=new RoachGame({duration,random:()=>.2,now:()=>now});return {game,set:value=>{now=value;}};};
test('both durations start idle, then open all four holes with ground roaches and enforce an absolute deadline',()=>{
 for(const duration of [60,120]){
  const {game,set}=setup(duration);set(9000);assert.equal(game.remaining,duration*1000);game.start();
  assert.equal(game.entities.size,4);assert.deepEqual([...game.entities.values()].map(e=>e.hole),[0,1,2,3]);
  assert.ok([...game.entities.values()].every(e=>e.mode==='ground'&&e.x===HOLES[e.hole].x&&e.y===HOLES[e.hole].y));
  set(9000+duration*1000-1);assert.equal(game.active(),true);set(9000+duration*1000);assert.equal(game.expire(),true);assert.equal(game.remaining,0);
  assert.equal(game.tap(0),null);assert.equal(game.swipe(0,80),null);assert.equal(game.catchMouse(0,1000,true),null);assert.equal(game.score,0);
 }
 assert.throws(()=>new RoachGame({duration:30}),RangeError);
});
test('ground taps, size-specific flying swipes and mouse captures award exactly 1/2/3/4/5 once each',()=>{
 const {game,set}=setup();game.start();game.entities.clear();
 const small=game.spawnRoach(0),big=game.spawnRoach(1),flying=game.spawnRoach(2),smallFlying=game.spawnRoach(3),mouse=game.spawnMouse();
 big.size='big';flying.size='big';flying.mode=smallFlying.mode='flying';
 assert.equal(game.tap(small.id).points,1);assert.equal(game.tap(small.id),null);
 assert.equal(game.tap(big.id).kind,'primed');assert.equal(game.score,1);set(350);assert.equal(game.tap(big.id).points,2);
 assert.equal(game.tap(flying.id),null);assert.equal(game.swipe(flying.id,27),null);assert.equal(game.swipe(flying.id,28).points,4);assert.equal(game.swipe(flying.id,100),null);
 assert.equal(game.swipe(smallFlying.id,28).points,3);
 assert.equal(game.tap(mouse.id),null);assert.equal(game.catchMouse(mouse.id,499,true),null);assert.equal(game.catchMouse(mouse.id,500,false),null);
 assert.equal(game.catchMouse(mouse.id,500,true).points,5);assert.equal(game.catchMouse(mouse.id,1000,true),null);
 assert.equal(game.score,15);assert.deepEqual(game.stats,{small:1,big:1,flying:2,mice:1,antsHit:0,antsFlicked:0});assert.equal(game.entities.size,0);
});
test('big roaches require two taps on the same creature within 350ms; expired taps start a fresh pair',()=>{
 const {game,set}=setup();game.start();const [a,b]=[...game.entities.values()];a.size=b.size='big';
 assert.equal(game.tap(a.id).kind,'primed');assert.equal(game.tap(b.id).kind,'primed');assert.equal(game.score,0);
 set(351);assert.equal(game.tap(a.id).kind,'primed');assert.equal(game.entities.has(a.id),true);set(701);assert.equal(game.tap(a.id).points,2);
 assert.equal(game.entities.has(b.id),true);assert.equal(game.swipe(b.id,90),null);
});
test('roaches take off and land repeatedly; held creatures stay in their current position and state',()=>{
 const {game,set}=setup();game.start();game.entities.clear();const roach=game.spawnRoach(0),mouse=game.spawnMouse();
 const origin={x:roach.x,y:roach.y,phase:roach.phase};set(3400);game.advance(new Set([roach.id]));
 assert.equal(roach.mode,'ground');assert.deepEqual({x:roach.x,y:roach.y,phase:roach.phase},origin);
 set(3450);game.advance();assert.equal(roach.mode,'flying');assert.ok(roach.flight>0);
 set(10000);game.advance();assert.equal(roach.mode,'ground');set(17000);game.advance();assert.equal(roach.mode,'flying');assert.equal(mouse.mode,'ground');
});
test('continuous spawns originate from the four holes, remain bounded, and avoid background catch-up bursts',()=>{
 const {game,set}=setup();game.start();
 const exits=[];for(let time=1000;time<=4000;time+=1000){set(time);exits.push(game.advance().spawned.find(e=>e.type==='roach').hole);}
 assert.deepEqual(exits,[0,1,2,3]);
 set(40000);let events=game.advance();assert.equal(events.spawned.filter(e=>e.type==='roach').length,1);
 assert.equal(events.spawned.filter(e=>e.type==='mouse').length,1);
 for(let now=41000;now<59000;now+=750){set(now);events=game.advance();for(const entity of events.spawned){assert.equal(entity.mode,'ground');assert.ok([0,1,2,3].includes(entity.hole));}}
 assert.ok([...game.entities.values()].filter(e=>e.type==='roach').length<=24);assert.ok([...game.entities.values()].filter(e=>e.type==='mouse').length<=2);
 assert.ok([...game.entities.values()].every(e=>e.x>=.055&&e.x<=.945&&e.y>=.065&&e.y<=.935));
});
test('mouse holes are shuffled bags: each corner appears once before the cycle repeats',()=>{
 const {game}=setup();game.start();
 for(let round=0;round<3;round++)assert.deepEqual(Array.from({length:4},()=>game.spawnMouse().hole).sort(),[0,1,2,3]);
});
test('mice run faster than ground roaches, held movement pauses, and failed drops stay inside the room',()=>{
 const {game,set}=setup();game.start();game.entities.clear();const roach=game.spawnRoach(0),mouse=game.spawnMouse();
 roach.x=mouse.x=.3;roach.y=mouse.y=.5;roach.heading=mouse.heading=roach.desired=mouse.desired=Math.PI/2;
 const startX=.3;for(let i=1;i<=6;i++){set(i*50);game.advance();}
 assert.ok(mouse.x-startX>(roach.x-startX)*2);
 const position={x:mouse.x,y:mouse.y};set(350);game.advance(new Set([mouse.id]));assert.deepEqual({x:mouse.x,y:mouse.y},position);
 game.dropMouse(mouse.id,-20,30);assert.equal(mouse.x,.055);assert.equal(mouse.y,.935);
});
test('round reset clears scores, pending taps and population; stale scoring after the deadline is rejected',()=>{
 const {game,set}=setup();game.start();const roach=[...game.entities.values()][0];roach.size='big';game.tap(roach.id);set(60000);
 assert.equal(game.tap(roach.id),null);assert.equal(game.state,'finished');game.reset(120);assert.equal(game.score,0);assert.equal(game.entities.size,0);assert.equal(game.remaining,120000);
 game.start();assert.equal(game.state,'playing');assert.equal(game.score,0);assert.equal(game.entities.size,4);assert.ok([...game.entities.values()].every(e=>e.lastTap===null));
});
test('swipe geometry recognises a crossed target and rejects a near miss, including stationary samples',()=>{
 assert.equal(distanceToSegment({x:50,y:10},{x:0,y:0},{x:100,y:0}),10);
 assert.equal(distanceToSegment({x:150,y:0},{x:0,y:0},{x:100,y:0}),50);
 assert.equal(distanceToSegment({x:3,y:4},{x:0,y:0},{x:0,y:0}),5);
});

test('layout geometry keeps edge spawns and dropped mice aligned to the visible corner holes',()=>{
 const {game,set}=setup(),holes=[{x:.025,y:.02},{x:.025,y:.98},{x:.975,y:.98},{x:.975,y:.02}];
 game.setGeometry(holes);game.start();assert.deepEqual([...game.entities.values()].map(e=>({x:e.x,y:e.y})),holes);
 set(16);game.advance();
 assert.ok([...game.entities.values()].every((e,i)=>Math.hypot(e.x-holes[i].x,e.y-holes[i].y)<.01),'the first step must not jump to the old wall margin');
 const mouse=game.spawnMouse();game.dropMouse(mouse.id,-1,2);assert.equal(mouse.x,.025);assert.equal(mouse.y,.98);
 game.reset();game.start();assert.deepEqual([...game.entities.values()].map(e=>({x:e.x,y:e.y})),holes);
});

test('mouse movement is slower while remaining quicker than a ground roach',()=>{
 const {game,set}=setup();game.start();game.entities.clear();const mouse=game.spawnMouse();
 mouse.x=.25;mouse.y=.5;mouse.heading=mouse.desired=Math.PI/2;mouse.turnAt=Infinity;const phase=mouse.phase;
 for(let i=1;i<=10;i++){set(i*50);game.advance();}
 assert.ok(mouse.x-.25>=.15&&mouse.x-.25<=.17);assert.ok(mouse.phase-phase<=8);
});

test('ants arrive individually after random gaps and depart on their own deadline even while held',()=>{
 const {game,set}=setup(120);game.start();set(11999);assert.equal(game.advance().spawned.some(e=>e.type==='ant'),false);
 set(18000);const ants=game.advance().spawned.filter(e=>e.type==='ant');assert.equal(ants.length,1);const ant=ants[0];
 assert.equal(ant.mode,'ground');assert.ok([0,1,2,3].includes(ant.hole));
 const next=game.nextAnt;assert.ok(next-18000>=2000&&next-18000<=8000);
 assert.ok(ant.expiresAt-18000>=ANT_MIN_LIFETIME&&ant.expiresAt-18000<=ANT_MAX_LIFETIME);
 set(next-1);assert.equal(game.advance().spawned.some(e=>e.type==='ant'),false);
 set(next);assert.equal(game.advance().spawned.filter(e=>e.type==='ant').length,1);
 set(ant.expiresAt-1);game.advance(new Set([ant.id]));assert.equal(game.entities.has(ant.id),true);
 set(ant.expiresAt);game.advance(new Set([ant.id]));assert.equal(game.entities.has(ant.id),false);assert.equal(game.score,0);
});
test('an accidental ant tap deducts one point exactly once, including below zero',()=>{
 const {game}=setup();game.start();const ant=game.spawnAnt();assert.equal(game.tap(ant.id).points,-1);
 assert.equal(game.score,-1);assert.equal(game.stats.antsHit,1);assert.equal(game.tap(ant.id),null);assert.equal(game.score,-1);
 const roach=game.spawnRoach(0);assert.equal(game.tap(roach.id).points,1);assert.equal(game.score,0);
});
test('only a fast ant flick removes it safely; expired, cancelled or late attempts cannot score',()=>{
 const {game,set}=setup();game.start();const ant=game.spawnAnt();
 assert.equal(game.swipe(ant.id,80),null);assert.equal(game.catchMouse(ant.id,1000,true),null);
 assert.equal(game.flickAnt(ant.id,27,1),null);assert.equal(game.flickAnt(ant.id,80,.1),null);
 assert.equal(game.flickAnt(ant.id,80,.5).points,0);assert.equal(game.score,0);assert.equal(game.stats.antsFlicked,1);assert.equal(game.flickAnt(ant.id,80,.5),null);
 const expired=game.spawnAnt();set(expired.expiresAt);assert.equal(game.tap(expired.id),null);assert.equal(game.flickAnt(expired.id,80,1),null);
 const late=game.spawnAnt();set(60000);assert.equal(game.tap(late.id),null);assert.equal(game.flickAnt(late.id,80,1),null);assert.equal(game.score,0);
});
test('flick detection accepts a fresh quick tail and rejects slow drags or a pause before release',()=>{
 const points=[{x:10,y:20,t:0},{x:40,y:20,t:60}];
 assert.ok(antFlick(points,{x:70,y:20,t:100}));assert.equal(antFlick(points,{x:40,y:20,t:250}),null);
 assert.equal(antFlick([{x:0,y:0,t:0},{x:10,y:0,t:100}],{x:15,y:0,t:140}),null);
});

test('individually spawned ants never exceed five and their departures are separated',()=>{
 const {game}=setup(120);game.start();const ants=Array.from({length:MAX_ANTS},()=>game.spawnAnt());
 assert.ok(ants.every(Boolean));assert.equal(game.spawnAnt(),null);
 const departures=ants.map(e=>e.expiresAt).sort((a,b)=>a-b);
 assert.ok(departures.every(t=>t>=ANT_MIN_LIFETIME&&t<=ANT_MAX_LIFETIME));
 assert.ok(departures.slice(1).every((t,i)=>t-departures[i]>=ANT_DEPARTURE_GAP));
 game.nextAnt=0;assert.equal(game.advance().spawned.filter(e=>e.type==='ant').length,0);
 game.entities.delete(ants[0].id);game.nextAnt=0;assert.equal(game.advance().spawned.filter(e=>e.type==='ant').length,1);
 assert.equal([...game.entities.values()].filter(e=>e.type==='ant').length,MAX_ANTS);
});

test('ant timing varies across random draws and background return never creates a synchronized swarm',()=>{
 const {game,set}=setup(120);let draw=.05;game.random=()=>draw;game.start();const early=game.nextAnt;
 draw=.95;game.start();assert.ok(game.nextAnt>early);
 const born=game.nextAnt;set(born);draw=.1;const first=game.advance().spawned.find(e=>e.type==='ant'),shortGap=game.nextAnt-born;
 set(game.nextAnt);draw=.9;const second=game.advance().spawned.find(e=>e.type==='ant');
 assert.ok(game.nextAnt-(born+shortGap)>shortGap);assert.ok(second.expiresAt-(born+shortGap)>first.expiresAt-born);
 assert.ok(Math.abs(first.expiresAt-second.expiresAt)>=ANT_DEPARTURE_GAP);
 set(90000);assert.equal(game.advance().spawned.filter(e=>e.type==='ant').length,1);
 assert.equal([...game.entities.values()].filter(e=>e.type==='ant').length,1);
});
