import test from 'node:test';
import assert from 'node:assert/strict';
import {purchaseStatus} from '../src/features-cloud.js';
import {emptyWallet,weekendKey,walletAction} from '../src/economy.js';
import {hkDay} from '../src/game.js';
const day=hkDay(Date.UTC(2026,10,28,4)),uid='p',requestId='11111111-1111-4111-8111-111111111111',action={type:'pass',day,requestId};
function fixture({receipt=null,wallet=emptyWallet(uid,0)}={}){
 const reads=[],client={db:{},doc:(_, ...path)=>path.join('/'),getDocFromServer:async ref=>{reads.push(ref);const value=ref.includes('/receipts/')?receipt:ref.startsWith('hkm_wallets/')?wallet:{uid,total:1000000};return {exists:()=>value!==null,data:()=>value};}};
 return {client,reads};
}
test('a server receipt confirms the original payment even after its pass has expired',async()=>{
 const {client,reads}=fixture({receipt:{uid,op:'pass'}}),state=await purchaseStatus(client,uid,action);
 assert(state.confirmed);assert.equal(state.wallet.pass,-1);assert.equal(reads.length,3);assert(reads.every(ref=>ref.includes('/p')));
});
test('an equivalent pass bought on another device clears uncertainty without resetting its uses or spending',async()=>{
 const saved={...emptyWallet(uid,0),pass:weekendKey(day),passUses:2,spent:80000},state=await purchaseStatus(fixture({wallet:saved}).client,uid,action);
 assert(state.confirmed);assert.equal(state.wallet.passUses,2);assert.equal(state.wallet.spent,80000);assert.equal(state.balance,920000);
});
test('a missing receipt without matching entitlement remains unconfirmed',async()=>{
 const state=await purchaseStatus(fixture().client,uid,action);assert.equal(state.confirmed,false);
});
test('retry confirmation uses the purchased day and does not restore an already used attempt',async()=>{
 const wallet={...emptyWallet(uid,0),retryBoughtDay:day,retryUsedDay:day};
 assert((await purchaseStatus(fixture({wallet}).client,uid,{...action,type:'retry-ticket'})).confirmed);
 assert.equal((await purchaseStatus(fixture({wallet}).client,uid,{...action,type:'retry-ticket',day:day+1})).confirmed,false);
 assert.equal(wallet.retryUsedDay,day);
});
test('mismatched receipts and malformed requests are rejected',async()=>{
 for(const receipt of [{uid:'other',op:'pass'},{uid,op:'retry-ticket'}])await assert.rejects(purchaseStatus(fixture({receipt}).client,uid,action),/receipt-mismatch/);
 for(const a of [{...action,type:'swap'},{...action,requestId:'../other'}])await assert.rejects(purchaseStatus(fixture().client,uid,a),/invalid-item/);
});
test('a server failure cannot confirm or purchase a ticket',async()=>{
 const {client}=fixture();client.getDocFromServer=async()=>{throw Object.assign(Error('permission-denied'),{code:'permission-denied'});};
 await assert.rejects(purchaseStatus(client,uid,action),{code:'permission-denied'});
});
test('an unpaid pass request cannot be replayed into another weekend',()=>{
 const wallet=emptyWallet(uid,0);assert.throws(()=>walletAction({total:1000000},wallet,action,day+7),/quote-expired/);
 assert.equal(wallet.spent,0);assert.equal(wallet.pass,-1);
});
test('a confirmed draw returns its original result; an unconfirmed draw is never inferred from owned cards',async()=>{
 const a={...action,type:'draw'},wallet={...emptyWallet(uid,0),cards:{tram:1},draws:1};
 const result=await purchaseStatus(fixture({wallet,receipt:{uid,op:'draw',item:'tram'}}).client,uid,a);
 assert(result.confirmed);assert.equal(result.outcome,'tram');assert.equal(result.wallet.draws,1);
 assert.equal((await purchaseStatus(fixture({wallet}).client,uid,a)).confirmed,false);
});
test('gear and equip receipts must match the requested item or slot',async()=>{
 for(const [a,receipt]of [[{type:'buy',id:'frame-rwb'},{uid,op:'buy',item:'frame-gold'}],[{type:'equip',slot:'frame'},{uid,op:'equip',item:'theme'}]])await assert.rejects(purchaseStatus(fixture({receipt}).client,uid,{...action,...a}),/receipt-mismatch/);
});
