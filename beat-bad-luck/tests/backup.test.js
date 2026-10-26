import test from 'node:test';import assert from 'node:assert/strict';
import {createBackup,parseBackup} from '../src/backup.js';
import {fresh,buyWeapon,consumeWeapon,readProgress} from '../src/progress.js';
test('portable backup round-trips balances, remaining uses, records, stall expiry and collections',()=>{
 let state=buyWeapon({...fresh(100),coins:10000,merit:9000},'paper');state=consumeWeapon(state,'paper');state.decor.cat=2;state.decorExpires.cat=100000;state.records=[{score:999,hits:10,weapon:'paper',date:1}];state.neighbourhood.title='rhythm';
 const exported=createBackup(state,200);assert.deepEqual(parseBackup(exported,200),readProgress(JSON.stringify(state),200));assert.equal(parseBackup(exported,200).weaponUses.paper,1);assert.equal(parseBackup(exported,200).decorExpires.cat,100000);
});
test('invalid, unrelated, oversized or unsupported files are rejected instead of resetting progress',()=>{
 for(const raw of ['', 'null','{}','not json','[]',JSON.stringify({game:'another',format:1,progress:fresh(0)}),JSON.stringify({game:'beat-bad-luck',format:2,progress:fresh(0)}),JSON.stringify({game:'beat-bad-luck',format:1,progress:{version:1}}),' '.repeat(262145)])assert.throws(()=>parseBackup(raw,0));
});
test('legacy kits receive two uses; empty or invalid counters cannot revive spent inventory',()=>{
 const legacy=readProgress(JSON.stringify({version:1,owned:['paper'],equipped:'paper'}),0);assert.equal(legacy.weaponUses.paper,2);
 const spent=readProgress(JSON.stringify({...legacy,weaponUses:{paper:0,unknown:100}}),0);assert.ok(!spent.owned.includes('paper'));assert.equal(spent.equipped,'bare-hand');assert.deepEqual(spent.weaponUses,{});
 assert.equal(readProgress(JSON.stringify({...legacy,weaponUses:{paper:100}}),0).weaponUses.paper,2);
});
