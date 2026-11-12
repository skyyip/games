import test from 'node:test';import assert from 'node:assert/strict';
import {createPlayerHandle} from '../src/player-handle.js';
import {createPlayerAPI} from '../src/player-api.js';
import {createMemoryFirestore} from './fixtures/player-memory.js';

const client=(memory,uid,newHandle)=>createPlayerAPI({...memory,uid,newHandle,currentUser:()=>({uid,isAnonymous:false})});
test('generated handles use the supported short public-code format and require secure randomness',()=>{
 assert.match(createPlayerHandle(),/^p_[a-km-z2-9]{10}$/);assert.throws(()=>createPlayerHandle({}),/handle-unavailable/);
});
test('a taken random candidate is retried without changing its owner or leaving partial cards',async()=>{
 const mem=createMemoryFirestore(),alice=client(mem,'alice',()=> 'p_shared2222');await alice.publish('阿明');let calls=0;
 const bob=client(mem,'bob',()=>++calls===1?'p_shared2222':'p_unique3333');const card=await bob.publish('阿花');assert.equal(card.handle,'p_unique3333');assert.equal(calls,2);
 assert.equal(mem.records.get('bbl_handles/p_shared2222').data.uid,'alice');assert.equal((await alice.card()).name,'阿明');assert.equal((await alice.find(card.handle)).uid,'bob');
});
test('concurrent first publications reserve distinct codes atomically',async()=>{
 const mem=createMemoryFirestore();let a=0,b=0;const alice=client(mem,'alice',()=>++a===1?'p_shared2222':'p_alice3333'),bob=client(mem,'bob',()=>++b===1?'p_shared2222':'p_bobby4444');
 const cards=await Promise.all([alice.publish('阿明'),bob.publish('阿花')]);assert.notEqual(cards[0].handle,cards[1].handle);assert.equal([...mem.records.keys()].filter(k=>k.startsWith('bbl_handles/')).length,2);
 for(const card of cards)assert.equal(mem.records.get('bbl_handles/'+card.handle).data.uid,card.uid);
});
test('existing legacy handles survive name changes and do not generate a replacement',async()=>{
 const mem=createMemoryFirestore();await client(mem,'alice',()=> 'legacy_friend').publish('舊名字');const api=client(mem,'alice',()=>{throw Error('must-not-regenerate');});
 const updated=await api.publish('新名字');assert.equal(updated.handle,'legacy_friend');assert.equal(updated.name,'新名字');assert.equal((await api.find('legacy_friend')).uid,'alice');
});
test('repeated collisions fail safely after a bounded retry without publishing the new account',async()=>{
 const mem=createMemoryFirestore();await client(mem,'alice',()=> 'p_shared2222').publish('阿明');let calls=0;const bob=client(mem,'bob',()=>{calls++;return 'p_shared2222';});
 await assert.rejects(()=>bob.publish('阿花'),/handle-unavailable/);assert.equal(calls,12);assert.equal(await bob.card(),null);assert.equal(mem.records.get('bbl_handles/p_shared2222').data.uid,'alice');
});
