import test from 'node:test';
import assert from 'node:assert/strict';
import {PATRONS,patronBuffs,patronBuffText} from '../src/ritual-rewards.js';
import {fresh,readProgress,reward,collectIdle,dailyReward,DECOR_LIFETIME} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';

const result={score:60000,hits:100,papers:20,qte:80,weapon:'bare-hand',fed:true,blessed:true};
const patrons=['sweeper','star-master'];
test('same-category patron bonuses add, count each known patron once and have no old five-percent ceiling',()=>{
 assert.deepEqual(patronBuffs({friends:patrons}),{oil:.035,merit:.035,discount:0});
 assert.deepEqual(patronBuffs({friends:[...patrons,'waiter']}),{oil:.04,merit:.035,discount:0});
 assert.deepEqual(patronBuffs({friends:[...patrons,...patrons,'unknown']}),{oil:.035,merit:.035,discount:0});
 assert.deepEqual(patronBuffs({}),{oil:0,merit:0,discount:0});
});
test('stacked bonuses pay the actual ritual oil and merit amounts and cannot pay a receipt twice',()=>{
 const state={...fresh(0),coins:100,merit:200,friends:patrons},out=reward(state,result,{id:'stacked-reward',now:1,random:()=>.9});
 assert.equal(out.earned,341);assert.equal(out.merit,168);assert.equal(out.state.coins,441);assert.equal(out.state.merit,368);
 assert.equal(state.coins,100);assert.equal(state.merit,200);assert.equal(reward(out.state,result,{id:'stacked-reward'}),null);
});
test('existing patron collections gain stacking after reload and backup without changing balances, coupons, daily or idle pay',()=>{
 const state={...fresh(0),coins:100,merit:200,friends:patrons,coupons:[{patron:'star-master',discount:.25,uses:1}],decor:{neon:1},decorExpires:{neon:DECOR_LIFETIME}};
 for(const restored of [readProgress(JSON.stringify(state),0),parseBackup(createBackup(state,0),0)]){
  assert.deepEqual(patronBuffs(restored),{oil:.035,merit:.035,discount:.25});assert.equal(restored.coins,100);assert.equal(restored.merit,200);assert.deepEqual(restored.coupons,state.coupons);
  assert.equal(collectIdle(restored,18*3600000).earned,6);const daily=dailyReward(restored,0);assert.equal(daily.coins-restored.coins,6);assert.equal(daily.merit-restored.merit,11);
 }
});

test('balanced half-percent patron bonuses retain exact bilingual descriptions and additive totals',()=>{
 for(const [id,oil,merit]of [['waiter',.005,0],['landlady',0,.015],['star-master',.025,.025]]){const p=PATRONS.find(p=>p.id===id);assert.equal(p.oil,oil);assert.equal(p.merit,merit);for(const zh of [true,false]){const description=patronBuffText(p,zh);if(oil)assert.ok(description.includes(`+${oil*100}%`));if(merit)assert.ok(description.includes(`+${merit*100}%`));}}
 assert.deepEqual(patronBuffs({friends:PATRONS.map(p=>p.id)}),{oil:.34,merit:.305,discount:0});
});
