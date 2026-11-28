import test from 'node:test';
import assert from 'node:assert/strict';
import {wallet} from '../src/features-cloud.js';
import {emptyWallet,weekendKey} from '../src/economy.js';
import {hkDay} from '../src/game.js';

test('another device reads the current weekend pass and balance instead of a stale cached wallet',async()=>{
 const day=hkDay(Date.UTC(2026,10,28,4)),current={...emptyWallet('same-player',0),pass:weekendKey(day),passUses:2,revision:3},cached={...current,pass:-1,passUses:5,revision:0};
 const snapshot=value=>({exists:()=>true,data:()=>value}),reads=[];
 const client={db:{},doc:(_,collection,uid)=>collection+'/'+uid,
  getDoc:async ref=>snapshot(ref.startsWith('hkm_wallets/')?cached:{uid:'same-player',total:0}),
  getDocFromServer:async ref=>{reads.push(ref);return snapshot(ref.startsWith('hkm_wallets/')?current:{uid:'same-player',total:100000});}};
 const state=await wallet(client,'same-player');
 assert.equal(state.wallet.pass,current.pass);assert.equal(state.wallet.passUses,2);assert.equal(state.balance,100000);
 assert.deepEqual(reads,['hkm_wallets/same-player','hkm_players/same-player']);
});

test('a failed server wallet read does not fall back to cached ticket ownership',async()=>{
 let cachedReads=0;
 const client={db:{},doc:(_,collection,uid)=>collection+'/'+uid,getDoc:async()=>{cachedReads++;return {exists:()=>true,data:()=>emptyWallet('p',0)};},getDocFromServer:async()=>{throw Object.assign(Error('permission-denied'),{code:'permission-denied'});}};
 await assert.rejects(wallet(client,'p'),{code:'permission-denied'});assert.equal(cachedReads,0);
});
