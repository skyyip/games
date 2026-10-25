import test from 'node:test';
import assert from 'node:assert/strict';
import {walkingPose,walkRoster,createRoster} from '../src/interaction.js';

test('supporting feet stay level and move backwards; swinging feet lift and return forward',()=>{
  const poses=[0,.2,.4,.6,.8].map(t=>walkingPose(t*Math.PI,18,0).feet[0]);
  assert.ok(poses.every(p=>p.supporting&&p.lift===0&&p.dy===0));
  assert.ok(poses.every((p,i)=>!i||p.dx<poses[i-1].dx));
  for(const foot of poses){
    const a=foot.angle*Math.PI/180;
    assert.ok(Math.abs(foot.y-2*Math.sin(a)+9*Math.cos(a)-9)<1e-10);
  }
  const swing=walkingPose(Math.PI*1.5,18,0).feet[0];
  assert.equal(swing.supporting,false);assert.ok(swing.lift>3);assert.ok(swing.dy<0);
});

test('two-legged and three-legged gaits always retain support and become still on pause',()=>{
  for(const three of [false,true]){
    for(let phase=0;phase<Math.PI*2;phase+=.1){
      const pose=walkingPose(phase,18,6,true,three);
      assert.equal(pose.feet.length,three?3:2);assert.ok(pose.feet.some(f=>f.supporting));
      assert.ok(pose.feet.every(f=>Math.abs(f.angle)<=14&&f.lift<=3.2));
      const paused=walkingPose(phase,18,6,false,three);
      assert.ok(paused.feet.every(f=>f.angle===0&&f.lift===0&&f.x===0&&f.y===0));
    }
  }
  assert.ok(walkingPose(1,2,0).feet[0].lift<=walkingPose(1,18,0).feet[0].lift);
});

test('turns preserve momentum before easing toward a new direction, and held walkers stay still',()=>{
  const unit=createRoster(1000,600,()=>0)[0];unit.x=500;unit.y=300;unit.turn=0;
  walkRoster([unit],.04,1000,600,new Set(),()=>.5);
  assert.ok(unit.vx>0&&unit.targetVx<0,'a reversal must not snap the current velocity');
  for(let i=0;i<30;i++)walkRoster([unit],.04,1000,600,new Set(),()=>.5);
  assert.ok(unit.vx<0);
  const before={...unit};walkRoster([unit],.04,1000,600,new Set([unit.id]),()=>0);
  assert.deepEqual(unit,before);
});

test('crowd separation is time based and never teleports on a zero-duration frame',()=>{
  const roster=createRoster(1000,600,()=>0).slice(0,2);
  for(const p of roster){p.x=500;p.y=300;p.vx=0;p.vy=0;p.targetVx=0;p.targetVy=0;}
  const before=structuredClone(roster);walkRoster(roster,0,1000,600);
  assert.deepEqual(roster,before);walkRoster(roster,.01,1000,600);
  assert.ok(roster[0].x<500&&roster[1].x>500);
  assert.ok(Math.abs(roster[0].x-500)<5&&Math.abs(roster[1].x-500)<5);
});
