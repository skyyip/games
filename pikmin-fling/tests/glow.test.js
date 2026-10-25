import test from 'node:test';
import assert from 'node:assert/strict';
import {FlingGame,MODES,MAX_GLOW,unitPoints} from '../src/game.js';
import {addResult,readLeaderboard,saveLeaderboard} from '../src/leaderboard.js';

test('Glow appears during every mode without changing the 35-character round',()=>{
  for(const mode of MODES){
    let now=0;const game=new FlingGame({mode,now:()=>now,random:()=>0});
    assert.equal(game.activeGlow,0);assert.deepEqual(game.advance(),[]);game.start();
    assert.equal(game.nextGlow,4000);now=3999;game.advance();assert.equal(game.activeGlow,0);
    now=4000;const changed=game.advance();assert.equal(game.activeGlow,1);
    assert.ok(changed.some(id=>game.units[id].type==='glow'));
    assert.equal(game.count,35);assert.equal(game.units.length,35);
  }
});

test('three-Glow cap includes flights; eating frees one slot for a later arrival',()=>{
  let now=0;const game=new FlingGame({now:()=>now,random:()=>0});game.start();
  now=4000;game.advance();const first=game.units.findIndex(u=>u.type==='glow');
  game.launch([first],{kind:'accessible'});
  for(const time of [7000,10000,13000]){now=time;game.advance();assert.ok(game.activeGlow<=MAX_GLOW);}
  assert.equal(game.activeGlow,3);assert.equal(game.units[first].status,'flying');
  game.arrive(first);assert.equal(game.activeGlow,2);now=16000;game.advance();
  assert.equal(game.activeGlow,3);assert.equal(game.units.filter(u=>u.type==='glow').length,4);
  assert.equal(game.units.length,35);assert.equal(game.units[first].status,'eaten');
});

test('Glow never replaces interacting or flying characters, and waits when no candidate is free',()=>{
  let now=0;const game=new FlingGame({now:()=>now,random:()=>0});game.start();
  const protectedIds=new Set(game.units.map((_,id)=>id));
  now=4000;assert.deepEqual(game.advance(protectedIds),[]);assert.equal(game.activeGlow,0);
  protectedIds.delete(7);now=7000;assert.deepEqual(game.advance(protectedIds),[7]);
  assert.equal(game.units[7].type,'glow');game.launch([8],{kind:'accessible'});
  protectedIds.delete(8);now=10000;assert.deepEqual(game.advance(protectedIds),[]);
  assert.notEqual(game.units[8].type,'glow');assert.equal(game.activeGlow,1);
});

test('Glow stage scores are 2/3/4, count only once on arrival and never after the buzzer',()=>{
  let now=0;const game=new FlingGame({mode:'timed',now:()=>now,random:()=>0});game.start();
  for(const [id,growth] of ['leaf','bud','flower'].entries())game.units[id]={type:'glow',growth,status:'ready'};
  for(let id=0;id<3;id++){assert.equal(unitPoints(game.units[id]),id+2);assert.equal(game.launch([id],{kind:'accessible'}),true);}
  assert.equal(game.score,0);now=480;
  for(let id=0;id<3;id++){assert.equal(game.arrive(id),true);assert.equal(game.arrive(id),false);}
  assert.equal(game.score,9);assert.equal(unitPoints({type:'red',growth:'flower'}),3);
  game.units[3]={type:'glow',growth:'flower',status:'ready'};now=29900;game.launch([3],{kind:'accessible'});
  now=30000;assert.equal(game.arrive(3),false);assert.equal(game.score,9);
});

test('Glow chains still require the same type and growth stage and retain flower charging',()=>{
  const game=new FlingGame({random:()=>0});game.start();
  for(let id=0;id<4;id++)game.units[id]={type:id===2?'red':'glow',growth:id===3?'bud':'flower',status:'ready'};
  assert.equal(game.launch([0,2],{kind:'chain',held:200}),false);
  assert.equal(game.launch([0,3],{kind:'chain',held:200}),false);
  assert.equal(game.launch([0],{kind:'fling',held:599}),false);
  assert.equal(game.launch([0,1],{kind:'chain',held:200}),true);
});

test('existing growth waves apply to Glow and never change a flying Glow stage',()=>{
  let now=0;const game=new FlingGame({mode:'challenge',now:()=>now,random:()=>0});
  for(const [id,growth] of ['bud','flower','leaf'].entries())game.units[id]={type:'glow',growth,status:'ready'};
  game.start();now=3000;game.advance();assert.deepEqual(game.units.slice(0,3).map(u=>u.growth),['flower','leaf','bud']);
  game.launch([0],{kind:'fling',held:600});now=6000;game.advance();
  assert.equal(game.units[0].growth,'flower');assert.equal(game.units[0].type,'glow');assert.equal(game.activeGlow,3);
});

test('Glow timing varies, hidden-time updates spawn only one, and reset/completion stop spawning',()=>{
  const delays=[];
  for(const random of [0,.2,.7,.999]){
    let now=0;const game=new FlingGame({now:()=>now,random:()=>random});game.start();
    assert.ok(game.nextGlow>=4000&&game.nextGlow<8000);delays.push(game.nextGlow);
    now=60000;game.advance();assert.equal(game.activeGlow,1);assert.ok(game.nextGlow>now);
    assert.deepEqual(game.advance(),[]);game.reset();assert.equal(game.activeGlow,0);assert.equal(game.nextGlow,Infinity);
    game.start();for(let id=0;id<35;id++){game.launch([id],{kind:'accessible'});game.arrive(id);}
    assert.equal(game.nextGlow,Infinity);now+=60000;assert.deepEqual(game.advance(),[]);
  }
  assert.equal(new Set(delays).size,4);
});

test('expanded score range persists Glow records while retaining old scores and rejecting invalid totals',()=>{
  const date='2026-10-25';let raw=JSON.stringify({normal:[{time:1000,date}],challenge:[],timed:[{score:90,date}]});
  const storage={getItem:()=>raw,setItem:(_,value)=>{raw=value;}};
  let {records}=readLeaderboard(storage);records=addResult(records,'timed',140,date).records;
  assert.equal(saveLeaderboard(storage,records),true);
  assert.deepEqual(readLeaderboard(storage).records.timed.map(r=>r.score),[140,90]);
  assert.equal(readLeaderboard(storage).records.normal[0].time,1000);
  for(const invalid of [141,-1,2.5,Infinity])assert.throws(()=>addResult(records,'timed',invalid,date),RangeError);
});
