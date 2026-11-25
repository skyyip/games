import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {firebaseSDKSource} from './fixtures/firebase-sdk.mjs';
let version=0;
const snap=value=>({exists:()=>value!==undefined,data:()=>value});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(t,user={uid:'owner',displayName:'玩家',isAnonymous:false}){
 const documents={},state={documents,calls:[],reads:[],writes:[],restore:()=>user,readProfile:ref=>Promise.resolve(snap(documents[ref]))};globalThis.__yrgtFirebase=state;
 const id=++version,sdkURL=`data:text/javascript,${encodeURIComponent(firebaseSDKSource)}#wallet-${id}`;
 const hook=registerHooks({resolve(specifier,context,next){return specifier.startsWith('https://www.gstatic.com/firebasejs/')?{url:sdkURL,shortCircuit:true}:next(specifier,context)}});
 t.after(()=>{hook.deregister();delete globalThis.__yrgtFirebase});
 const cloud=await import(`../src/firebase/cloud.js?wallet-test=${id}`);await cloud.initCloud();await flush();return {cloud,state,documents};
}
const receipt=(id='run_12345678',extra={})=>({id,result:{faction:'women',hp:100,correct:12,coins:300,dimensions:null},completed:12,companionId:'m_1',contractId:'on_time',timeouts:0,hintsUsed:0,skillUsed:false,...extra});
test('wallet starts at zero independently of legacy profile coins and adds the same two free starters',async t=>{
 const {cloud,documents}=await setup(t);documents['users/owner'].coins=9999;
 const first=await cloud.initializeCloudWallet('owner');assert.equal(first.wallet.coins,0);assert.deepEqual(first.cards,['w_1','m_1']);assert.equal(documents['users/owner'].coins,9999);
 const next=await cloud.initializeCloudWallet('owner');assert.equal(next.wallet.revision,0);assert.equal(next.wallet.coins,0);
});
test('same receipt submitted concurrently credits once, with history, bond, stamp and leaderboard in the same commit',async t=>{
 const {cloud,documents,state}=await setup(t);await cloud.initializeCloudWallet('owner');state.writes=[];
 const outcomes=await Promise.all([cloud.settleCloudWallet(receipt(),'owner'),cloud.settleCloudWallet(receipt(),'owner')]);
 assert.equal(outcomes.filter(result=>result.applied).length,1);assert.equal(documents['users/owner/wallet/main'].coins,300);assert.equal(documents['users/owner/wallet/main'].bonds.m_1,1);assert.deepEqual(documents['users/owner/wallet/main'].contracts,['on_time']);
 assert.equal(documents['leaderboard/owner_women'].runs,1);assert.equal(documents['users/owner/runs/run_12345678'].coins,300);assert.equal(state.writes.filter(w=>w.ref==='users/owner/walletOps/run_12345678').length,1);
});
test('different device receipts accumulate without lost updates and a replay never repeats a bond level or reward',async t=>{
 const {cloud,documents}=await setup(t);await cloud.initializeCloudWallet('owner');await Promise.all(['run_12345678','run_22345678','run_32345678'].map(id=>cloud.settleCloudWallet(receipt(id),'owner')));
 assert.equal(documents['users/owner/wallet/main'].coins,900);assert.equal(documents['users/owner/wallet/main'].bonds.m_1,3);assert.equal(documents['leaderboard/owner_women'].runs,3);
 await cloud.settleCloudWallet(receipt('run_12345678'),'owner');assert.equal(documents['users/owner/wallet/main'].coins,900);
});
test('spend and card ownership commit together, duplicate refunds exactly 25, and a retry cannot reroll',async t=>{
 const {cloud,documents}=await setup(t);await cloud.initializeCloudWallet('owner');await cloud.settleCloudWallet(receipt(),'owner');
 const first=await cloud.drawCloudWallet({id:'draw_12345678',cardId:'c_3'},'owner');assert.equal(first.wallet.coins,200);assert(first.cards.includes('c_3'));
 const replay=await cloud.drawCloudWallet({id:'draw_12345678',cardId:'w_3'},'owner');assert.equal(replay.wallet.coins,200);assert.equal(replay.card.id,'c_3');
 const duplicate=await cloud.drawCloudWallet({id:'draw_22345678',cardId:'c_3'},'owner');assert.equal(duplicate.wallet.coins,125);assert.equal(duplicate.duplicate,true);assert.equal(documents['users/owner'].favoriteCards.filter(id=>id==='c_3').length,1);
});
test('two simultaneous spends against one remaining draw cannot overdraw or award both cards',async t=>{
 const {cloud,documents}=await setup(t);await cloud.initializeCloudWallet('owner');documents['users/owner/wallet/main'].coins=100;
 const results=await Promise.allSettled([cloud.drawCloudWallet({id:'draw_12345678',cardId:'c_3'},'owner'),cloud.drawCloudWallet({id:'draw_22345678',cardId:'w_3'},'owner')]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(documents['users/owner/wallet/main'].coins,0);assert.equal(documents['users/owner'].favoriteCards.length,3);
});
test('failed transactions leave both balance and cards unchanged; retry uses the original operation',async t=>{
 const {cloud,documents,state}=await setup(t);await cloud.initializeCloudWallet('owner');await cloud.settleCloudWallet(receipt(),'owner');const before=JSON.stringify(documents);state.commitError='unavailable';
 await assert.rejects(cloud.drawCloudWallet({id:'draw_12345678',cardId:'c_3'},'owner'));assert.equal(JSON.stringify(documents),before);state.commitError=null;
 await cloud.drawCloudWallet({id:'draw_12345678',cardId:'c_3'},'owner');assert.equal(documents['users/owner/wallet/main'].coins,200);
});
test('actual clue/time assistance saves the receipt but does not touch public ranking',async t=>{
 const {cloud,documents}=await setup(t);await cloud.initializeCloudWallet('owner');await cloud.settleCloudWallet(receipt('run_12345678',{skillUsed:true,contractId:'solo'}),'owner');
 assert.equal(documents['leaderboard/owner_women'],undefined);assert.equal(documents['users/owner/wallet/main'].coins,300);assert.deepEqual(documents['users/owner/wallet/main'].contracts,[]);
});
test('logout or account change prevents old-account operations, and anonymous users have no account wallet',async t=>{
 const {cloud,state,documents}=await setup(t);await cloud.initializeCloudWallet('owner');state.emit({uid:'other',isAnonymous:false});await flush();await assert.rejects(cloud.settleCloudWallet(receipt(),'owner'),/原帳戶/);assert.equal(documents['users/owner/wallet/main'].coins,0);
 state.emit({uid:'guest',isAnonymous:true});await flush();await assert.rejects(cloud.initializeCloudWallet('guest'),/登入/);assert.equal(documents['users/guest/wallet/main'],undefined);
});


test('cached card ownership merges safely at wallet initialization while all old coin totals stay excluded',async t=>{
 const {cloud,documents}=await setup(t);const result=await cloud.initializeCloudWallet('owner',['名偵探女友','w_2','c_3']);assert.equal(result.wallet.coins,0);assert.deepEqual(result.cards,['w_2','c_3','w_1','m_1']);assert.deepEqual(documents['users/owner'].favoriteCards,result.cards);
});
