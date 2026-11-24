import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,RARITIES,DRAW_COST,DUPLICATE_REFUND,rollRarity,purchaseDraw} from '../src/gacha.js';

test('new collection preserves all legacy IDs and provides all four rarity pools',()=>{
 assert.equal(CARDS.length,44);assert.equal(new Set(CARDS.map(c=>c.id)).size,44);
 for(const prefix of ['w','m','d','c'])for(let i=1;i<=3;i++)assert(CARDS.some(c=>c.id===`${prefix}_${i}`&&!c.atlas));
 assert.deepEqual(RARITIES.map(r=>[r.id,CARDS.filter(c=>c.rarity===r.id).length]),[['N',12],['R',12],['SR',10],['SSR',10]]);
 const art=new Set();for(const c of CARDS.filter(c=>c.atlas==='new'))art.add(c.art);assert.equal(art.size,16);
 assert(CARDS.filter(c=>c.rarity==='N').every(c=>c.atlas==='new'&&c.art<8||c.atlas==='pets'&&[0,1,8,9].includes(c.art)));
});
test('fixed rarity boundaries yield exactly 57/30/10/3 percent without ownership bias',()=>{
 const counts={N:0,R:0,SR:0,SSR:0};for(let i=0;i<10000;i++)counts[rollRarity(i/10000)]++;
 assert.deepEqual(counts,{N:5700,R:3000,SR:1000,SSR:300});
 for(const [value,rarity]of [[0,'N'],[.569999,'N'],[.57,'R'],[.869999,'R'],[.87,'SR'],[.969999,'SR'],[.97,'SSR'],[.999999,'SSR']])assert.equal(rollRarity(value),rarity);
});
test('100-SC new-card purchase preserves the source save and other progression',()=>{
 assert.equal(DRAW_COST,100);const state={coins:300,cards:['w_1'],runs:4,bestHp:80};const copy=JSON.stringify(state);
 const draw=purchaseDraw(state,()=>0);assert.equal(draw.card.id,'w_4');assert.equal(draw.duplicate,false);
 assert.equal(draw.save.coins,200);assert.deepEqual(draw.save.cards,['w_1','w_4']);assert.equal(draw.save.runs,4);assert.equal(draw.save.bestHp,80);assert.equal(JSON.stringify(state),copy);
});
test('duplicates refund 25 SC for either legacy-name or ID ownership',()=>{
 assert.equal(DUPLICATE_REFUND,25);
 for(const owned of ['w_4','珍奶續命員']){const draw=purchaseDraw({coins:100,cards:[owned]},()=>0);assert.equal(draw.duplicate,true);assert.equal(draw.save.coins,25);assert.deepEqual(draw.save.cards,[owned])}
});
test('an unaffordable draw consumes neither coins nor randomness',()=>{
 const state={coins:99,cards:[]};assert.equal(purchaseDraw(state,()=>assert.fail('must not roll')),null);assert.deepEqual(state,{coins:99,cards:[]});
});
test('card selection reaches every member of every rarity pool uniformly',()=>{
 const rolls={N:0,R:.57,SR:.87,SSR:.97};
 for(const [rarity,value]of Object.entries(rolls)){
  const pool=CARDS.filter(c=>c.rarity===rarity);
  for(let i=0;i<pool.length;i++){let n=0;const draw=purchaseDraw({coins:100,cards:[]},()=>n++===0?value:(i+.5)/pool.length);assert.equal(draw.card.id,pool[i].id)}
 }
});
test('sixteen breed cards have distinct atlas slots and two of each rarity per pet faction',()=>{
 const pets=CARDS.filter(card=>card.atlas==='pets');
 assert.equal(pets.length,16);assert.deepEqual(pets.map(card=>card.art).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i));
 for(const prefix of ['d_','c_'])for(const rarity of RARITIES)assert.equal(pets.filter(card=>card.id.startsWith(prefix)&&card.rarity===rarity.id).length,2);
 for(const prefix of ['w','m','d','c'])for(let i=1;i<=7;i++)assert(CARDS.some(card=>card.id===`${prefix}_${i}`));
});
