import test from 'node:test';
import assert from 'node:assert/strict';
import {FlingGame} from '../src/game.js';

test('all three modes can start with purple characters and the 35-character growth split',()=>{
  for(const mode of ['normal','challenge','timed']){
    const game=new FlingGame({mode,now:()=>0,random:()=>.95});
    assert.equal(game.units.length,35);assert.ok(game.units.every(u=>u.type==='purple'));
    assert.deepEqual(game.growthCounts,{leaf:25,bud:5,flower:5});
    game.start();const leaf=game.units.findIndex(u=>u.growth==='leaf');
    assert.equal(game.launch([leaf],{kind:'accessible'}),true);assert.equal(game.arrive(leaf),true);
    assert.equal(game.score,mode==='timed'?1:0);
  }
});

test('35-second mode counts down from start and ends at the deadline, including after a background delay',()=>{
  let now=500;
  const game=new FlingGame({mode:'timed',now:()=>now});
  assert.equal(game.remainingTime,35000);assert.equal(game.elapsed,0);
  now=9000;assert.equal(game.remainingTime,35000);
  game.start();now=43999;
  assert.equal(game.remainingTime,1);assert.equal(game.state,'playing');
  now=45000;game.advance();
  assert.equal(game.state,'completed');assert.equal(game.endReason,'timeout');
  assert.equal(game.elapsed,35000);assert.equal(game.remainingTime,0);
  assert.equal(game.launch([0],{kind:'accessible'}),false);assert.deepEqual(game.advance(),[]);
  now+=50000;assert.equal(game.elapsed,35000);
  game.reset();assert.equal(game.state,'idle');assert.equal(game.remainingTime,35000);
});

test('timed scores count each arrival once as 1/2/3 points and reject late arrivals and launches',()=>{
  let now=0;const game=new FlingGame({mode:'timed',now:()=>now});game.start();
  const id=growth=>game.units.findIndex(unit=>unit.growth===growth);
  const leaf=id('leaf'),bud=id('bud'),flower=id('flower');
  assert.equal(game.score,0);assert.equal(game.arrive(leaf),false);
  assert.equal(game.launch([flower],{kind:'fling',held:599}),false);
  for(const target of [leaf,bud,flower])assert.equal(game.launch([target],{kind:'accessible'}),true);
  assert.equal(game.score,0,'launching is not yet a cleared Pikmax');
  now=480;game.arrive(leaf);assert.equal(game.score,1);
  assert.equal(game.arrive(leaf),false);assert.equal(game.score,1);
  game.arrive(bud);assert.equal(game.score,3);
  game.arrive(flower);assert.equal(game.score,6);assert.equal(game.progress,3);
  const late=game.units.findIndex(unit=>unit.status==='ready');
  now=34900;assert.equal(game.launch([late],{kind:'accessible'}),true);
  now=35000;assert.equal(game.arrive(late),false);
  assert.equal(game.score,6);assert.equal(game.progress,3);assert.equal(game.state,'completed');
  assert.equal(game.launch([late],{kind:'accessible'}),false);
  game.reset();assert.equal(game.score,0);
  game.start();now+=500;
  for(let i=0;i<35;i++){game.launch([i],{kind:'accessible'});game.arrive(i);}
  assert.equal(game.score,50);assert.equal(game.state,'completed');assert.equal(game.endReason,'cleared');
  assert.equal(game.elapsed,500);assert.equal(game.remainingTime,34500);
});

test('timed play remains open after 30 seconds and rejects arrivals exactly at 35 seconds',()=>{
  let now=0;const game=new FlingGame({mode:'timed',now:()=>now,random:()=>0});game.start();
  now=30000;game.advance();assert.equal(game.state,'playing');assert.equal(game.remainingTime,5000);
  game.units[0]={type:'glow',growth:'flower',status:'ready'};
  game.units[1]={type:'red',growth:'leaf',status:'ready'};
  assert.equal(game.launch([0],{kind:'accessible'}),true);
  assert.equal(game.launch([1],{kind:'accessible'}),true);
  now=34999;assert.equal(game.arrive(0),true);assert.equal(game.score,4);
  now=35000;assert.equal(game.arrive(1),false);assert.equal(game.score,4);assert.equal(game.endReason,'timeout');
});

test('timed growth waves repeat within 3–8 seconds and score the changed stage, protecting flights and interactions',()=>{
  let now=0,random=0;
  const game=new FlingGame({mode:'timed',now:()=>now,random:()=>random});game.start();
  assert.equal(game.nextChange,3000);
  const held=game.units.findIndex(u=>u.growth==='flower');
  const flying=game.units.findIndex(u=>u.growth==='bud');game.launch([flying],{kind:'double-tap'});
  now=2999;assert.deepEqual(game.advance(),[]);
  now=3000;const changed=game.advance(new Set([held]));
  assert.equal(changed.length,3);assert.equal(game.units[held].growth,'flower');assert.equal(game.units[flying].growth,'bud');
  const bloomed=changed.find(id=>game.units[id].growth==='flower');
  game.launch([bloomed],{kind:'fling',held:600});game.arrive(bloomed);assert.equal(game.score,3);
  game.arrive(flying);assert.equal(game.score,5);
  random=.999999;now=6000;
  assert.equal(game.advance().length,19); // 18 growth changes plus one glow arrival
  assert.equal(game.activeGlow,1);
  assert.ok(game.nextChange>13999&&game.nextChange<=14000);
  now=14000;assert.ok(game.advance().length>0);
  now=35000;assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  assert.equal(game.score,5);
});

test('both modes start with 35 Pikmax: 25 leaf, 5 bud, 5 flower, and finish only at the final arrival',()=>{
  let now=1000;
  for(const mode of ['normal','challenge']) {
    const game=new FlingGame({mode,now:()=>now});
    assert.equal(game.count,35);
    assert.deepEqual(game.growthCounts,{leaf:25,bud:5,flower:5});
    assert.equal(game.elapsed,0);assert.equal(game.launch([0],{kind:'accessible'}),false);
    assert.equal(game.start(),true);assert.equal(game.start(),false);
    now+=1234.56789;
    for(let id=0;id<35;id++) {
      assert.equal(game.launch([id],{kind:'accessible'}),true);
      assert.equal(game.launch([id],{kind:'accessible'}),false);
    }
    assert.equal(game.state,'playing');assert.equal(game.progress,0);
    for(let id=0;id<34;id++)assert.equal(game.arrive(id),true);
    assert.equal(game.arrive(0),false);assert.equal(game.progress,34);
    now+=480;game.arrive(34);
    const elapsed=game.elapsed;assert.ok(Math.abs(elapsed-1714.56789)<.00001);
    assert.equal(game.state,'completed');assert.equal(game.remaining,0);
    now+=9000;assert.equal(game.elapsed,elapsed);
    game.reset(mode);assert.equal(game.state,'idle');assert.equal(game.elapsed,0);
    assert.equal(game.arrive(34),false);assert.deepEqual(game.growthCounts,{leaf:25,bud:5,flower:5});
  }
});

test('state-specific gestures and same-state chains are enforced atomically',()=>{
  const game=new FlingGame({random:()=>0});game.start();
  const ids=growth=>game.units.flatMap((u,i)=>u.growth===growth?[i]:[]);
  const leaf=ids('leaf'),bud=ids('bud'),flower=ids('flower');
  assert.equal(game.launch([leaf[0]],{kind:'double-tap'}),false);
  assert.equal(game.launch([bud[0]],{kind:'fling',held:900}),false);
  assert.equal(game.launch([flower[0]],{kind:'fling',held:599}),false);
  assert.equal(game.launch([flower[0]],{kind:'fling',held:600}),true);
  assert.equal(game.launch([flower[1]],{kind:'chain',held:200}),false);
  assert.equal(game.launch([flower[1],flower[2]],{kind:'chain',held:199}),false);
  assert.equal(game.launch([flower[1],flower[2]],{kind:'chain',held:200}),true);
  assert.equal(game.launch([bud[0]],{kind:'double-tap'}),true);
  assert.equal(game.launch([leaf[0]],{kind:'fling',held:0}),true);
  assert.equal(game.launch([bud[1],leaf[1]],{kind:'chain',held:600}),false);
  assert.equal(game.units[bud[1]].status,'ready');
  assert.equal(game.launch([bud[1],bud[2]],{kind:'chain',held:199}),false);
  assert.equal(game.launch([bud[1],bud[2]],{kind:'chain',held:200}),true);
  assert.equal(game.launch([leaf[3],leaf[4]],{kind:'chain',held:200}),true);
  for(const invalid of [[leaf[1],leaf[1]],[leaf[1],99],[],['1'],[NaN]])assert.equal(game.launch(invalid,{kind:'accessible'}),false);
  assert.equal(game.launch([leaf[1],leaf[2]],{kind:'fling',held:600}),false);
  assert.equal(game.launch([leaf[1]]),false);
});

test('challenge changes a simultaneous snapshot every 3–8 seconds and protects interacting/flying units',()=>{
  let now=0,random=0;
  const game=new FlingGame({mode:'challenge',now:()=>now,random:()=>random});
  assert.deepEqual(game.advance(),[]);game.start();assert.equal(game.nextChange,3000);
  const leaf=game.units.findIndex(u=>u.growth==='leaf'),bud=game.units.findIndex(u=>u.growth==='bud');
  game.launch([bud],{kind:'double-tap'});
  now=2999;assert.deepEqual(game.advance(),[]);
  now=3000;const changed=game.advance(new Set([leaf]));
  assert.equal(changed.length,3);
  assert.deepEqual(game.growthCounts,{leaf:25,bud:4,flower:5});
  assert.equal(game.units[leaf].growth,'leaf');assert.equal(game.units[bud].growth,'bud');
  assert.equal(game.nextChange,6000);assert.deepEqual(game.advance(),[]);
  random=.999999;now=6000;
  assert.equal(game.advance().length,19); // Challenge has growth changes, never Glow arrivals
  assert.equal(game.activeGlow,0);
  assert.deepEqual(game.growthCounts,{leaf:20,bud:10,flower:4});
  assert.ok(game.nextChange>13999 && game.nextChange<=14000);
  now=99999;assert.ok(game.advance().length>0);assert.ok(game.nextChange>now); // no catch-up burst
  game.reset('normal');game.start();now+=35000;assert.equal(game.advance().length,0);
  assert.equal(game.nextChange,Infinity);assert.equal(game.activeGlow,0);
  assert.deepEqual(game.growthCounts,{leaf:25,bud:5,flower:5});
});

test('challenge caps transitions to available units and stops after completion or reset',()=>{
  let now=0;const game=new FlingGame({mode:'challenge',now:()=>now,random:()=>.99999});game.start();
  const protectedIds=new Set(Array.from({length:35},(_,i)=>i));
  now=8000;assert.deepEqual(game.advance(protectedIds),[]);
  for(let i=0;i<35;i++) {game.launch([i],{kind:'accessible'});game.arrive(i);}
  now=40000;assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  game.reset('challenge');assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  assert.throws(()=>game.reset('bad'),RangeError);
});

test('chains require both the same colour and growth stage, rejecting the whole launch atomically',()=>{
 const game=new FlingGame({random:()=>0});
 for(let id=0;id<4;id++)game.units[id]={type:id===1?'blue':'red',growth:id===3?'bud':'leaf',status:'ready'};
 game.start();
 assert.equal(game.launch([0,1],{kind:'chain',held:300}),false);
 assert.equal(game.launch([0,3],{kind:'chain',held:300}),false);
 assert.ok(game.units.slice(0,4).every(unit=>unit.status==='ready'));
 assert.equal(game.launch([0,2],{kind:'chain',held:300}),true);
 assert.equal(game.units[0].status,'flying');assert.equal(game.units[2].status,'flying');
});

test('single flowers accept a stationary 600ms charge, and shorter holds cannot launch them',()=>{
 for(const held of [0,200,599,600]){
  const game=new FlingGame({random:()=>0});game.start();
  const id=game.units.findIndex(unit=>unit.growth==='flower');
  assert.equal(game.launch([id],{kind:'fling',held}),held>=600);
 }
});
