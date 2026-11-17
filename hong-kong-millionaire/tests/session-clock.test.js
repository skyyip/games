import test from 'node:test';import assert from 'node:assert/strict';
import {createSessionClock} from '../src/session-clock.js';
test('server clock survives a device five minutes fast and wall-clock changes',()=>{
 let wall=300000,mono=100;const clock=createSessionClock({wall:()=>wall,mono:()=>mono});assert.equal(clock.now(),wall);
 clock.observe(1000,80,120);assert.equal(clock.now(),1000);assert.equal(clock.lowerBound(),978);wall+=86400000;mono+=25000;assert.equal(clock.now(),26000);assert.equal(clock.lowerBound(),25978);
 clock.reset();assert.equal(clock.now(),wall);assert(!clock.ready);
});
test('safe clock never crosses a deadline early within the observed round-trip interval',()=>{
 for(const rtt of [2,20,150,2000]){let mono=rtt;const clock=createSessionClock({mono:()=>mono,wall:()=>0});clock.observe(50000,0,rtt);for(let delta=0;delta<30000;delta+=75){mono=rtt+delta;assert(clock.lowerBound()<=50000+delta);}}
});
