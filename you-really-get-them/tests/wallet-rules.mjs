// Official local Firestore Emulator only; never touches the production project.
import {before,after,beforeEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {CARDS} from '../src/gacha.js';
import {SKILLS} from '../src/companions.js';
import {emptyWallet,rewardWallet,drawWallet,leaderboardUpdate} from '../src/wallet-model.js';
import {walletTransaction} from '../src/firebase/wallet-transaction.js';
const address=process.env.FIRESTORE_EMULATOR_HOST;
if(!/^(127\.0\.0\.1|localhost):\d+$/.test(address||''))throw Error('Set FIRESTORE_EMULATOR_HOST to a local official Firestore Emulator.');
const require=createRequire(process.env.YRGT_RULES_TEST_PACKAGE_JSON?resolve(process.env.YRGT_RULES_TEST_PACKAGE_JSON):new URL('../package.json',import.meta.url));
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const firestore=require('firebase/firestore');
const {doc,setDoc,getDoc,deleteDoc,writeBatch,runTransaction,serverTimestamp}=firestore;
const [host,port]=address.split(':');let environment;
before(async()=>{environment=await initializeTestEnvironment({projectId:'demo-yrgt-wallet',firestore:{host,port:Number(port),rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}})});
beforeEach(async()=>environment.clearFirestore());after(async()=>environment?.cleanup());
const database=(uid='owner',provider='google.com')=>environment.authenticatedContext(uid,{firebase:{sign_in_provider:provider}}).firestore();
const walletRef=db=>doc(db,'users/owner/wallet/main');
async function seed(db,{coins=0,cards=['w_1','m_1','w_22'],bonds={},contracts=[]}={}){
 await setDoc(doc(db,'users/owner'),{displayName:'玩家',photoURL:'',favoriteCards:cards,updatedAt:serverTimestamp()});
 await setDoc(walletRef(db),{...emptyWallet(),updatedAt:serverTimestamp()});
 if(coins||Object.keys(bonds).length||contracts.length)await environment.withSecurityRulesDisabled(async context=>setDoc(doc(context.firestore(),'users/owner/wallet/main'),{...emptyWallet(),coins,bonds,contracts,updatedAt:serverTimestamp()}));
}
const receipt=(extra={})=>({result:{faction:'women',hp:100,correct:12,coins:300,dimensions:null},completed:12,companionId:'m_1',contractId:'on_time',timeouts:0,hintsUsed:0,skillUsed:false,...extra});
function stageRun(db,batch,id,before,payload,modify=()=>{}){
 const next=rewardWallet(before,payload,['w_1','m_1','w_22']);
 const state={wallet:{...next.wallet,lastOperation:id,updatedAt:serverTimestamp()},op:{...next.operation,createdAt:serverTimestamp()},run:{faction:payload.result.faction,mode:'mixed',questionCount:12,dimensions:null,survived:payload.result.hp>0,hp:payload.result.hp,coins:payload.result.coins,correct:payload.result.correct,createdAt:serverTimestamp()}};
 modify(state);batch.set(walletRef(db),state.wallet);batch.set(doc(db,'users/owner/walletOps',id),state.op);batch.set(doc(db,'users/owner/runs',id),state.run);return state;
}
async function commitRun(db,id='run_12345678',payload=receipt(),modify){const before=(await getDoc(walletRef(db))).data(),batch=writeBatch(db);stageRun(db,batch,id,before,payload,modify);return batch.commit()}
async function commitDraw(db,id='draw_12345678',cardId='c_3',modify=()=>{}){
 const before=(await getDoc(walletRef(db))).data(),profile=(await getDoc(doc(db,'users/owner'))).data();
 const next=drawWallet(before,profile.favoriteCards,cardId),state={wallet:{...next.wallet,lastOperation:id,updatedAt:serverTimestamp()},op:{...next.operation,createdAt:serverTimestamp()},cards:next.duplicate?profile.favoriteCards:[...profile.favoriteCards,cardId]};modify(state);
 const batch=writeBatch(db);batch.set(walletRef(db),state.wallet);batch.set(doc(db,'users/owner/walletOps',id),state.op);batch.set(doc(db,'users/owner'),{favoriteCards:state.cards,updatedAt:serverTimestamp()},{merge:true});return batch.commit();
}
test('wallet creation is zero-only with no arbitrary bonds, stamps or profile coin field',async()=>{
 const db=database();await assertFails(setDoc(walletRef(db),{...emptyWallet(),coins:500,updatedAt:serverTimestamp()}));await assertFails(setDoc(walletRef(db),{...emptyWallet(),bonds:{m_1:25},updatedAt:serverTimestamp()}));
 await assertSucceeds(setDoc(walletRef(db),{...emptyWallet(),updatedAt:serverTimestamp()}));await assertFails(setDoc(doc(db,'users/owner'),{displayName:'玩家',photoURL:'',coins:500,updatedAt:serverTimestamp()}));
});
test('unauthenticated, other-account and anonymous users cannot read or write the account wallet',async()=>{
 const db=database();await seed(db);
 for(const client of [environment.unauthenticatedContext().firestore(),database('other'),database('owner','anonymous')]){await assertFails(getDoc(walletRef(client)));await assertFails(setDoc(walletRef(client),{...emptyWallet(),updatedAt:serverTimestamp()}))}
});
test('direct balance edits, standalone ledger records and missing run receipts are denied',async()=>{
 const db=database();await seed(db);await assertFails(setDoc(walletRef(db),{...emptyWallet(),coins:300,revision:1,lastOperation:'run_12345678',updatedAt:serverTimestamp()}));
 const next=rewardWallet(emptyWallet(),receipt(),['m_1']);await assertFails(setDoc(doc(db,'users/owner/walletOps/run_12345678'),{...next.operation,createdAt:serverTimestamp()}));
 const batch=writeBatch(db);batch.set(walletRef(db),{...next.wallet,lastOperation:'run_12345678',updatedAt:serverTimestamp()});batch.set(doc(db,'users/owner/walletOps/run_12345678'),{...next.operation,createdAt:serverTimestamp()});await assertFails(batch.commit());
});
test('a legitimate settlement atomically credits the formula, one bond, one stamp and matching history',async()=>{
 const db=database();await seed(db);await assertSucceeds(commitRun(db));const wallet=(await getDoc(walletRef(db))).data();assert.equal(wallet.coins,300);assert.equal(wallet.bonds.m_1,1);assert.deepEqual(wallet.contracts,['on_time']);assert.equal((await getDoc(doc(db,'users/owner/runs/run_12345678'))).data().coins,300);
});
test('replaying a receipt, changing an old ledger entry, deleting a wallet or restoring zero are denied',async()=>{
 const db=database();await seed(db);await commitRun(db);await assertFails(commitRun(db));await assertFails(setDoc(doc(db,'users/owner/walletOps/run_12345678'),{kind:'draw'}));await assertFails(deleteDoc(doc(db,'users/owner/walletOps/run_12345678')));await assertFails(deleteDoc(walletRef(db)));await assertFails(setDoc(walletRef(db),{...emptyWallet(),updatedAt:serverTimestamp()}));assert.equal((await getDoc(walletRef(db))).data().coins,300);
});
test('forged amount, revision or unrelated bond changes are rejected without partial writes',async()=>{
 const db=database();await seed(db);
 for(const mutate of [s=>{s.wallet.coins=999;s.op.delta=999;s.run.coins=999},s=>{s.wallet.revision=2;s.op.revision=2},s=>{s.wallet.bonds.m_1=25},s=>{s.wallet.bonds.c_3=1},s=>{s.wallet.bonds.unknown_card=1}])await assertFails(commitRun(db,'run_12345678',receipt(),mutate));
 assert.equal((await getDoc(walletRef(db))).data().coins,0);
});
test('early death pays only ten and never gains a bond or contract stamp',async()=>{
 const db=database();await seed(db);const dead=receipt({result:{faction:'cat',hp:0,correct:0,coins:10},completed:1});await assertSucceeds(commitRun(db,'run_12345678',dead));let wallet=(await getDoc(walletRef(db))).data();assert.equal(wallet.coins,10);assert.deepEqual(wallet.bonds,{});assert.deepEqual(wallet.contracts,[]);
 await assertFails(commitRun(db,'run_22345678',dead,s=>{s.wallet.bonds.m_1=1}));
});
test('an unfinished living run cannot award survival currency',async()=>{
 const db=database();await seed(db);const batch=writeBatch(db);stageRun(db,batch,'run_12345678',emptyWallet(),receipt(),s=>{s.op.completed=1;s.run.correct=1});await assertFails(batch.commit());
});
test('passive stipend can add twenty on survival but active cards cannot claim it',async()=>{
 const db=database();await seed(db);await assertSucceeds(commitRun(db,'run_12345678',receipt({companionId:'w_22',result:{faction:'women',hp:100,correct:12,coins:320}})));assert.equal((await getDoc(walletRef(db))).data().coins,320);
 await assertFails(commitRun(db,'run_22345678',receipt(),s=>{s.wallet.coins+=20;s.op.delta+=20;s.run.coins+=20}));
});
test('a run cannot claim an unowned teammate or its stipend',async()=>{
 const db=database();await seed(db,{cards:['w_1']});await assertFails(commitRun(db));
 const bonus=receipt({companionId:'w_22',result:{faction:'women',hp:100,correct:12,coins:320}});await assertFails(commitRun(db,'run_12345678',bonus));
 await setDoc(doc(db,'users/owner'),{favoriteCards:['w_22'],updatedAt:serverTimestamp()},{merge:true});await assertSucceeds(commitRun(db,'run_12345678',bonus));assert.equal((await getDoc(walletRef(db))).data().coins,320);
});
test('contract stamps must match the actual counters and cannot replace earlier stamps',async()=>{
 const db=database();await seed(db);
 for(const change of [{contractId:'on_time',timeouts:1},{contractId:'no_hint',hintsUsed:1},{contractId:'solo',skillUsed:true},{contractId:'healthy',result:{faction:'women',hp:29,correct:12,coins:158}}])await assertFails(commitRun(db,'run_12345678',receipt(change),s=>{s.op.contractEarned=true;s.wallet.contracts=[s.op.contractId]}));
 await commitRun(db);await assertFails(commitRun(db,'run_22345678',receipt({contractId:'no_hint'}),s=>{s.wallet.contracts=['no_hint']}));
});
test('draw writes debit and ownership together, validates the card and gives the exact duplicate refund',async()=>{
 const db=database();await seed(db,{coins:300});await assertSucceeds(commitDraw(db));assert.equal((await getDoc(walletRef(db))).data().coins,200);assert((await getDoc(doc(db,'users/owner'))).data().favoriteCards.includes('c_3'));
 await assertSucceeds(commitDraw(db,'draw_22345678'));assert.equal((await getDoc(walletRef(db))).data().coins,125);
});
test('missing card, extra cards, incorrect names or an invented refund cannot accompany a debit',async()=>{
 const db=database();await seed(db,{coins:300});
 for(const change of [s=>{s.cards=['w_1','m_1','w_22']},s=>{s.cards.push('w_3')},s=>{s.op.cardName='wrong'},s=>{s.op.duplicate=true;s.op.delta=-75;s.wallet.coins=225}])await assertFails(commitDraw(db,'draw_12345678','c_3',change));
 assert.equal((await getDoc(walletRef(db))).data().coins,300);
});
test('a duplicate still requires the full 100-SC price before its 25-SC refund',async()=>{
 const db=database();await seed(db,{coins:75,cards:['w_1','m_1','c_3']});const batch=writeBatch(db);
 batch.set(walletRef(db),{...emptyWallet(),coins:0,revision:1,lastOperation:'draw_12345678',updatedAt:serverTimestamp()});batch.set(doc(db,'users/owner/walletOps/draw_12345678'),{kind:'draw',delta:-75,revision:1,cardId:'c_3',cardName:'仙氣布偶皇',duplicate:true,createdAt:serverTimestamp()});await assertFails(batch.commit());
});
test('real concurrent reward transactions deduplicate the same operation and add different operations without lost updates',async()=>{
 const db=database();await seed(db);
 const claim=id=>walletTransaction({fs:firestore,db,uid:'owner',id,kind:'run'},async(tx,{wallet})=>{const boardRef=doc(db,'leaderboard/owner_women'),board=await tx.get(boardRef);stageRun(db,tx,id,wallet,receipt());tx.set(boardRef,{...leaderboardUpdate(board.exists()?board.data():null,receipt().result,{uid:'owner',displayName:'玩家'}),updatedAt:serverTimestamp()});return {applied:true}});
 await Promise.all([claim('run_12345678'),claim('run_12345678')]);assert.equal((await getDoc(walletRef(db))).data().coins,300);
 await Promise.all([claim('run_22345678'),claim('run_32345678')]);const after=(await getDoc(walletRef(db))).data();assert.equal(after.coins,900);assert.equal(after.bonds.m_1,3);assert.equal((await getDoc(doc(db,'leaderboard/owner_women'))).data().runs,3);
});
test('real concurrent draws against one balance cannot overdraw or award two cards',async()=>{
 const db=database();await seed(db,{coins:100});
 const draw=(id,cardId)=>walletTransaction({fs:firestore,db,uid:'owner',id,kind:'draw'},async(tx,{walletRef,opRef,profileRef,wallet,profile})=>{const next=drawWallet(wallet,profile.favoriteCards,cardId);tx.set(walletRef,{...next.wallet,lastOperation:id,updatedAt:serverTimestamp()});tx.set(opRef,{...next.operation,createdAt:serverTimestamp()});tx.set(profileRef,{favoriteCards:next.cards,updatedAt:serverTimestamp()},{merge:true});return {applied:true}});
 const outcomes=await Promise.allSettled([draw('draw_12345678','c_3'),draw('draw_22345678','w_3')]);assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal((await getDoc(walletRef(db))).data().coins,0);assert.equal((await getDoc(doc(db,'users/owner'))).data().favoriteCards.length,4);
});

test('all forty-eight recent cards can be bought with their matching names and normal debit',async()=>{
 const db=database();await seed(db,{coins:4800});
 for(const [i,card]of CARDS.filter(c=>['night','commute','outing'].includes(c.atlas)).entries())await assertSucceeds(commitDraw(db,'draw_night_'+String(i).padStart(8,'0'),card.id));
 assert.equal((await getDoc(walletRef(db))).data().coins,0);
 const cards=(await getDoc(doc(db,'users/owner'))).data().favoriteCards;
 for(const card of CARDS.filter(c=>['night','commute','outing'].includes(c.atlas)))assert(cards.includes(card.id));
});
test('recent teammates settle the unchanged reward and gain exactly one cosmetic bond',async()=>{
 const db=database(),cards=CARDS.filter(c=>['night','commute','outing'].includes(c.atlas));await seed(db,{cards:cards.map(c=>c.id)});
 let total=0;
 for(const [i,card]of cards.entries()){
  const amount=SKILLS[card.id].kind==='bonus'?320:300,payload=receipt({companionId:card.id,result:{faction:'women',hp:100,correct:12,coins:amount}}),id='run_night_'+String(i).padStart(8,'0');
  const before=(await getDoc(walletRef(db))).data(),next=rewardWallet(before,payload,cards.map(c=>c.id)),batch=writeBatch(db);
  batch.set(walletRef(db),{...next.wallet,lastOperation:id,updatedAt:serverTimestamp()});batch.set(doc(db,'users/owner/walletOps',id),{...next.operation,createdAt:serverTimestamp()});batch.set(doc(db,'users/owner/runs',id),{faction:'women',mode:'mixed',questionCount:12,dimensions:null,survived:true,hp:100,coins:amount,correct:12,createdAt:serverTimestamp()});await assertSucceeds(batch.commit());total+=amount;
 }
 const wallet=(await getDoc(walletRef(db))).data();assert.equal(wallet.coins,total);assert.deepEqual(Object.values(wallet.bonds),Array(48).fill(1));
});
