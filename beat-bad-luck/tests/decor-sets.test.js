import test from 'node:test';
import assert from 'node:assert/strict';
import {DECOR_SETS} from '../src/decor-sets.js';
import {DECOR} from '../src/catalog.js';
import {fresh,claimDecorSet,decorSetReady,readProgress,reward,collectIdle} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';
import {takeGift,receiveGift} from '../src/player-state.js';

const now=Date.now();
function complete(set=DECOR_SETS[0]){const state=fresh(now);for(const id of set.needs){state.decor[id]=1;state.decorExpires[id]=now+86400000;}return state;}
test('twelve categorized sets use real distinct pieces and include both requested pairs',()=>{
 assert.equal(DECOR_SETS.length,12);assert.equal(new Set(DECOR_SETS.map(s=>s.id)).size,12);
 for(const set of DECOR_SETS){assert.ok(set.needs.length>=2);assert.equal(new Set(set.needs).size,set.needs.length);for(const id of set.needs)assert.ok(DECOR.some(d=>d.id===id),id);assert.ok(set.oil>0&&set.merit>0);assert.equal(set.category.length,2);}
 for(const pair of [['tiger','lucky-roast-pig'],['money-tree','lucky-coins']])assert.ok(DECOR_SETS.some(s=>s.needs.length===2&&pair.every(id=>s.needs.includes(id))));
});
test('a complete set pays exact oil and merit once without consuming or rearranging pieces',()=>{
 const state=complete(),set=DECOR_SETS[0],claimed=claimDecorSet(state,set.id,now);
 assert.equal(claimed.coins,set.oil);assert.equal(claimed.merit,set.merit);assert.deepEqual(claimed.decor,state.decor);assert.deepEqual(claimed.neighbourhood.layout,[]);assert.deepEqual(state.decorSetClaims,[]);
 assert.equal(claimDecorSet(claimed,set.id,now),null);assert.equal(claimDecorSet(state,'fake',now),null);
});
test('missing, expired and rolled-back-clock pieces cannot complete a set',()=>{
 const state=complete(),set=DECOR_SETS[0];assert.equal(decorSetReady(fresh(now),set,now),false);state.decorExpires[set.needs[0]]=now;assert.equal(claimDecorSet(state,set.id,now),null);
 state.lastSeen=now+86400000;state.decorExpires[set.needs[0]]=now+1000;assert.equal(claimDecorSet(state,set.id,now-100000),null);
});
test('claim receipts survive saves, backups, gifting and receiving the same piece again',async()=>{
 const set=DECOR_SETS[0],claimed=claimDecorSet(complete(),set.id,now),sent=takeGift(claimed,'d_'+set.needs[0],now),returned=receiveGift(sent.state,sent.item,now);
 for(const state of [readProgress(JSON.stringify(claimed),now),await parseBackup(await createBackup(claimed,now),now),returned]){assert.deepEqual(state.decorSetClaims,[set.id]);assert.equal(claimDecorSet(state,set.id,now),null);}
 const legacy={...fresh(now)};delete legacy.decorSetClaims;assert.deepEqual(readProgress(JSON.stringify(legacy),now).decorSetClaims,[]);
 assert.deepEqual(readProgress(JSON.stringify({...claimed,decorSetClaims:['fake',set.id,set.id]}),now).decorSetClaims,[set.id]);
});
test('six claimed sets unlock the collection title through the real ritual reward path',()=>{
 const state=fresh(now);state.decorSetClaims=DECOR_SETS.slice(0,6).map(s=>s.id);
 const result={score:100,weapon:'bare-hand',kind:'work',hits:3,moves:{tap:3},fed:true,blessed:true};
 const next=reward(state,result,{id:'set-milestone',now:now+1,random:()=>.99});assert.ok(next.state.neighbourhood.challenges.includes('collection-six'));assert.deepEqual(collectIdle(next.state,now+2).state.decorSetClaims,state.decorSetClaims);
});
