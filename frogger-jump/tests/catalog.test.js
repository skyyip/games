import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {SKILLS,COMPANIONS} from '../src/equipment.js';
import {ANIMALS} from '../src/animals.js';
test('cloud purchase policy accepts every catalog animal at its exact price and full collection size',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),ids=rules.match(/function species\(id\) \{ return id in (\[[^;]+\]);/)[1],owned=rules.match(/p\.owned\.hasOnly\((\[[^;]+?\])\)/)[1],prices=rules.match(/function price\(id\) \{ return (\{[^;]+?\})\[id\];/)[1];
 const parse=value=>JSON.parse(value.replaceAll("'",'"'));assert.deepEqual(parse(ids),ANIMALS.map(a=>a.id));assert.deepEqual(parse(owned),ANIMALS.map(a=>a.id));assert.deepEqual(parse(prices),Object.fromEntries(ANIMALS.map(a=>[a.id,a.price])));assert.equal(Number(rules.match(/p\.owned\.size\(\) <= (\d+)/)[1]),ANIMALS.length);
});

test('equipment allowlists, collection limits and exact prices match all purchasable skills and companions',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 for(const [name,items,key]of [['skills',SKILLS,'skill'],['friends',COMPANIONS,'friend']]){const list=rules.match(new RegExp(name+'\\.hasOnly\\((\\[[^\\]]+\\])\\)'))[1];assert.deepEqual(JSON.parse(list.replaceAll("'",'"')),items.map(a=>a.id));assert.equal(Number(rules.match(new RegExp(name+'\\.size\\(\\) <= (\\d+)'))[1]),items.length);const map=rules.match(new RegExp('old\\.coins-(\\{[^}]+\\})\\['+key+'\\]'))[1];assert.deepEqual(JSON.parse(map.replaceAll("'",'"')),Object.fromEntries(items.map(a=>[a.id,a.price])));}
});
