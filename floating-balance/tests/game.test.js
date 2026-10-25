import test from 'node:test';
import assert from 'node:assert/strict';
import {FloatingGame,SHAPES,HAZARDS,contains,vertices,RADIUS,readRecords,addRecord,topThree,formatTime} from '../src/game.js';
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} ≈ ${b}`),advance=(g,seconds)=>{const events=[];for(let i=0;i<Math.round(seconds*120);i++)events.push(...g.advance(1/120));return events;};
test('circle, square and triangle have distinct valid boundaries that include a marble-radius margin',()=>{
  assert.equal(SHAPES.length,3);for(const s of SHAPES){assert.ok(contains(s.id,{x:0,y:0}));assert.equal(contains(s.id,{x:1.1,y:0}),false);assert.ok(vertices(s.id).length>=3);}assert.equal(contains('circle',{x:1-RADIUS+.001,y:0}),false);assert.equal(contains('square',{x:.8,y:.8}),true);assert.equal(contains('triangle',{x:.8,y:0}),false);assert.equal(contains('triangle',{x:0,y:-.7}),true);assert.equal(contains('circle',{x:NaN,y:0}),false);
});
test('every board eventually loses without corrections and records time before the falling animation',()=>{
  for(const s of SHAPES){const g=new FloatingGame({random:()=>.3});g.start(s.id);const events=advance(g,40);assert.ok(events.includes('fell'));assert.equal(events.filter(e=>e==='fell').length,1);assert.equal(g.state,'finished');assert.ok(g.elapsed>4&&g.elapsed<30);const saved=g.elapsed;advance(g,3);close(g.elapsed,saved);assert.deepEqual(g.advance(.1),[]);}
});
test('correction forces act along both axes and diagonal input is bounded',()=>{
  const a=new FloatingGame(),b=new FloatingGame();a.start();b.start();a.nextEvent=b.nextEvent=Infinity;a.setInput(-1,0);b.setInput(0,-1);advance(a,.5);advance(b,.5);assert.ok(a.ball.x<0);assert.ok(b.ball.y<0);a.setInput(1,1);close(Math.hypot(a.input.x,a.input.y),1);a.setInput(Infinity,0);assert.deepEqual(a.input,{x:0,y:0});
});
test('active corrections can survive two minutes of actual wind, quakes and falling parcels on all shapes',()=>{
  for(const shape of SHAPES){const g=new FloatingGame({random:()=>.75});g.start(shape.id);const seen=new Set();for(let i=0;i<120*120;i++){g.setInput(-g.ball.x*2-g.ball.vx*2,-g.ball.y*2-g.ball.vy*2);g.advance(1/120);for(const e of g.events)seen.add(e.id);}assert.equal(g.state,'playing');close(g.elapsed,120);assert.ok(['wind','quake','parcel'].every(id=>seen.has(id)));assert.ok(g.eventCount>15);}
});
test('warnings precede every hazard and falling parcels change actual momentum',()=>{
  const g=new FloatingGame({random:()=>.99});g.start();advance(g,4.05);assert.equal(g.pending.id,'wind');assert.equal(g.events.length,0);advance(g,1.3);assert.ok(g.events.some(e=>e.id==='wind'));
  const parcel=new FloatingGame();parcel.start();parcel.pending={...HAZARDS[2],x:1,y:0,at:.01};parcel.nextEvent=Infinity;advance(parcel,.03);assert.ok(parcel.ball.vx>.35);assert.equal(parcel.eventCount,1);
  const quake=new FloatingGame();quake.start();quake.pending={...HAZARDS[1],x:0,y:1,at:.01};quake.nextEvent=Infinity;advance(quake,.03);assert.ok(quake.ball.vy>.1);
});
test('fixed simulation steps give identical rolling at different render rates',()=>{
  const a=new FloatingGame(),b=new FloatingGame();a.start();b.start();a.nextEvent=b.nextEvent=Infinity;a.setInput(.1,-.1);b.setInput(.1,-.1);for(let i=0;i<120;i++)a.advance(1/120);for(let i=0;i<30;i++)b.advance(1/30);close(a.ball.x,b.ball.x);close(a.ball.y,b.ball.y);close(a.elapsed,b.elapsed);
});
test('pause freezes the board, active effects and clock; long interruptions pause safely',()=>{
  const g=new FloatingGame();g.start();advance(g,1);g.pause();const snapshot=JSON.stringify(g);advance(g,100);assert.equal(JSON.stringify(g),snapshot);assert.equal(g.resume(),true);advance(g,.2);close(g.elapsed,1.2);assert.deepEqual(g.advance(100),['suspended']);assert.equal(g.state,'paused');close(g.elapsed,1.2);
});
test('abandonment and replay clear all hazards, momentum and old records of a fall',()=>{
  const g=new FloatingGame();g.start();g.setInput(1,0);advance(g,2);g.abandon();assert.equal(g.state,'setup');assert.deepEqual(g.advance(.2),[]);g.start('triangle');assert.equal(g.elapsed,0);assert.equal(g.fallPoint,null);assert.equal(g.ball.vx,0);assert.equal(g.events.length,0);assert.equal(g.shape.id,'triangle');assert.throws(()=>g.start('hexagon'));
});
test('each shape ranks its three longest durations independently, with stable ties and storage validation',()=>{
  let records=readRecords(null);for(const [seconds,at] of [[5,1],[15,2],[10,3],[15,4],[2,5]])records=addRecord(records,'circle',seconds,at);records=addRecord(records,'triangle',8,6);assert.deepEqual(records.circle.map(r=>[r.seconds,r.at]),[[15,2],[15,4],[10,3]]);assert.deepEqual(records.square,[]);assert.equal(records.triangle[0].seconds,8);assert.deepEqual(readRecords(JSON.stringify({version:1,shapes:records})),records);assert.deepEqual(topThree([{seconds:0,at:0},{seconds:1,at:Number.MAX_SAFE_INTEGER},null]),[]);assert.throws(()=>addRecord(records,'circle',-1,0));assert.equal(formatTime(66.12),'01:06.12');
});
