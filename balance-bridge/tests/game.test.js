import test from 'node:test';
import assert from 'node:assert/strict';
import {BalanceGame,EVENTS,FALL_ANGLE,FALL_DURATION,WARNING_TIME,TiltInput,screenTilt,formatTime,readRecords,rankRecords} from '../src/game.js';
const close=(a,b,epsilon=1e-6)=>assert.ok(Math.abs(a-b)<epsilon,`${a} ≈ ${b}`);
function advance(game,seconds,control=false){const events=[];for(let i=0;i<Math.round(seconds*120);i++){if(control)game.setInput(-game.angle*1.6-game.velocity*.85);events.push(...game.advance(1/120));}return events;}
test('all five hazards have the requested severities and exact durations',()=>{
  assert.deepEqual(EVENTS.map(e=>[e.id,e.level,e.duration]),[['wind',1,3],['bird',2,3],['thorns',3,4],['bridge',4,4],['roach',5,5]]);
  assert.ok(EVENTS.every(Object.isFrozen));
});
test('corrections act in their stated direction, and returning input to zero is smooth',()=>{
  const left=new BalanceGame({random:()=>.5}),right=new BalanceGame({random:()=>.5});left.start();right.start();left.setInput(-1);right.setInput(1);advance(left,.5);advance(right,.5);
  assert.ok(left.angle<0);assert.ok(right.angle>0);left.setInput(0);const before=left.input;left.advance(1/120);assert.ok(left.input>before&&left.input<0);
  right.setInput(Infinity);assert.equal(right.target,0);right.setInput(5);assert.equal(right.target,1);
});
test('fixed stepping keeps the same trajectory across display frame rates',()=>{
  const a=new BalanceGame({random:()=>.5}),b=new BalanceGame({random:()=>.5});a.start();b.start();a.setInput(.06);b.setInput(.06);
  for(let i=0;i<120;i++)a.advance(1/120);for(let i=0;i<30;i++)b.advance(1/30);
  close(a.elapsed,b.elapsed);close(a.angle,b.angle);close(a.velocity,b.velocity);
});
test('no input eventually falls, survival time freezes immediately and completion happens once',()=>{
  const g=new BalanceGame({random:()=>.7});g.start();const notices=[];while(g.state==='playing'&&g.elapsed<30)notices.push(...g.advance(1/60));
  assert.equal(g.state,'falling');assert.equal(notices.filter(n=>n==='fall').length,1);close(Math.abs(g.angle),FALL_ANGLE);const time=g.elapsed;
  const completed=advance(g,FALL_DURATION+.1);assert.equal(g.state,'finished');close(g.elapsed,time);assert.equal(completed.filter(n=>n==='finished').length,1);assert.deepEqual(advance(g,2),[]);
});
test('countersteering survives repeated hazards without automatic stabilisation',()=>{
  for(const random of [.4,.99]){const g=new BalanceGame({random:()=>random});g.start();const seen=new Set();for(let i=0;i<120*120;i++){g.setInput(-g.angle*1.6-g.velocity*.85);g.advance(1/120);if(g.event)seen.add(g.event.level);}assert.equal(g.state,'playing');assert.ok(g.eventCount>=8);close(g.elapsed,120);if(random===.99)assert.ok(seen.has(4)&&seen.has(5));}
});
test('warnings precede impacts and overlapping hazards expire independently',()=>{
  const g=new BalanceGame({random:()=>.1});g.start();advance(g,7.01,true);assert.equal(g.pending.id,'wind');const at=g.pending.startsAt;advance(g,WARNING_TIME,true);assert.equal(g.event.id,'wind');assert.ok(g.event.startedAt-at<1/120+.001);
  advance(g,2.8,true);assert.ok(g.events.length>=2);const wind=g.events.find(e=>e.id==='wind');assert.ok(wind);advance(g,.4,true);assert.ok(!g.events.some(e=>e.id==='wind'));assert.ok(g.events.length>=1);
  for(let i=0;i<80;i++){advance(g,.3,true);assert.ok(g.events.length<=3);assert.equal(new Set(g.events.map(e=>e.id)).size,g.events.length);}
});
test('ordinary event rolls leave breathing room instead of overlapping hazards',()=>{
  const g=new BalanceGame({random:()=>.5});g.start();let previousEnd=0,started=0;
  for(let i=0;i<120*60;i++){
    g.setInput(-g.angle*1.6-g.velocity*.85);const notices=g.advance(1/120);
    assert.ok(g.events.length<=1);
    if(notices.includes('event')){const event=g.event;if(started)assert.ok(event.startedAt>=previousEnd+WARNING_TIME+.8);previousEnd=event.startedAt+event.duration;started++;}
  }
  assert.equal(g.state,'playing');assert.ok(started>=6);
});
test('every random hazard can occur, no immediate repeats and stronger hazards cause larger perturbations',()=>{
  const chosen=new Set(),velocities=[];
  for(let i=0;i<5;i++){
    const g=new BalanceGame({random:()=>.5});g.start();g.eventCount=1;g.lastEvent=i===0?'roach':'wind';g.random=()=>i===0?0:(i-1)/4+.01;g.schedule();chosen.add(g.pending.id);
    const h=new BalanceGame({random:()=>.5});h.start();h.event={...EVENTS[i],direction:1,startedAt:0};advance(h,.2);velocities.push(h.velocity);
  }
  assert.deepEqual([...chosen].sort(),EVENTS.map(e=>e.id).sort());assert.ok(velocities.every((v,i)=>i===0||v>velocities[i-1]));
  const g=new BalanceGame({random:()=>.99});g.eventCount=1;g.lastEvent='roach';g.schedule();assert.notEqual(g.pending.id,'roach');
});
test('pause freezes hazards and scoring, and resume preserves the exact walk',()=>{
  const g=new BalanceGame({random:()=>.5});g.start();advance(g,9,true);assert.ok(g.event);assert.equal(g.pause(),true);const snapshot=JSON.stringify(g);advance(g,100);assert.equal(JSON.stringify(g),snapshot);assert.equal(g.pause(),false);assert.equal(g.resume(),true);advance(g,.5,true);close(g.elapsed,9.5);assert.equal(g.resume(),false);
});
test('reset and abandonment remove all old input, events and fall state',()=>{
  const g=new BalanceGame();g.start();g.event={...EVENTS[4],startedAt:0};g.setInput(1);g.abandon();assert.equal(g.state,'idle');assert.equal(g.event,null);assert.deepEqual(advance(g,2),[]);g.start();assert.equal(g.elapsed,0);assert.equal(g.eventCount,0);assert.equal(g.target,0);assert.equal(g.fallElapsed,0);
});
test('invalid or long suspended frames cannot create unbounded survival time',()=>{
  const g=new BalanceGame();g.start();for(const dt of [NaN,Infinity,-1,0])g.advance(dt);assert.equal(g.elapsed,0);g.advance(60);close(g.elapsed,.25);
});
test('screen tilt projects portrait and both landscape directions, rejecting missing data',()=>{
  close(screenTilt({beta:0,gamma:18},0),18);close(screenTilt({beta:0,gamma:18},180),-18);close(screenTilt({beta:18,gamma:0},90),18);close(screenTilt({beta:18,gamma:0},270),-18);
  assert.equal(screenTilt({beta:null,gamma:3}),null);assert.equal(screenTilt({beta:NaN,gamma:1}),null);assert.equal(screenTilt({beta:1,gamma:undefined}),null);
});
test('sensor calibration uses eight valid samples and a median, with dead zone and bounded controls',()=>{
  const t=new TiltInput();assert.equal(t.sample({beta:null,gamma:null},0,0),false);
  [10,10,10,70,10,10,10,10].forEach((gamma,i)=>t.sample({beta:0,gamma},0,i*30));assert.equal(t.ready,true);close(t.baseline,10);t.sample({beta:0,gamma:10.5},0,300);close(t.value,0);t.sample({beta:0,gamma:19.2},0,330);close(t.value,.5);t.sample({beta:0,gamma:-40},0,400);close(t.value,-1);close(t.baseline,10);assert.equal(t.fresh(1000),true);assert.equal(t.fresh(4000),false);
});
test('top three rank by survival duration, preserve ties, reject malformed data and round-trip storage',()=>{
  const records=rankRecords([{seconds:2,at:10,mode:'touch'},{seconds:12,at:20,mode:'motion'},{seconds:12,at:5,mode:'touch'},{seconds:7,at:40,mode:'touch'},{seconds:-2,at:0,mode:'touch'},{seconds:99,at:0,mode:'unknown'},null,{seconds:Infinity,at:0,mode:'motion'}]);
  assert.deepEqual(records.map(r=>[r.seconds,r.at]),[[12,5],[12,20],[7,40]]);assert.deepEqual(readRecords(JSON.stringify({version:1,records})),records);
  for(const raw of ['null','bad','{}','{"version":2,"records":[]}'])assert.deepEqual(readRecords(raw),[]);
});
test('survival times use minutes, seconds and hundredths without floating point truncation',()=>{
  assert.equal(formatTime(0),'00:00.00');assert.equal(formatTime(12.349),'00:12.34');assert.equal(formatTime(65.12),'01:05.12');assert.equal(formatTime(NaN),'00:00.00');assert.equal(formatTime(-1),'00:00.00');
});
