import test from 'node:test';import assert from 'node:assert/strict';
import {HISTORICAL_SKINS,historicalCostume} from '../src/historical-skins.js';
import {SKINS,skinArt,skinScoreMultiplier} from '../src/skins.js';
import {fresh,buySkin,consumeSkin,skinUses,readProgress} from '../src/progress.js';
import {RitualGame} from '../src/game.js';
test('eight historical satires append after the screen series with ascending final prices and bonuses',()=>{
 assert.deepEqual(SKINS.slice(-8),HISTORICAL_SKINS);assert.equal(SKINS.length,new Set(SKINS.map(s=>s.id)).size);
 assert.deepEqual(HISTORICAL_SKINS.map(s=>s.id),['history-heshen','history-qin-hui','history-zhao-gao','history-qin-shi-huang','history-dong-zhuo','history-king-zhou','history-wang-jingwei','history-hitler']);
 let previous=SKINS.at(-9);for(const s of HISTORICAL_SKINS){assert.ok(s.cost>previous.cost);assert.ok(s.multiplier>previous.multiplier);assert.equal(skinScoreMultiplier(s.id),s.multiplier);assert.equal(s.merit,0);assert.equal(s.series,'history-satire');assert.ok(s.name&&s.nameZh&&s.description&&s.descriptionEn);previous=s;}assert.equal(skinScoreMultiplier('plain'),1);
 assert.deepEqual(HISTORICAL_SKINS.map(s=>s.multiplier),[3.1,3.2,3.35,3.5,3.7,3.9,4.2,4.5]);
});
test('each historical character has unique original props, visible crying and no external artwork',()=>{
 const props=HISTORICAL_SKINS.map(s=>historicalCostume(s.id));assert.equal(new Set(props).size,8);
 for(const s of HISTORICAL_SKINS){const art=skinArt(s.id);assert.match(art,/history-prop/);assert.match(art,/paper-cry-face/);assert.match(art,new RegExp('skin-'+s.id));assert.ok(!art.includes('undefined'));assert.ok(!/<(?:script|image|foreignObject)\b/.test(art));}
 assert.equal(historicalCostume('plain'),'');assert.match(historicalCostume('history-hitler'),/history-peace-bird/);
});
test('every new paper respects affordability, coupons, ten-use wear, rebuy and save migration',()=>{
 for(const item of HISTORICAL_SKINS){assert.equal(buySkin({...fresh(),coins:item.cost-1},item.id),null);let state=buySkin({...fresh(),coins:100000,ownedSkins:['plain','movie-crow'],skinUses:{'movie-crow':6},coupons:[{patron:'star-master',discount:.15,uses:1}]},item.id,{coupon:{index:0,patron:'star-master',discount:.15}});assert.equal(state.coins,100000-Math.ceil(item.cost*.85));assert.equal(state.coupons.length,0);assert.equal(skinUses(state,item.id),10);assert.equal(state.skinUses['movie-crow'],6);const coins=state.coins;state=buySkin(state,item.id);assert.equal(state.coins,coins);
  for(let remaining=9;remaining>=0;remaining--){state=readProgress(JSON.stringify(consumeSkin(state,item.id)));assert.equal(skinUses(state,item.id),remaining);assert.equal(state.skinUses['movie-crow'],6);}assert.equal(state.selectedSkin,'plain');assert.ok(!state.ownedSkins.includes(item.id));assert.equal(skinUses(buySkin({...state,coins:item.cost},item.id),item.id),10);
 }
});
test('historical paper scores use the final multiplier exactly once',()=>{
 let now=1000;for(const s of HISTORICAL_SKINS){const game=new RitualGame({now:()=>now,random:()=>.3});game.start({skin:s.id,weapon:'bare-hand'});game.next();game.next();now+=100;const hit=game.hit({pointer:1});assert.equal(game.scoreMultiplier,s.multiplier);assert.equal(game.skin,s.id);assert.equal(hit.points,Math.round(30*s.multiplier));}
});
