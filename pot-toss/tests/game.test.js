import test from 'node:test';
import assert from 'node:assert/strict';
import {PotGame,DURATIONS,STILL_TIME,makePath,potAt,throwVelocity,flightAt,descendingTime,gestureThrow,keyboardPower,readRecords,addRecord,topThree,RIM_HEIGHT,POT_DEPTH,potDepthAt,VERTICAL_START} from '../src/game.js';
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} ≈ ${b}`);
const centre={power:.46,heading:0};
function setup(){let time=0;const game=new PotGame({random:()=>.3,now:()=>time});game.start();return {game,set:t=>{time=t;},advance:t=>{time=t;return game.advance();}};}
test('only two- and three-minute rounds are valid and reset starts in setup',()=>{
  assert.deepEqual(DURATIONS,[120,180]);const g=new PotGame({now:()=>0});assert.equal(g.state,'idle');assert.equal(g.remaining,120);assert.throws(()=>g.start(60));g.start(180);assert.equal(g.duration,180);assert.equal(g.remaining,180);
});
test('the pot stays centred for twelve seconds and its random movement is bounded, continuous and slow',()=>{
  let seed=42;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},path=makePath(180,random);
  for(let t=0;t<=STILL_TIME;t+=.1)close(potAt(path,t),0);
  let previous=potAt(path,STILL_TIME);for(let t=STILL_TIME+.01;t<=180;t+=.01){const x=potAt(path,t);assert.ok(Math.abs(x)<=1.65);assert.ok(Math.abs(x-previous)/.01<.45);previous=x;}
  for(const p of path.slice(1,-1)){close(potAt(path,p.at),p.x);assert.ok(Math.abs(potAt(path,p.at+.0001)-potAt(path,p.at-.0001))<.00001);}
  assert.ok(path.some(p=>p.x<-.3)&&path.some(p=>p.x>.3));
});
test('real ballistic motion rises, slows vertically, turns downward and crosses the opening plane only on descent',()=>{
  const v=throwVelocity(centre),t=descendingTime(v.vy),p=flightAt(v,t);close(p.h,RIM_HEIGHT);close(p.z,POT_DEPTH,.01);assert.ok(p.vh<0);const apex=flightAt(v,v.vy/9.81);close(apex.vh,0);assert.ok(apex.h>RIM_HEIGHT);assert.ok(flightAt(v,.1).vh>0);
  assert.ok(throwVelocity({power:.8}).vz>v.vz);assert.throws(()=>throwVelocity({power:NaN}));
});
test('a shuffled four-arrow bag supplies both kinds fairly without changing their physics',()=>{
  const {game,advance,set}=setup(),types=[];for(let i=0;i<4;i++){set(i*2200);game.advance();types.push(game.nextType);const f=game.launch(centre);assert.ok(f);assert.deepEqual({vx:f.vx,vz:f.vz,vy:f.vy},throwVelocity(centre));advance(i*2200+1800);}
  assert.equal(types.filter(t=>t==='normal').length,2);assert.equal(types.filter(t=>t==='color').length,2);assert.equal(game.score,6);assert.equal(game.stats.normal,2);assert.equal(game.stats.color,2);assert.equal(game.landed.length,4);
});
test('one arrow can be in flight at a time and repeated frames cannot award twice',()=>{
  const {game,advance}=setup();const type=game.nextType;assert.ok(game.launch(centre));assert.equal(game.launch(centre),null);assert.equal(game.stats.shots,1);const events=advance(1700);assert.equal(events.length,1);assert.equal(events[0].kind,'hit');assert.equal(game.score,type==='color'?2:1);advance(2000);advance(2100);assert.equal(game.stats.normal+game.stats.color,1);assert.equal(game.ready,true);
});
test('too short, too far and both lateral misses earn no points and prepare the next arrow',()=>{
  for(const options of [{power:0,heading:0},{power:1,heading:0},{power:.46,heading:-.3},{power:.46,heading:.3}]){
    const {game,advance}=setup();game.launch(options);const event=advance(3500)[0];assert.notEqual(event.kind,'hit');assert.equal(game.score,0);assert.equal(game.stats.misses,1);assert.equal(game.flight,null);assert.equal(game.ready,true);
  }
});
test('rim and chamber-pot wall collisions bounce off instead of granting a score',()=>{
  for(const options of [{power:.46,heading:.08},{power:.35,heading:0}]){const {game,advance}=setup();game.launch(options);const [hit]=advance(2500);assert.equal(hit.kind,'rim');assert.equal(hit.points,0);assert.equal(game.score,0);}
});
function targetThrow(game,started){
  let power=.46,heading=0;
  for(let iteration=0;iteration<12;iteration++){
    const v=throwVelocity({power,heading}),t=descendingTime(v.vy),x=potAt(game.path,started+t),depth=potDepthAt(game.path,started+t);heading=Math.atan2(x,depth);const wanted=Math.hypot(x,depth);let lo=0,hi=1;
    for(let i=0;i<35;i++){const p=(lo+hi)/2,vv=throwVelocity({power:p,heading:0}),end=flightAt(vv,descendingTime(vv.vy));if(end.z<wanted)lo=p;else hi=p;}power=(lo+hi)/2;
  }return {power,heading};
}
test('a moving pot is checked at the exact impact time, not at release or the next rendered frame',()=>{
  const {game,set,advance}=setup();game.path=[{at:0,x:0},{at:12,x:0},{at:18,x:1.65},{at:30,x:-1.65},{at:200,x:0}];set(14000);game.advance();const launchX=game.potX,options=targetThrow(game,14);game.launch(options);const [event]=advance(17500);assert.equal(event.kind,'hit');assert.ok(event.potX>launchX+.35);close(event.potX,potAt(game.path,event.at));
});
test('a coarse frame jump and many fine frames resolve the same moving-target shot',()=>{
  const a=setup(),b=setup();for(const g of [a.game,b.game])g.path=[{at:0,x:0},{at:12,x:0},{at:18,x:1.65},{at:200,x:0}];a.set(14000);b.set(14000);a.game.advance();b.game.advance();const options=targetThrow(a.game,14);a.game.launch(options);b.game.launch(options);const first=a.advance(17000)[0];let second;
  for(let t=14008;t<=17000;t+=8){const e=b.advance(t);if(e.length)second=e[0];}assert.equal(first.kind,second.kind);close(first.at,second.at);close(first.x,second.x);assert.equal(a.game.score,b.game.score);
});
test('an impact before the buzzer scores, a later impact cannot, and completion emits once',()=>{
  for(const [at,expected] of [[118000,1],[119500,0]]){const {game,set,advance}=setup();game.path=[{at:0,x:0},{at:200,x:0}];game.nextType='normal';set(at);game.advance();game.launch(centre);const events=advance(122000);assert.equal(game.score,expected);assert.equal(game.state,'finished');assert.equal(events.filter(e=>e.kind==='finished').length,1);assert.equal(game.launch(centre),null);assert.deepEqual(advance(123000),[]);}
});
test('the three-minute mode remains playable after two minutes, with an exact deadline',()=>{
  let now=0;const game=new PotGame({now:()=>now});game.start(180);now=120000;game.advance();assert.equal(game.state,'playing');assert.equal(game.remaining,60);now=180000;game.advance();assert.equal(game.state,'finished');assert.equal(game.remaining,0);
});
test('cancelled or malformed inputs do not consume an arrow and replay clears previous state',()=>{
  const {game,advance}=setup(),type=game.nextType;assert.equal(game.launch({power:NaN}),null);assert.equal(game.nextType,type);assert.equal(game.stats.shots,0);game.launch(centre);advance(2000);game.abandon();assert.deepEqual(advance(3000),[]);game.start();assert.equal(game.score,0);assert.equal(game.stats.shots,0);assert.equal(game.landed.length,0);assert.equal(game.impact,null);assert.equal(game.flight,null);
});
test('gesture speed controls distance and direction consistently across viewport sizes',()=>{
  const samples=[{x:0,y:160,t:0},{x:10,y:100,t:60},{x:20,y:40,t:140}],a=gestureThrow(samples,140,1),b=gestureThrow(samples.map(p=>({...p,x:p.x*.7,y:p.y*.7})),140,.7);assert.ok(a);assert.ok(a.heading>0);close(a.power,b.power);close(a.heading,b.heading);
  const faster=gestureThrow(samples.map(p=>({...p,t:p.t*.6})),84,1);assert.ok(faster.power>a.power);
});
test('taps, downward swipes, stale releases, slow drags and invalid samples never launch',()=>{
  for(const samples of [[{x:0,y:0,t:0}],[{x:0,y:10,t:0},{x:0,y:9,t:50}],[{x:0,y:0,t:0},{x:0,y:100,t:80}],[{x:0,y:100,t:0},{x:0,y:0,t:100},{x:0,y:0,t:400}],[{x:0,y:100,t:0},{x:0,y:70,t:1000}],[{x:0,y:100,t:0},{x:NaN,y:0,t:100}]])assert.equal(gestureThrow(samples,samples.at(-1).t,1),null);
  assert.equal(gestureThrow([{x:0,y:100,t:0},{x:0,y:0,t:100}],300,1),null);
});
test('keyboard charge rises and falls; a tap or excessively long hold is not a strong throw',()=>{close(keyboardPower(0),0);close(keyboardPower(575),.46);close(keyboardPower(1250),1);close(keyboardPower(1875),.5);close(keyboardPower(2500),0);close(keyboardPower(10000),0);});
test('each duration keeps its own top three, including zero scores and separate tied rounds',()=>{
  let records=readRecords(null);for(const [score,at] of [[0,5],[20,10],[30,15],[20,20],[9,30]])records=addRecord(records,120,score,at);records=addRecord(records,180,5,40);assert.deepEqual(records[120].map(r=>[r.score,r.at]),[[30,15],[20,10],[20,20]]);assert.equal(records[180][0].score,5);assert.deepEqual(readRecords(JSON.stringify({version:1,modes:records})),records);assert.equal(addRecord(readRecords(null),120,0,0)[120][0].score,0);
});
test('corrupt records and invalid dates cannot break result rendering',()=>{
  assert.deepEqual(topThree([null,{score:-1,at:0},{score:2.5,at:0},{score:2,at:NaN},{score:1,at:Number.MAX_SAFE_INTEGER},{score:3,at:1}]),[{score:3,at:1}]);for(const raw of ['bad','null','{}','{"version":2,"modes":{}}'])assert.deepEqual(readRecords(raw),{120:[],180:[]});assert.throws(()=>addRecord(readRecords(null),60,1,0));
});

test('the pot begins smooth vertical travel after twenty-four seconds and collisions use its future depth',()=>{
 const {game,set,advance}=setup();for(let t=0;t<=24;t+=.5)close(potDepthAt(game.path,t),POT_DEPTH);assert.ok(Math.abs(potDepthAt(game.path,42)-POT_DEPTH)>.5);
 game.path=[{at:0,x:0},{at:12,x:0},{at:200,x:0}];set(42000);game.advance();const options=targetThrow(game,42);game.launch(options);const hit=advance(45000)[0];assert.equal(hit.kind,'hit');close(hit.potDepth,potDepthAt(game.path,hit.at));assert.ok(Math.abs(hit.z-hit.potDepth)<.001);
});
