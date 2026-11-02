import test from 'node:test';
import assert from 'node:assert/strict';
import {WORRIES,WORRY_GROUPS} from '../src/catalog.js';
import {PATRONS,RETURN_COUPON_CHANCE,patronBuffs} from '../src/ritual-rewards.js';
import {fresh,reward,readProgress,buyWeapon,purchasePrice,MAX_COUPONS} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';
import {RitualGame} from '../src/game.js';
const result={score:600,hits:40,papers:2,qte:1,weapon:'bare-hand',fed:true,blessed:true};
const known=()=>({...fresh(0),friends:PATRONS.map(p=>p.id)});

test('twenty-two new worries cover all eleven categories, play under their own IDs and retain the original forty',()=>{
 const original=WORRIES.slice(0,40),added=WORRIES.slice(40,62);assert.equal(added.length,22);assert.equal(original[0].id,'work');assert.equal(original.at(-1).id,'bad-luck');
 for(const group of WORRY_GROUPS)assert.equal(added.filter(w=>w.group===group.id).length,2);
 for(const worry of added){assert.ok(worry.label&&worry.labelZh&&worry.name);const g=new RitualGame({now:()=>0,random:()=>.4});g.start({kind:worry.id});g.next();g.next();assert.equal(g.kind,worry.id);assert.ok(g.hit());}
});

test('new patron coupons are stronger by rarity while old and new tickets survive saves and portable backups',async()=>{
 for(const p of PATRONS.filter(p=>p.discount)){assert.ok(p.discount>p.legacyDiscount);assert.equal(p.discount,[0,.1,.12,.15,.2,.25][p.stars]);}
 const coupons=[{patron:'bun-aunt',discount:.05,uses:1},{patron:'bun-aunt',discount:.12,uses:1},{patron:'star-master',discount:.15,uses:1},{patron:'star-master',discount:.25,uses:1}];
 const state={...fresh(0),coins:1000,merit:1000,coupons};
 for(const copy of [readProgress(JSON.stringify(state),0),(await parseBackup((await createBackup(state,0)),0))]){assert.deepEqual(copy.coupons,coupons);assert.equal(patronBuffs(copy).discount,.25);}
 const dirty=readProgress(JSON.stringify({...state,coupons:[...coupons,null,{patron:'star-master',discount:.99,uses:1},{patron:'bun-aunt',discount:.25,uses:1},{patron:'fake',discount:.25,uses:1}]}),0);assert.deepEqual(dirty.coupons,coupons);
 for(const [index,price]of [[0,190],[1,176],[2,170],[3,150]]){const coupon={...coupons[index],index};assert.equal(purchasePrice(state,200,coupon),price);const bought=buyWeapon(state,'flipflop',{coupon});assert.equal(bought.coins,1000-price);assert.deepEqual(bought.coupons,coupons.filter((_,i)=>i!==index));}assert.equal(state.coupons.length,4);
});

test('return gifts have a strict 35 percent boundary, work after all patrons are met and never repeat a receipt',()=>{
 assert.equal(RETURN_COUPON_CHANCE,.35);
 for(const [chance,drops]of [[0,true],[.349999,true],[.35,false],[.9,false]]){const rolls=[.9,chance,0],out=reward(known(),result,{id:'return-'+chance,now:1,random:()=>rolls.shift()??.9});assert.equal(Boolean(out.couponGift),drops);assert.equal(out.friend,null);assert.equal(out.state.coupons.length,drops?1:0);assert.equal(out.couponSource,drops?'return':null);if(drops){assert.ok(out.state.friends.includes(out.couponGift.patron));assert.equal(out.couponGift.discount,PATRONS.find(p=>p.id===out.couponGift.patron).discount);}assert.equal(reward(out.state,result,{id:'return-'+chance,random:()=>{throw Error('duplicate gift rolled');}}),null);}
 const rolls=[.9,0,.999999],rare=reward(known(),result,{id:'rare',random:()=>rolls.shift()});assert.equal(rare.couponGift.discount,.25);
});

test('a welcome coupon is not doubled, return coupons need a known eligible patron, and secret odds retain their draw order',()=>{
 const state={...fresh(0),friends:PATRONS.filter(p=>p.id!=='bun-aunt').map(p=>p.id)},rolls=[0,0,.9];let calls=0;const welcome=reward(state,result,{id:'welcome',random:()=>{calls++;return rolls.shift();}});assert.equal(welcome.friend.id,'bun-aunt');assert.equal(welcome.couponSource,'welcome');assert.equal(welcome.state.coupons.length,1);assert.equal(calls,3);
 let draws=0;const no=reward({...fresh(0),friends:['waiter']},result,{id:'no-provider',random:()=>{draws++;return .9;}});assert.equal(no.couponGift,null);assert.equal(draws,2);
 const bothRolls=[.9,.079999,0,0,0],both=reward({...fresh(0),friends:['bun-aunt']},result,{id:'both',random:()=>bothRolls.shift()});assert.equal(both.secret.id,'secret-loudspeaker');assert.equal(both.couponGift.patron,'bun-aunt');assert.equal(both.couponSource,'return');
});

test('repeat tickets above the old patron-count limit persist, and a full pouch never overwrites an existing ticket',async()=>{
 const coupons=Array.from({length:MAX_COUPONS},()=>({patron:'bun-aunt',discount:.12,uses:1})),state={...known(),coupons};
 for(const copy of [readProgress(JSON.stringify(state),0),(await parseBackup((await createBackup(state,0)),0))])assert.deepEqual(copy.coupons,coupons);
 const out=reward(state,result,{id:'full',random:()=>0});assert.equal(out.couponGift,null);assert.deepEqual(out.state.coupons,coupons);
});
