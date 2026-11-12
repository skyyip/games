import test from 'node:test';import assert from 'node:assert/strict';
import {createMemoryFirestore} from './fixtures/player-memory.js';
import {createLeaderboardAPI,bestScoreRecord} from '../src/leaderboard.js';
import {createPlayerAPI} from '../src/player-api.js';
import {fresh} from '../src/progress.js';

async function setup(){let now=1000,user={uid:'alice',isAnonymous:false};const memory=createMemoryFirestore(()=>now),board=createLeaderboardAPI({...memory,currentUser:()=>user}),save=createPlayerAPI({...memory,uid:'alice',currentUser:()=>user});let revision=0;
 return {...memory,board,save,signout:()=>{user=null;},advance:ms=>{now+=ms;},saveScore:async(score,name='阿明')=>{const state=fresh(now);state.records=[{score,hits:12,weapon:'bare-hand',date:now}];revision=(await save.save(state,name,revision)).revision;return state;}};
}
test('only valid completed positive-score records qualify',()=>{assert.equal(bestScoreRecord(fresh()),null);assert.equal(bestScoreRecord({records:[{score:0,hits:0,weapon:'bare-hand'}]}),null);assert.equal(bestScoreRecord({records:[{score:NaN,hits:1,weapon:'bare-hand'}]}),null);assert.equal(bestScoreRecord({records:[{score:50,hits:2,weapon:'fake'}]}),null);});
test('publishing is explicit, uses private saved records, and exposes only public score fields',async()=>{
 const t=await setup();await assert.rejects(()=>t.board.submit('阿明'),/score-required/);await t.saveScore(900);
 assert.deepEqual(await t.board.top(),[]);assert.equal(await t.board.mine(),null);await t.board.submit('阿明');const own=await t.board.mine();assert.equal(own.score,900);assert.deepEqual(Object.keys(own).sort(),['achievedAt','hits','id','name','score','uid','updatedAt','weapon'].sort());assert.equal((await t.board.top())[0].rank,1);
});
test('resubmitting cannot lower a score or reset tie order; a genuine new best advances the record',async()=>{
 const t=await setup();await t.saveScore(1000);await t.board.submit('阿明');const first=await t.board.mine();t.advance(10000);await t.saveScore(200);await t.board.submit('新稱呼');const renamed=await t.board.mine();assert.equal(renamed.score,1000);assert.equal(renamed.achievedAt.toMillis(),first.achievedAt.toMillis());assert.equal(renamed.name,'新稱呼');
 await t.saveScore(2000);await t.board.submit('新稱呼');const higher=await t.board.mine();assert.equal(higher.score,2000);assert.ok(higher.achievedAt.toMillis()>first.achievedAt.toMillis());
});
test('public top fifty use descending score then earliest submission and never need login',async()=>{
 const t=await setup();for(let i=0;i<55;i++)t.records.set('bbl_scores/player-'+i,{version:1,data:{uid:'player-'+i,name:'玩家'+i,score:i<3?9999:i,hits:1,weapon:'bare-hand',achievedAt:{toMillis:()=>i},updatedAt:{toMillis:()=>i}}});t.signout();const rows=await t.board.top();assert.equal(rows.length,50);assert.deepEqual(rows.slice(0,3).map(r=>r.uid),['player-0','player-1','player-2']);assert.equal(rows[3].score,54);await assert.rejects(()=>t.board.submit('冒認'),/signin/);
});
test('leaving keeps private progress and prevents stale automatic submissions on another device',async()=>{
 const t=await setup();await t.saveScore(700);await t.board.submit('阿明');await t.board.remove();assert.equal(await t.board.mine(),null);assert.equal((await t.save.load()).state.records[0].score,700);await assert.rejects(()=>t.board.submit('阿明',{requireExisting:true}),/score-opted-out/);assert.deepEqual(await t.board.top(),[]);
 await t.board.submit('阿明');assert.equal((await t.board.mine()).score,700);
});
