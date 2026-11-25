import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTRACTS,evaluateContract,bondStage,advanceProgress} from '../src/progression.js';
import {emptyWallet,rewardWallet,drawWallet,normalizeCards} from '../src/wallet-model.js';
import {CARDS} from '../src/gacha.js';
import {SKILLS} from '../src/companions.js';
import {loadSave,save,setSaveScope,legacyCoins} from '../src/storage.js';
const receipt=(extra={})=>({id:'run_12345678',result:{faction:'women',hp:100,correct:12,coins:300,dimensions:null},completed:12,companionId:'m_1',contractId:'on_time',timeouts:0,hintsUsed:0,skillUsed:false,...extra});
test('contracts award only cosmetic stamps, require all 12 questions and do not penalize failed pledges',()=>{
 for(const contract of CONTRACTS.filter(c=>c.id!=='none')){assert.equal(evaluateContract(contract.id,{completed:12,hp:100}).earned,true);assert.equal(evaluateContract(contract.id,{completed:11,hp:100}).earned,false)}
 assert.equal(evaluateContract('none'),null);assert.equal(evaluateContract('on_time',{completed:12,timeouts:1}).earned,false);assert.equal(evaluateContract('no_hint',{completed:12,hintsUsed:1}).earned,false);assert.equal(evaluateContract('solo',{completed:12,skillUsed:true}).earned,false);assert.equal(evaluateContract('healthy',{completed:12,hp:29}).earned,false);
 for(const contract of CONTRACTS){const next=rewardWallet(emptyWallet(),receipt({contractId:contract.id}),['m_1']);assert.equal(next.wallet.coins,300)}
});
test('all rarity tiers share the 3/10/25 bond thresholds; bonds never change skills, odds or coins',()=>{
 for(const [count,level]of [[0,0],[2,0],[3,1],[9,1],[10,2],[24,2],[25,3],[200,3]])assert.equal(bondStage(count).level,level);
 for(const card of CARDS){const before=JSON.stringify(SKILLS[card.id]);const progress=advanceProgress({bonds:{[card.id]:2},contracts:[]},{completed:12,companionId:card.id,contract:null});assert.equal(progress.bonds[card.id],3);assert.equal(JSON.stringify(SKILLS[card.id]),before)}
 assert.deepEqual(advanceProgress(emptyWallet(),{completed:3,companionId:'m_1'}).bonds,{});
});
test('wallet rewards derive the existing formula, bound inputs and reject incomplete living runs or mismatched rewards',()=>{
 for(const hp of [0,1,29,30,80,100]){const r=receipt({result:{faction:'cat',hp,correct:0,coins:hp?100+hp*2:10}});assert.equal(rewardWallet(emptyWallet(),r,['m_1']).wallet.coins,r.result.coins)}
 assert.throws(()=>rewardWallet(emptyWallet(),receipt({completed:2}),['m_1']));assert.throws(()=>rewardWallet(emptyWallet(),receipt({result:{faction:'women',hp:100,correct:12,coins:99999}}),['m_1']));
 assert.throws(()=>rewardWallet(emptyWallet(),receipt(),[]));
 const paid=rewardWallet(emptyWallet(),receipt({companionId:'w_22',result:{faction:'women',hp:100,correct:12,coins:320}}),['w_22']);assert.equal(paid.wallet.coins,320);assert.equal(paid.operation.delta,320);
});
test('wallet model is immutable, one run adds one bond only, stamps deduplicate, and active assistance excludes ranking',()=>{
 const initial=emptyWallet(),before=JSON.stringify(initial);let first=rewardWallet(initial,receipt(),['m_1']);assert.equal(JSON.stringify(initial),before);assert.equal(first.wallet.bonds.m_1,1);assert.deepEqual(first.wallet.contracts,['on_time']);
 const second=rewardWallet(first.wallet,receipt(),['m_1']);assert.equal(second.wallet.bonds.m_1,2);assert.deepEqual(second.wallet.contracts,['on_time']);assert.equal(second.wallet.coins,600);
 assert.equal(rewardWallet(initial,receipt({skillUsed:true}),['m_1']).operation.ranked,false);
});
test('draw debit/refund and ownership are computed together against latest wallet and legacy ownership names',()=>{
 const wallet={...emptyWallet(),coins:100};const first=drawWallet(wallet,['m_1'],'c_3');assert.equal(first.wallet.coins,0);assert.equal(first.operation.delta,-100);assert(first.cards.includes('c_3'));assert.equal(wallet.coins,100);
 const duplicate=drawWallet(wallet,['仙氣布偶皇'],'c_3');assert.equal(duplicate.wallet.coins,25);assert.equal(duplicate.operation.delta,-75);assert.equal(duplicate.operation.cardName,'仙氣布偶皇');assert.deepEqual(duplicate.cards,['c_3']);assert.throws(()=>drawWallet(emptyWallet(),[],'c_3'),/不足/);assert.throws(()=>drawWallet(wallet,[],'fake'));
 assert.deepEqual(normalizeCards(['仙氣布偶皇','c_3',null]),['c_3']);
});
test('new account storage starts at zero and preserves the previous account file and all guest coins verbatim',()=>{
 const values=new Map([['yrgt-save-v1:a',JSON.stringify({coins:999,cards:['w_2'],runs:8,bestHp:100,equippedCard:'w_2'})],['yrgt-save-v1:guest',JSON.stringify({coins:77,cards:[]})]]);
 globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 try{const old=values.get('yrgt-save-v1:a');setSaveScope('a');assert.equal(loadSave().coins,0);assert.deepEqual(loadSave().cards,['w_2']);assert.equal(legacyCoins(),999);save({...loadSave(),coins:300});assert.equal(values.get('yrgt-save-v1:a'),old);assert.equal(loadSave().coins,300);setSaveScope('b');assert.equal(loadSave().coins,0);setSaveScope(null);assert.equal(loadSave().coins,77)}finally{setSaveScope(null);delete globalThis.localStorage}
});
