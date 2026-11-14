import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {COMPANIONS} from '../src/equipment.js';
import {ANIMALS} from '../src/animals.js';
test('cloud purchase policy accepts every catalog animal at its exact price and full collection size',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),ids=rules.match(/function species\(id\) \{ return id in (\[[^;]+\]);/)[1],owned=rules.match(/p\.owned\.hasOnly\((\[[^;]+?\])\)/)[1],prices=rules.match(/function price\(id\) \{ return (\{[^;]+?\})\[id\];/)[1];
 const parse=value=>JSON.parse(value.replaceAll("'",'"'));assert.deepEqual(parse(ids),ANIMALS.map(a=>a.id));assert.deepEqual(parse(owned),ANIMALS.map(a=>a.id));assert.deepEqual(parse(prices),Object.fromEntries(ANIMALS.map(a=>[a.id,a.price])));assert.equal(Number(rules.match(/p\.owned\.size\(\) <= (\d+)/)[1]),ANIMALS.length);
});

test('companion prices remain exact and retired general skill purchases have no rule path',()=>{const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),change=rules.slice(rules.indexOf('function gearChange('),rules.indexOf('function selection('));const list=rules.match(/friends\.hasOnly\((\[[^\]]+\])\)/)[1];assert.deepEqual(JSON.parse(list.replaceAll("'",'"')),COMPANIONS.map(a=>a.id));const map=change.match(/old\.coins-(\{[^}]+\})\[friend\]/)[1];assert.deepEqual(JSON.parse(map.replaceAll("'",'"')),Object.fromEntries(COMPANIONS.map(a=>[a.id,a.price])));assert(!change.includes('ownedSkills'));assert(rules.includes('p.coins == old.coins + retiredCredit(old)'));});
