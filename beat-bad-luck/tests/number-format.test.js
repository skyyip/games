import test from 'node:test';
import assert from 'node:assert/strict';
import {formatNumber} from '../src/number-format.js';
import {WEAPONS,DECOR,weaponScoreMultiplier} from '../src/catalog.js';
import {SKINS} from '../src/skins.js';
test('display numbers round to at most two decimals without trailing zeroes',()=>{
 for(const [value,expected]of [[4.9399999999999995,'4.94'],[1.3199999999999998,'1.32'],[2.2800000000000002,'2.28'],[1.005,'1.01'],[1.2,'1.2'],[0,'0'],[-.004,'0'],[-1.235,'-1.24'],[1e-7,'0'],[15123.456,'15123.46']])assert.equal(formatNumber(value),expected);
});
test('locale grouping is explicit and invalid numbers never leak into labels',()=>{
 assert.equal(formatNumber(12345.678,{locale:'zh-Hant',grouping:true}),'12,345.68');
 assert.equal(formatNumber(12345.6,{locale:'en',grouping:true}),'12,345.6');
 assert.equal(formatNumber(Infinity),'—');assert.equal(formatNumber(NaN),'—');
});
test('every catalogue rate and multiplier displays safely without changing its source value',()=>{
 const values=[...WEAPONS.map(w=>weaponScoreMultiplier(w.id)),...DECOR.map(d=>d.rate),...SKINS.map(s=>s.multiplier)],before=structuredClone(values);
 for(const value of values)assert.match(formatNumber(value),/^-?\d+(?:\.\d{1,2})?$/);
 assert.deepEqual(values,before);assert.equal(formatNumber(weaponScoreMultiplier('bare-hand')),'1');
});
