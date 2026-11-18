import test from 'node:test';
import assert from 'node:assert/strict';
import {createTransitionRetry,timingWait} from '../src/transition-retry.js';
test('unchanged successful responses cannot create an unlimited countdown retry loop',()=>{
 let clock=0;const retry=createTransitionRetry({now:()=>clock});
 assert(retry.begin('guest:q1:next'));assert(!retry.begin('guest:q1:next'));
 clock=1000;assert(retry.begin('guest:q1:next'));clock=2999;assert(!retry.begin('guest:q1:next'));
 clock=3000;assert(retry.begin('guest:q1:next'));assert(retry.exhausted('guest:q1:next'));
 clock=1000000;assert(!retry.begin('guest:q1:next'));
 assert(retry.begin('guest:q2:next'));assert(!retry.exhausted('guest:q2:next'));
 retry.reset();assert(retry.begin('guest:q2:next'));
});
test('only explicit timing waits trigger clock calibration; permission errors stay visible',()=>{
 for(const code of ['room-wait','not-ready','not-expired'])assert(timingWait(Error(code)));
 assert(timingWait({code:'firestore/room-wait'}));
 for(const code of ['permission-denied','unavailable','unauthenticated'])assert(!timingWait({code}));
});
