import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {ANIMALS} from '../src/animals.js';
test('cloud purchase policy accepts every catalog animal at its exact price and full collection size',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),ids=rules.match(/function species\(id\) \{ return id in (\[[^;]+\]);/)[1],owned=rules.match(/p\.owned\.hasOnly\((\[[^;]+?\])\)/)[1],prices=rules.match(/function price\(id\) \{ return (\{[^;]+?\})\[id\];/)[1];
 const parse=value=>JSON.parse(value.replaceAll("'",'"'));assert.deepEqual(parse(ids),ANIMALS.map(a=>a.id));assert.deepEqual(parse(owned),ANIMALS.map(a=>a.id));assert.deepEqual(parse(prices),Object.fromEntries(ANIMALS.map(a=>[a.id,a.price])));assert.equal(Number(rules.match(/p\.owned\.size\(\) <= (\d+)/)[1]),ANIMALS.length);
});
