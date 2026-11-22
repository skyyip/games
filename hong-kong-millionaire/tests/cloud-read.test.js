import test from 'node:test';
import assert from 'node:assert/strict';
import {readServer} from '../src/cloud-read.js';
test('a transient read retries the same document and returns only a server response',async()=>{
 let calls=0;const c={getDocFromServer:async ref=>{assert.equal(ref,'run');if(++calls===1)throw {code:'firestore/unavailable'};return 'saved';}};
 assert.equal(await readServer(c,'run'),'saved');assert.equal(calls,2);
});
test('permission errors fail once; persistent network errors stop after three reads',async()=>{
 for(const [code,expected]of [['permission-denied',1],['unavailable',3]]){
  let calls=0;await assert.rejects(readServer({getDocFromServer:async()=>{calls++;throw Object.assign(Error(code),{code});}},'run'),e=>e.code===code);
  assert.equal(calls,expected);
 }
});
