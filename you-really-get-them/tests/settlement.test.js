import test from 'node:test';
import assert from 'node:assert/strict';
import {settleRun} from '../src/settlement.js';

test('settlement pays the exact survival formula and the exclusive death payment',()=>{
 for(const hp of [1,29,30,79,80,100]){
  const r=settleRun(hp,'women');assert.equal(r.coins,100+hp*2);assert.equal(r.base,100);assert.equal(r.hpBonus,hp*2);assert.equal(r.medical,0);assert.equal(r.survived,true);
 }
 const dead=settleRun(0,'cat');assert.equal(dead.coins,10);assert.equal(dead.base,0);assert.equal(dead.hpBonus,0);assert.equal(dead.medical,10);assert.equal(dead.survived,false);
 assert.equal(settleRun(100,'women').coins,300);
});
test('HP title thresholds include 80 and exclude 30 from the low-health tier',()=>{
 for(const faction of ['women','men','dog','cat']){
  assert.equal(settleRun(80,faction).certification,'生物學奇蹟');
  assert.match(settleRun(80,faction).title,/端水藝術家|頂級讀心術大師/);
  assert.equal(settleRun(79,faction).certification,'');assert.equal(settleRun(30,faction).title,'有驚無險生還者');
  assert.match(settleRun(29,faction).title,/沙發邊緣試探者|急救室常客/);assert.match(settleRun(1,faction).quote,/保持低調/);
 }
});
test('every faction gets its own tragedy ending and the same ten-coin medical payment',()=>{
 const endings=new Set();
 for(const faction of ['women','men','dog','cat','duo']){const r=settleRun(0,faction);assert.equal(r.title,'當場社會性死亡');assert.equal(r.coins,10);endings.add(r.quote)}
 assert.equal(endings.size,5);assert.match(settleRun(0,'women').quote,/今晚睡陽台/);assert.match(settleRun(0,'men').quote,/被兄弟笑一輩子/);assert.match(settleRun(0,'cat').quote,/成為貓抓板/);
});
