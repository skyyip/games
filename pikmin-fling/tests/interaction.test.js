import test from 'node:test';
import assert from 'node:assert/strict';
import {isUpwardSwipe,flightPoint,createRoster,TYPES} from '../src/interaction.js';

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

test('all counts get random valid species and unique slots wholly within the fenced field',()=>{
  for(const count of [20,30,40]) {
    const roster=createRoster(count);
    assert.equal(roster.length,count);assert.equal(new Set(roster.map(p=>p.slot)).size,count);
    assert.deepEqual(roster.map(p=>p.id),Array.from({length:count},(_,i)=>i));
    assert.ok(roster.every(p=>p.slot>=0 && p.slot<40 && TYPES.includes(p.type)));
  }
  const first=createRoster(20,()=>0),second=createRoster(20,()=>.99);
  assert.notEqual(first[0].type,second[0].type);
  assert.notDeepEqual(first.map(p=>p.slot),second.map(p=>p.slot));
});
