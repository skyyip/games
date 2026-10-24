import test from 'node:test';
import assert from 'node:assert/strict';
import {isUpwardSwipe,flightPoint,createRoster,TYPES,TYPE_NAMES,PointerGesture,DoubleTap,walkRoster} from '../src/interaction.js';

test('upward flings and slow swipes work, while taps, sideways and downward gestures do not',()=>{
  const from={x:100,y:250,t:0};
  assert.equal(isUpwardSwipe(from,{x:104,y:190,t:100}),true);
  assert.equal(isUpwardSwipe(from,{x:100,y:200,t:2400}),true);
  assert.equal(isUpwardSwipe(from,{x:100,y:234,t:50}),true);
  for(const to of [{x:100,y:250,t:40},{x:100,y:260,t:80},{x:180,y:240,t:100},{x:100,y:244,t:30},{x:100,y:234,t:500}])assert.equal(isUpwardSwipe(from,to),false);
});

test('a parabolic flight starts at the released character and ends exactly inside the mouth',()=>{
  const from={x:100,y:400},to={x:300,y:100};
  assert.deepEqual(flightPoint(from,to,0),from);
  assert.deepEqual(flightPoint(from,to,1),to);
  const halfway=flightPoint(from,to,.5);
  assert.equal(halfway.x,200);assert.ok(halfway.y<250);
});

test('30 random characters roam within the fence while held characters stay still',()=>{
  const roster=createRoster(300,410,()=>.25);
  assert.equal(roster.length,30);assert.ok(roster.every(p=>TYPES.includes(p.type)));
  const before={x:roster[0].x,y:roster[0].y};
  for(let i=0;i<500;i++)walkRoster(roster,.02,300,410,new Set([0]));
  assert.deepEqual({x:roster[0].x,y:roster[0].y},before);
  assert.ok(roster.every(p=>p.x>=22 && p.x<=278 && p.y>=29 && p.y<=381));
});

test('compact phone and landscape gardens fit 30 full 44px touch targets and keep roaming inside their bounds',()=>{
  for(const [width,height] of [[296,250],[444,184],[700,150]]) {
    const roster=createRoster(width,height,()=>0,44);
    assert.equal(roster.length,30);
    assert.ok(roster.every(p=>p.x>=22&&p.x<=width-22&&p.y>=22&&p.y<=height-22));
    for(let i=0;i<30;i++)for(let j=i+1;j<30;j++)assert.ok(Math.abs(roster[i].x-roster[j].x)>=44||Math.abs(roster[i].y-roster[j].y)>=44);
    for(let i=0;i<100;i++)walkRoster(roster,.02,width,height,new Set(),()=>0,44);
    assert.ok(roster.every(p=>p.x>=22&&p.x<=width-22&&p.y>=22&&p.y<=height-22));
  }
});

test('random crowds can include all seven Pikmin types, including White',()=>{
  const seen=new Set();
  for(const random of [.01,.16,.3,.45,.6,.75,.9]) {
    const roster=createRoster(700,480,()=>random);
    assert.equal(roster.length,30);
    for(const unit of roster){seen.add(unit.type);assert.ok(TYPE_NAMES[unit.type]);}
  }
  assert.deepEqual([...seen],['red','yellow','blue','ice','rock','winged','white']);
});

test('short press and drag links matching stages after 200ms, while a single flower still needs 0.6 seconds',()=>{
  for(const growth of ['leaf','bud','flower']) {
    const g=new PointerGesture(0,growth,{x:100,y:200,t:0});
    g.update(199);assert.equal(g.chaining,false);assert.equal(g.add(1,growth),false);
    g.update(200);assert.equal(g.chaining,true);
    assert.equal(g.add(2,growth==='leaf'?'bud':'leaf'),false);
    assert.equal(g.add(1,growth),true);assert.equal(g.add(1,growth),false);
    g.move({x:200,y:200,t:220});g.move({x:200,y:170,t:240});
    assert.deepEqual(g.action({x:200,y:130,t:260}),{kind:'chain',held:220});
    assert.deepEqual(g.ids,[0,1]);
  }
  const solo=new PointerGesture(0,'flower',{x:100,y:200,t:0});
  solo.update(200);solo.move({x:100,y:130,t:210});
  assert.equal(solo.action({x:100,y:130,t:220}),null);
});

test('single-flower charging, longer holds and chain flick detection keep their original behaviour',()=>{
  const begin={x:100,y:200,t:0};
  const flower=new PointerGesture(2,'flower',begin);
  flower.move({x:100,y:140,t:100});
  assert.equal(flower.action({x:100,y:130,t:1200}),null); // waiting after swiping is not a charge
  const early=new PointerGesture(2,'flower',begin);
  early.update(599);assert.equal(early.charged,false);assert.equal(early.chaining,true);
  early.move({x:100,y:150,t:599});assert.equal(early.action({x:100,y:130,t:599}),null);
  const charged=new PointerGesture(2,'flower',begin);
  charged.update(600);assert.equal(charged.charged,true);assert.equal(charged.chaining,true);
  charged.move({x:100,y:150,t:660});
  assert.equal(charged.action({x:100,y:125,t:680})?.kind,'chain');
  const chain=new PointerGesture(2,'bud',begin);
  chain.update(500);assert.equal(chain.chaining,true);
  assert.equal(chain.add(3,'leaf'),false);assert.equal(chain.add(4,'bud'),true);assert.equal(chain.add(4,'bud'),false);
  chain.move({x:250,y:300,t:800});chain.move({x:250,y:280,t:850});
  assert.deepEqual(chain.action({x:250,y:235,t:900}),{kind:'chain',held:800}); // final flick, not whole path
  assert.deepEqual(chain.ids,[2,4]);
  const tap=new PointerGesture(1,'bud',begin);
  assert.equal(tap.isTap({x:102,y:202,t:180}),true);
  assert.equal(tap.isTap({x:102,y:202,t:600}),false);
});

test('double taps must hit the same Pikmin within the window; cancellation clears pending taps',()=>{
  const taps=new DoubleTap();
  assert.equal(taps.tap(2,100),false);assert.equal(taps.tap(3,150),false);
  assert.equal(taps.tap(3,400),true);assert.equal(taps.pending,null);
  assert.equal(taps.tap(2,500),false);assert.equal(taps.tap(2,900),false);
  taps.clear();assert.equal(taps.tap(2,950),false);
  taps.expire(1400);assert.equal(taps.pending,null);
});

test('a fast sideways chain trace followed immediately by an upward flick uses only the final direction',()=>{
  const chain=new PointerGesture(0,'leaf',{x:100,y:200,t:0});chain.update(500);
  chain.move({x:100,y:200,t:700});chain.move({x:500,y:200,t:750});
  chain.move({x:500,y:180,t:780});chain.move({x:500,y:140,t:810});
  assert.equal(chain.action({x:500,y:130,t:830})?.kind,'chain');
  assert.equal(chain.action({x:500,y:140,t:1200}),null); // releasing after a pause is not a flick
});

test('a short-press chain can pause after dragging and then fling with one coalesced upward move',()=>{
  const chain=new PointerGesture(0,'flower',{x:100,y:200,t:0});chain.update(200);
  chain.add(1,'flower');chain.move({x:200,y:200,t:240});chain.update(1000);
  chain.move({x:200,y:130,t:1050});
  assert.equal(chain.action({x:200,y:130,t:1060})?.kind,'chain');
  assert.equal(chain.action({x:200,y:130,t:1500}),null,'stale flick velocity must still expire');
});

test('walking takes longer routes across the garden rather than only shuffling near the starting spot',()=>{
  const walker=createRoster(800,600,()=>0)[0],start=walker.x;
  for(let frame=0;frame<150;frame++)walkRoster([walker],.04,800,600,new Set(),()=>0);
  assert.ok(walker.x-start>=100,'a clear six-second walk should cover at least 100px');
  assert.ok(walker.x<=778 && walker.y>=29 && walker.y<=571);
});

test('a flower held for 0.6 seconds accepts the first upward move even when touch input is coalesced',()=>{
  const g=new PointerGesture(1,'flower',{x:100,y:200,t:0});
  g.update(650);g.move({x:100,y:135,t:660});
  assert.equal(g.action({x:100,y:135,t:670})?.kind,'chain');
});

test('pointer chains filter colour as well as growth and keep the charge boundary at 600ms',()=>{
 const gesture=new PointerGesture(0,'flower',{x:100,y:200,t:0},'white');
 gesture.update(200);
 assert.equal(gesture.add(1,'flower','red'),false);
 assert.equal(gesture.add(2,'leaf','white'),false);
 assert.equal(gesture.add(3,'flower','white'),true);
 assert.deepEqual(gesture.ids,[0,3]);
 const solo=new PointerGesture(0,'flower',{x:100,y:200,t:0},'white');
 solo.update(599);assert.equal(solo.charged,false);
 solo.update(600);assert.equal(solo.charged,true);
});

test('ground gait progresses with distance and pauses with a held character',()=>{
 const unit=createRoster(500,500,()=>.1)[0],before=unit.gait;
 walkRoster([unit],.04,500,500,new Set(),()=>.1);
 assert.ok(unit.gait>before);
 const paused=unit.gait;
 walkRoster([unit],.04,500,500,new Set([unit.id]),()=>.1);
 assert.equal(unit.gait,paused);
});
