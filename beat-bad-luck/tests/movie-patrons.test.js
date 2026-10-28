import test from 'node:test';
import assert from 'node:assert/strict';
import {PATRONS,patronBuffs} from '../src/ritual-rewards.js';
import {patronArt} from '../src/celebration-art.js';
import {fresh,collectIdle,readProgress,idleRate,DECOR_LIFETIME,MAX_IDLE_HOURS,reward} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';
const ids=['golden-foot-ming','da-wen-see','ghost-coach','agent-butcher','beggar-so','autumn-fragrance','agent-fat','tai-chi-landlord','justice-bao','god-of-cooking','little-treasure','kungfu-sing'];
const result={score:600,hits:40,papers:2,qte:1,weapon:'bare-hand',fed:true,blessed:true};
test('offline earnings pay through eighteen hours, keep fractional carry and never pay the capped period twice',()=>{
 assert.equal(MAX_IDLE_HOURS,18);const state={...fresh(0),decor:{neon:1},decorExpires:{neon:DECOR_LIFETIME}};assert.equal(idleRate(state),1.2);
 for(const hours of [0,8,12,17.5,18,18.5,24,72]){const outcome=collectIdle(state,hours*3600000),total=Math.min(hours,18)*1.2;assert.equal(outcome.earned,Math.floor(total));assert.ok(Math.abs(outcome.state.idleCarry-(total-Math.floor(total)))<1e-8);const restored=readProgress(JSON.stringify(outcome.state),hours*3600000);assert.equal(collectIdle(restored,hours*3600000).earned,0);assert.equal(outcome.state.decorExpires.neon,DECOR_LIFETIME);}
 const capped=collectIdle(state,24*3600000);assert.equal(capped.earned,21);assert.equal(capped.state.lastSeen,24*3600000);const nextHour=collectIdle(capped.state,25*3600000);assert.equal(nextHour.earned,1);assert.equal(nextHour.state.idleCarry,.8);assert.equal(collectIdle(nextHour.state,0).earned,0);
 const expired=collectIdle({...state,decorExpires:{neon:10*3600000}},24*3600000);assert.equal(expired.earned,12);assert.equal(expired.state.decor.neon,0);assert.deepEqual(expired.lost,['neon']);
});
test('twelve movie-inspired patrons have unique original portraits, bilingual stories and five balanced rarities',()=>{
 assert.equal(PATRONS.length,31);assert.equal(new Set(PATRONS.map(f=>f.id)).size,31);const portraits=[];
 for(const id of ids){const patron=PATRONS.find(f=>f.id===id);assert.ok(patron,id);assert.ok(patron.story.length>30&&patron.storyEn.length>30);assert.ok(patron.name&&patron.nameZh);assert.ok(patron.weight>0);assert.ok(patron.oil<=.05&&patron.merit<=.05&&patron.discount<=.15);const art=patronArt(id);assert.ok(art.includes(`data-patron="${id}"`));assert.ok(!/undefined|NaN|<image|<script/.test(art));portraits.push(art);}
 assert.equal(new Set(portraits).size,12);assert.deepEqual([...new Set(ids.map(id=>PATRONS.find(f=>f.id===id).stars))].sort(),[1,2,3,4,5]);
});
test('all new patrons can be met without replacing old collections and survive reload and backup with their coupons',()=>{
 for(const id of ids){const known=PATRONS.filter(f=>f.id!==id).map(f=>f.id),state={...fresh(0),friends:known},rolls=[.299999,0,.9],outcome=reward(state,result,{id:'movie-'+id,now:1000,random:()=>rolls.shift()});assert.equal(outcome.friend.id,id);assert.deepEqual(state.friends,known);assert.deepEqual(outcome.state.friends,[...known,id]);assert.equal(reward(outcome.state,result,{id:'movie-'+id,random:()=>{throw Error('duplicate encounter');}}),null);
 for(const restored of [readProgress(JSON.stringify(outcome.state),1000),parseBackup(createBackup(outcome.state,1000),1000)]){assert.deepEqual(restored.friends,outcome.state.friends);assert.deepEqual(restored.coupons,outcome.state.coupons);}
 }
});
test('new patrons award their stated buffs on future rituals, keep strongest-category caps and never duplicate an encounter',()=>{
 for(const id of ids){const f=PATRONS.find(p=>p.id===id),state={...fresh(0),friends:[id],coupons:f.discount?[{patron:id,discount:f.discount,uses:1}]:[]};assert.deepEqual(patronBuffs(state),{oil:f.oil,merit:f.merit,discount:f.discount});const outcome=reward(state,result,{id:'buff-'+id,now:1000,random:()=>.9});assert.equal(outcome.earned,Math.round(40*(1+f.oil)));assert.equal(outcome.merit,Math.round(28*(1+f.merit)));assert.equal(outcome.friend,null);assert.deepEqual(outcome.state.friends,[id]);}
 assert.deepEqual(patronBuffs({friends:PATRONS.map(f=>f.id),coupons:[]}),{oil:.05,merit:.05,discount:0});
});
