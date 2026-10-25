import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,LIMITS,qualities,motionPower,motionQualities,throwStone,flightPlan,flightAt,StoneGame,gesturePower,keyboardPower,rankRecords,keepRecords,readRecords} from '../src/game.js';
import {MotionPower} from '../src/motion.js';
const ideal={angle:20};
test('initial stone settings use the minimum of every requested range',()=>{assert.deepEqual(DEFAULTS,{angle:5});assert.doesNotThrow(()=>throwStone(DEFAULTS,.5));});
test('the requested ranges are enforced without accepting missing, infinite or out-of-range settings',()=>{
  for(const [key,[min,max]] of Object.entries(LIMITS)){
    assert.doesNotThrow(()=>throwStone({...DEFAULTS,[key]:min},.5));assert.doesNotThrow(()=>throwStone({...DEFAULTS,[key]:max},.5));
    for(const value of [min-1,max+1,NaN,Infinity,undefined])assert.throws(()=>throwStone({...DEFAULTS,[key]:value},.5));
  }
  for(const power of [-.1,1.1,NaN,Infinity])assert.throws(()=>throwStone(DEFAULTS,power));
});
test('angle is exactly twenty points and measured strength is exactly eighty',()=>{
  const best=throwStone(ideal,1);assert.equal(best.score,100);assert.deepEqual(best.parts,{angle:20,power:80});
  assert.equal(throwStone(ideal,0).score,20);
  for(const power of [.1,.5,.9])assert.ok(Math.abs(throwStone(ideal,power).score-(20+80*power))<.0001);
});
test('twenty degrees is optimal and removed stone properties cannot affect a result',()=>{
  assert.deepEqual(qualities(ideal),{angle:1});
  for(const angle of [5,19,21,90,100])assert.ok(qualities({angle}).angle<1);
  const a=throwStone({...ideal,length:1,width:1,weight:10,spin:50},.5);
  const b=throwStone({...ideal,length:10,width:10,weight:100,spin:100},.5);
  assert.deepEqual(a,b);assert.deepEqual(a.settings,{angle:20});
});
test('stronger valid throws monotonically improve finite distance and bounce count within game bounds',()=>{
  let previous={distance:0,bounces:0};
  for(let i=0;i<=100;i++){
    const result=throwStone(ideal,i/100);assert.ok(result.distance>=previous.distance);assert.ok(result.bounces>=previous.bounces);
    assert.ok(result.distance>=3&&result.distance<=120);assert.ok(result.bounces>=1&&result.bounces<=28);previous=result;
  }
});
test('a throw snapshots settings, cannot be launched twice and reveals a result only after completion',()=>{
  const game=new StoneGame(),config={...DEFAULTS};assert.equal(game.launch(.5,'gesture'),false);assert.equal(game.complete(),null);
  assert.equal(game.arm(config),true);config.angle=100;assert.equal(game.config.angle,5);
  assert.equal(game.launch(.6,'fake'),false);assert.equal(game.launch(.6,'motion'),false);const metrics={force:16.2,speed:2.1,amplitude:.27};assert.equal(game.launch(.6,'motion',metrics),true);metrics.speed=0;assert.equal(game.result.motion.speed,2.1);assert.equal(game.launch(1,'gesture'),false);
  assert.equal(game.state,'animating');const result=game.complete();assert.equal(result.source,'motion');assert.equal(result.power,.6);
  assert.equal(game.complete(),null);assert.equal(game.arm(ideal),true);assert.equal(game.result,null);game.reset();assert.equal(game.state,'setup');
});
test('flight contacts occur in order, with continuous positions, a final sink and no early finished state',()=>{
  for(const power of [0,.4,1])for(const reduced of [false,true]){
    const result=throwStone(ideal,power),plan=flightPlan(result,{reduced});
    assert.equal(plan.contacts.length,result.bounces);assert.equal(flightAt(plan,0).progress,0);assert.equal(flightAt(plan,0).contacts,0);
    for(const [index,hit] of plan.contacts.entries()){
      const before=flightAt(plan,hit.time-.001),after=flightAt(plan,hit.time);assert.equal(before.contacts,index);assert.equal(after.contacts,index+1);
      assert.ok(Math.abs(before.progress-after.progress)<.0001);assert.ok(after.lift<.0001);
    }
    assert.equal(flightAt(plan,plan.duration-1).done,false);const end=flightAt(plan,plan.duration);assert.equal(end.done,true);assert.equal(end.progress,1);assert.equal(end.sink,1);assert.equal(end.contacts,result.bounces);
  }
});
test('gesture strength rejects a tap, downward drag, stale release and slow movement; fast upward swipes are stronger',()=>{
  const points=[{x:10,y:200,t:0},{x:10,y:170,t:50}];
  const slow=gesturePower(points,{x:10,y:150,t:100}),fast=gesturePower(points,{x:10,y:70,t:100});assert.ok(fast>slow);
  assert.equal(gesturePower(points,{x:10,y:150,t:500}),null);assert.equal(gesturePower(points,{x:10,y:210,t:100}),null);
  assert.equal(gesturePower([{x:0,y:10,t:0}],{x:0,y:0,t:10}),null);
  assert.equal(gesturePower([{x:0,y:200,t:0},{x:0,y:195,t:100}],{x:0,y:190,t:140}),null);
});
test('keyboard strength rises and falls predictably without ever exceeding the range',()=>{
  assert.equal(keyboardPower(0),0);assert.equal(keyboardPower(600),.5);assert.equal(keyboardPower(1200),1);assert.equal(keyboardPower(1800),.5);assert.equal(keyboardPower(2400),0);
});
const record=(id,power,createdAt=1)=>({...throwStone(ideal,power),id,source:'gesture',createdAt});
test('distance and bounce records retain their own top three, deduplicate and survive serialization',()=>{
  const rows=Array.from({length:8},(_,i)=>record(`throw-${i}`,i/10,i));rows.push(rows[7]);const top=rankRecords(rows);
  assert.equal(top.distance.length,3);assert.equal(top.bounces.length,3);assert.equal(top.distance[0].id,'throw-7');
  assert.ok(top.distance.every((r,i)=>!i||r.distance<=top.distance[i-1].distance));assert.ok(top.bounces.every((r,i)=>!i||r.bounces<=top.bounces[i-1].bounces));
  const kept=keepRecords(rows);assert.ok(kept.length<=6);assert.deepEqual(readRecords(JSON.stringify({version:2,records:kept})),kept);
});
test('malformed records, fabricated scores and unknown storage versions are ignored',()=>{
  const good=record('ok',.5);assert.deepEqual(readRecords(JSON.stringify({version:1,records:[good]})),[]);const bad=[null,{}, {...good,id:'fake',distance:Infinity},{...good,id:'changed',score:100},{...good,id:'source',source:'invented'}];
  assert.deepEqual(keepRecords([good,...bad]),[good]);for(const value of ['oops','null','{}','{"version":2,"records":[]}'])assert.deepEqual(readRecords(value),[]);
});
const reading=(x=0,y=0,z=0)=>({acceleration:{x,y,z}});
function calibrate(meter,gravity=false){for(let t=0;t<=500;t+=50)meter.sample(gravity?{accelerationIncludingGravity:{x:0,y:0,z:9.81}}:reading(),t);}
test('motion calibrates, ignores stationary data and needs a sustained gesture before it measures strength',()=>{
  const meter=new MotionPower(0);calibrate(meter);assert.equal(meter.ready,true);assert.equal(meter.finish(1000),null);
  for(let t=550;t<=700;t+=50)meter.sample(reading(15),t);assert.equal(meter.finish(800),null);
  const power=meter.finish(1100);assert.ok(power>.4&&power<.7);
});
test('motion rejects null readings, isolated spikes and samples too far apart',()=>{
  const meter=new MotionPower(0);assert.equal(meter.sample({acceleration:{x:null,y:null,z:null}},500),null);calibrate(meter);
  meter.sample(reading(55),550);meter.sample(reading(),600);meter.sample(reading(),650);assert.equal(meter.finish(1200),null);
  const gaps=new MotionPower(0);calibrate(gaps);gaps.sample(reading(20),700);gaps.sample(reading(20),1000);gaps.sample(reading(20),1300);assert.equal(gaps.finish(2000),null);
});
test('gravity-inclusive fallback removes a stationary gravity vector and recognizes a real subsequent movement',()=>{
  const meter=new MotionPower(0);calibrate(meter,true);assert.equal(meter.finish(1000),null);
  for(let t=550;t<=700;t+=50)meter.sample({acceleration:null,accelerationIncludingGravity:{x:20,y:0,z:9.81}},t);
  assert.ok(meter.finish(1100)>.5);
});
test('a stronger measured phone motion increases the eighty-percent contribution',()=>{
  const measure=force=>{const meter=new MotionPower(0);calibrate(meter);for(let t=550;t<=700;t+=50)meter.sample(reading(force),t);return meter.finish(1100);};
  const gentle=measure(8),strong=measure(25);assert.ok(strong>gentle);assert.ok(strong>.9&&strong<=1);
  assert.ok(throwStone(ideal,strong).parts.power>throwStone(ideal,gentle).parts.power);
});

test('force, speed and swing range independently contribute equal shares of the eighty points',()=>{
  const normalized={force:25,speed:3.5,amplitude:.45};assert.equal(motionPower(normalized),1);
  for(const key of ['force','speed','amplitude']){
    const low={...normalized,[key]:key==='force'?3:0};
    assert.ok(Math.abs(motionPower(low)-2/3)<1e-10);
    assert.ok(Math.abs(throwStone(ideal,1).parts.power-throwStone(ideal,motionPower(low)).parts.power-80/3)<1e-10);
  }
  for(const bad of [null,{}, {force:-1,speed:1,amplitude:.1},{force:15,speed:Infinity,amplitude:.1},{force:15,speed:1,amplitude:NaN}])assert.throws(()=>motionQualities(bad));
});
test('equal peak acceleration with a longer swing produces greater measured speed and range',()=>{
  const measure=end=>{const m=new MotionPower(0);calibrate(m);for(let t=550;t<=end;t+=50)m.sample(reading(15),t);return {power:m.finish(1200),metrics:m.metrics};};
  const short=measure(700),long=measure(950);
  assert.equal(short.metrics.force,long.metrics.force);assert.ok(long.metrics.speed>short.metrics.speed);assert.ok(long.metrics.amplitude>short.metrics.amplitude);assert.ok(long.power>short.power);
});
test('gaps and duplicate timestamps cannot invent extra speed, swing range or a new sample',()=>{
  const m=new MotionPower(0);calibrate(m);for(let t=550;t<=700;t+=50)m.sample(reading(15),t);
  const before={...m.metrics};assert.equal(m.sample(reading(60),700),null);assert.deepEqual(m.metrics,before);
  m.sample(reading(60),2000);assert.deepEqual(m.metrics,before);
});
test('phone-motion records retain the measured components and reject inconsistent composites',()=>{
  const metrics={force:18,speed:2,amplitude:.3},power=motionPower(metrics),game=new StoneGame();game.arm(ideal);
  assert.equal(game.launch(power,'motion',metrics),true);const r={...game.complete(),id:'motion',createdAt:1};
  assert.deepEqual(keepRecords([r]),[r]);assert.deepEqual(keepRecords([{...r,motion:{...metrics,speed:0}}]),[]);
  assert.deepEqual(keepRecords([{...r,motion:null}]),[]);
});
