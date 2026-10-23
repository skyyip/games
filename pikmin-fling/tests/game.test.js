import test from 'node:test';
import assert from 'node:assert/strict';
import {FlingGame} from '../src/game.js';

test('20-second mode counts down from start and ends at the deadline, including after a background delay',()=>{
  let now=500;
  const game=new FlingGame({mode:'timed',now:()=>now});
  assert.equal(game.remainingTime,20000);assert.equal(game.elapsed,0);
  now=9000;assert.equal(game.remainingTime,20000);
  game.start();now=28999;
  assert.equal(game.remainingTime,1);assert.equal(game.state,'playing');
  now=35000;game.advance();
  assert.equal(game.state,'completed');assert.equal(game.endReason,'timeout');
  assert.equal(game.elapsed,20000);assert.equal(game.remainingTime,0);
  assert.equal(game.launch([0],{kind:'accessible'}),false);assert.deepEqual(game.advance(),[]);
  now+=50000;assert.equal(game.elapsed,20000);
  game.reset();assert.equal(game.state,'idle');assert.equal(game.remainingTime,20000);
});

test('timed scores count each arrival once as 1/2/3 points and reject late arrivals and launches',()=>{
  let now=0;const game=new FlingGame({mode:'timed',now:()=>now});game.start();
  const id=growth=>game.units.findIndex(unit=>unit.growth===growth);
  const leaf=id('leaf'),bud=id('bud'),flower=id('flower');
  assert.equal(game.score,0);assert.equal(game.arrive(leaf),false);
  assert.equal(game.launch([flower],{kind:'fling',held:999}),false);
  for(const target of [leaf,bud,flower])assert.equal(game.launch([target],{kind:'accessible'}),true);
  assert.equal(game.score,0,'launching is not yet a cleared Pikmin');
  now=480;game.arrive(leaf);assert.equal(game.score,1);
  assert.equal(game.arrive(leaf),false);assert.equal(game.score,1);
  game.arrive(bud);assert.equal(game.score,3);
  game.arrive(flower);assert.equal(game.score,6);assert.equal(game.progress,3);
  const late=game.units.findIndex(unit=>unit.status==='ready');
  now=19900;assert.equal(game.launch([late],{kind:'accessible'}),true);
  now=20000;assert.equal(game.arrive(late),false);
  assert.equal(game.score,6);assert.equal(game.progress,3);assert.equal(game.state,'completed');
  assert.equal(game.launch([late],{kind:'accessible'}),false);
  game.reset();assert.equal(game.score,0);
  game.start();now+=500;
  for(let i=0;i<30;i++){game.launch([i],{kind:'accessible'});game.arrive(i);}
  assert.equal(game.score,45);assert.equal(game.state,'completed');assert.equal(game.endReason,'cleared');
  assert.equal(game.elapsed,500);assert.equal(game.remainingTime,19500);
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
  game.launch([bloomed],{kind:'fling',held:1000});game.arrive(bloomed);assert.equal(game.score,3);
  game.arrive(flying);assert.equal(game.score,5);
  random=.999999;now=6000;
  assert.equal(game.advance().length,18); // 10 normal + 3 remaining buds + 5 flowers
  assert.ok(game.nextChange>13999&&game.nextChange<=14000);
  now=14000;assert.ok(game.advance().length>0);
  now=20000;assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  assert.equal(game.score,5);
});

test('both modes start with 30 Pikmin: 20 leaf, 5 bud, 5 flower, and finish only at the final arrival',()=>{
  let now=1000;
  for(const mode of ['normal','challenge']) {
    const game=new FlingGame({mode,now:()=>now});
    assert.equal(game.count,30);
    assert.deepEqual(game.growthCounts,{leaf:20,bud:5,flower:5});
    assert.equal(game.elapsed,0);assert.equal(game.launch([0],{kind:'accessible'}),false);
    assert.equal(game.start(),true);assert.equal(game.start(),false);
    now+=1234.56789;
    for(let id=0;id<30;id++) {
      assert.equal(game.launch([id],{kind:'accessible'}),true);
      assert.equal(game.launch([id],{kind:'accessible'}),false);
    }
    assert.equal(game.state,'playing');assert.equal(game.progress,0);
    for(let id=0;id<29;id++)assert.equal(game.arrive(id),true);
    assert.equal(game.arrive(0),false);assert.equal(game.progress,29);
    now+=480;game.arrive(29);
    const elapsed=game.elapsed;assert.ok(Math.abs(elapsed-1714.56789)<.00001);
    assert.equal(game.state,'completed');assert.equal(game.remaining,0);
    now+=9000;assert.equal(game.elapsed,elapsed);
    game.reset(mode);assert.equal(game.state,'idle');assert.equal(game.elapsed,0);
    assert.equal(game.arrive(29),false);assert.deepEqual(game.growthCounts,{leaf:20,bud:5,flower:5});
  }
});

test('state-specific gestures and same-state chains are enforced atomically',()=>{
  const game=new FlingGame();game.start();
  const ids=growth=>game.units.flatMap((u,i)=>u.growth===growth?[i]:[]);
  const leaf=ids('leaf'),bud=ids('bud'),flower=ids('flower');
  assert.equal(game.launch([leaf[0]],{kind:'double-tap'}),false);
  assert.equal(game.launch([bud[0]],{kind:'fling',held:900}),false);
  assert.equal(game.launch([flower[0]],{kind:'fling',held:999}),false);
  assert.equal(game.launch([flower[0]],{kind:'fling',held:1000}),true);
  assert.equal(game.launch([flower[1],flower[2]],{kind:'chain',held:999}),false);
  assert.equal(game.launch([flower[1],flower[2]],{kind:'chain',held:1000}),true);
  assert.equal(game.launch([bud[0]],{kind:'double-tap'}),true);
  assert.equal(game.launch([leaf[0]],{kind:'fling',held:0}),true);
  assert.equal(game.launch([bud[1],leaf[1]],{kind:'chain',held:600}),false);
  assert.equal(game.units[bud[1]].status,'ready');
  assert.equal(game.launch([bud[1],bud[2]],{kind:'chain',held:499}),false);
  assert.equal(game.launch([bud[1],bud[2]],{kind:'chain',held:500}),true);
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
  assert.deepEqual(game.growthCounts,{leaf:20,bud:4,flower:5});
  assert.equal(game.units[leaf].growth,'leaf');assert.equal(game.units[bud].growth,'bud');
  assert.equal(game.nextChange,6000);assert.deepEqual(game.advance(),[]);
  random=.999999;now=6000;
  assert.equal(game.advance().length,19); // 10 leaf + 4 available bud + 5 flower
  assert.deepEqual(game.growthCounts,{leaf:15,bud:10,flower:4});
  assert.ok(game.nextChange>13999 && game.nextChange<=14000);
  now=99999;assert.ok(game.advance().length>0);assert.ok(game.nextChange>now); // no catch-up burst
  game.reset('normal');game.start();now+=30000;assert.deepEqual(game.advance(),[]);
  assert.deepEqual(game.growthCounts,{leaf:20,bud:5,flower:5});
});

test('challenge caps transitions to available units and stops after completion or reset',()=>{
  let now=0;const game=new FlingGame({mode:'challenge',now:()=>now,random:()=>.99999});game.start();
  const protectedIds=new Set(Array.from({length:30},(_,i)=>i));
  now=8000;assert.deepEqual(game.advance(protectedIds),[]);
  for(let i=0;i<30;i++) {game.launch([i],{kind:'accessible'});game.arrive(i);}
  now=40000;assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  game.reset('challenge');assert.deepEqual(game.advance(),[]);assert.equal(game.nextChange,Infinity);
  assert.throws(()=>game.reset('bad'),RangeError);
});
