import test from 'node:test';
import assert from 'node:assert/strict';
import {FlickGame,measureFlick,MAX_DISTANCE,MAX_SPEED} from '../src/game.js';
const swipe=({span=350,duration=200,direction=-1,pressure=.5,extent=800}={})=>Array.from({length:11},(_,i)=>({x:100,y:400+direction*span*(i/10)**1.5,t:i*duration/10,pressure}));

test('one upward or downward flick launches the same distance with matching technique',()=>{
  const results=[];
  for(const direction of [-1,1]){const game=new FlickGame();assert.equal(game.begin(),true);assert.equal(game.release(swipe({direction}),{extent:800}),true);game.advance(20);assert.equal(game.state,'complete');assert.ok(game.distance>0&&game.distance<=MAX_DISTANCE);assert.equal(game.metrics.direction,direction===-1?'up':'down');results.push(game.distance);}
  assert.ok(Math.abs(results[0]-results[1])<1e-9);
});
test('quicker, wider swipes and stronger meaningful pressure each improve distance',()=>{
  const score=options=>measureFlick(swipe(options),{extent:800}).strength;
  assert.ok(score({duration:120})>score({duration:350}));
  assert.ok(score({span:500})>score({span:120}));
  assert.ok(score({pressure:.85})>score({pressure:.2}));
});
test('relative gestures are consistent across screen sizes',()=>{
  const scores=[400,800,1000].map(extent=>measureFlick(swipe({span:extent*.45}),{extent}).strength);
  assert.ok(scores.every(score=>Math.abs(score-scores[0])<1e-9));
});
test('default half-pressure and missing pressure do not pretend to measure force',()=>{
  for(const pressure of [undefined,0,.5,1,NaN,Infinity,-1,2])assert.equal(measureFlick(swipe({pressure}),{extent:800}).pressureUsed,false);
  assert.equal(measureFlick(swipe({pressure:.8}),{source:'mouse'}).pressureUsed,false);
  assert.equal(measureFlick(swipe({pressure:.8}),{source:'pen'}).pressureUsed,true);
  const single=swipe();single[4].pressure=.9;assert.equal(measureFlick(single).pressureUsed,false);
});
test('taps, horizontal drags, long holds and repeated rubbing do not launch',()=>{
  const loop=swipe();loop[3].y=10;loop[5].y=900;loop[7].y=0;
  const horizontal=swipe().map((p,i)=>({...p,x:i*100,y:100-i}));
  for(const points of [[],[swipe()[0]],swipe({span:5}),swipe({duration:10}),swipe({duration:2000}),horizontal,loop])assert.equal(measureFlick(points),null);
});
test('duplicate and invalid samples cannot poison the measurement or exceed the speed bound',()=>{
  const samples=swipe(),dirty=[null,{x:NaN,y:0,t:1},...samples.flatMap(p=>[p,{...p,t:p.t-1}]),{x:0,y:Infinity,t:1000}];
  assert.deepEqual(measureFlick(dirty),measureFlick(samples));
  for(const extent of [NaN,0,-1,Infinity])assert.equal(measureFlick(samples,{extent}),null);
  const maximum=measureFlick(swipe({span:800,duration:100}));assert.ok(maximum.initialSpeed<=MAX_SPEED);
});
test('distance grows continuously, speed decreases, and results match across frame rates',()=>{
  const make=()=>{const g=new FlickGame();g.begin();g.release(swipe());return g;};
  const game=make();let distance=0,speed=game.speed;
  for(let i=0;i<1000&&game.state==='coasting';i++){game.advance(1/120);assert.ok(game.distance>=distance);assert.ok(game.speed<=speed);distance=game.distance;speed=game.speed;}
  const other=make();other.advance(100);
  assert.equal(game.state,'complete');assert.ok(Math.abs(game.distance-other.distance)<1e-8);assert.equal(game.speed,0);
  assert.equal(game.advance(10),false);assert.equal(game.distance,distance);
});
test('a round cannot stack launches or overwrite a coast, and cancelling starts clean',()=>{
  const game=new FlickGame();assert.equal(game.release(swipe()),false);game.begin();assert.equal(game.begin(),false);
  assert.equal(game.release(swipe()),true);assert.equal(game.release(swipe()),false);assert.equal(game.begin(),false);
  game.advance(.2);assert.ok(game.distance>0);game.reset();assert.equal(game.state,'ready');assert.equal(game.distance,0);assert.equal(game.metrics,null);
  game.begin();assert.equal(game.release(swipe({span:1})),false);assert.equal(game.state,'ready');
});
test('invalid animation steps leave the round unchanged and a delayed final frame clamps at rest',()=>{
  const game=new FlickGame();game.begin();game.release(swipe());
  for(const value of [NaN,Infinity,-1,0]){assert.equal(game.advance(value),false);assert.equal(game.distance,0);}
  assert.equal(game.advance(9999),true);assert.ok(game.distance<=MAX_DISTANCE);assert.equal(game.speed,0);
});

test('keyboard and unknown gesture sources cannot launch a round',()=>{
  for(const source of ['keyboard','wheel','unknown']){const game=new FlickGame();game.begin();assert.equal(game.release(swipe(),{source}),false);assert.equal(game.state,'ready');}
});
