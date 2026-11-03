import test from 'node:test';
import assert from 'node:assert/strict';
import {PendingResults} from '../src/pending.js';
const run=(uid='alice',id='run-1')=>({uid,id,score:20,animal:'frog'});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};

test('legacy pending results migrate without mixing accounts',()=>{
 const queue=new PendingResults(JSON.stringify(run()));
 queue.add(run('bob','run-2'));
 const restored=new PendingResults(JSON.stringify(queue.runs));
 assert.deepEqual(restored.get('alice'),run());
 assert.deepEqual(restored.get('bob'),run('bob','run-2'));
 assert.equal(restored.get('guest'),null);
});
test('invalid saved results and duplicate run identities are ignored',()=>{
 for(const raw of ['oops','null','{}',JSON.stringify({id:'',uid:'alice',score:0}),JSON.stringify({...run(),score:1.5})])assert.deepEqual(new PendingResults(raw).runs,[]);
 assert.equal(new PendingResults(JSON.stringify([run(),run(),{...run(),score:-1}])).runs.length,1);
});
test('concurrent retries share one request and remove only the settled account',async()=>{
 const queue=new PendingResults(JSON.stringify([run(),run('bob','run-2')])),gate=deferred();let calls=0;
 const send=()=>{calls++;return gate.promise;};
 const first=queue.settle('alice',send),second=queue.settle('alice',send);
 assert.equal(first,second);await Promise.resolve();assert.equal(calls,1);
 gate.resolve({reward:51});assert.deepEqual(await first,{reward:51});await second;
 assert.equal(queue.get('alice'),null);assert.deepEqual(queue.get('bob'),run('bob','run-2'));
});
test('offline and wrong-account failures preserve results for retry',async()=>{
 const queue=new PendingResults(JSON.stringify(run()));
 for(const reason of ['unavailable','wrong-player']){
  await assert.rejects(queue.settle('alice',()=>Promise.reject(Error(reason))),new RegExp(reason));
  assert.deepEqual(queue.get('alice'),run());
 }
 await queue.settle('alice',()=>({reward:51}));assert.equal(queue.get('alice'),null);
});
test('permanent run failures remove that run while keeping another account',async()=>{
 for(const reason of ['run-missing','run-replaced']){
  const queue=new PendingResults(JSON.stringify([run(),run('bob','run-2')]));
  await assert.rejects(queue.settle('alice',()=>{throw Error(reason);}),new RegExp(reason));
  assert.equal(queue.get('alice'),null);assert.deepEqual(queue.get('bob'),run('bob','run-2'));
 }
});
test('settling an older result preserves a result added while the request is running',async()=>{
 const queue=new PendingResults(JSON.stringify(run())),gate=deferred();
 const request=queue.settle('alice',()=>gate.promise);
 queue.add(run('alice','run-2'));gate.resolve({reward:51});await request;
 assert.deepEqual(queue.get('alice'),run('alice','run-2'));
});
test('an account with no result never sends another player’s result',async()=>{
 const queue=new PendingResults(JSON.stringify(run()));
 assert.equal(await queue.settle('bob',()=>assert.fail('sent foreign result')),null);
 assert.deepEqual(queue.get('alice'),run());
});

test('platform bonus coins survive save, reload and settlement after upstream integration',async()=>{
 const result={...run(),bonusCoins:6},queue=new PendingResults(JSON.stringify(result));
 const restored=new PendingResults(JSON.stringify(queue.runs));
 await restored.settle('alice',receipt=>{assert.deepEqual(receipt,result);return {reward:57};});
 for(const bonusCoins of [-1,1.5,61])assert.deepEqual(new PendingResults(JSON.stringify({...run(),bonusCoins})).runs,[]);
});
