import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {RETIRED_COMPANION_PRICES} from '../src/retired-companions.js';
import {ANIMALS} from '../src/animals.js';
test('cloud purchase policy accepts every catalog animal at its exact price and full collection size',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),ids=rules.match(/function species\(id\) \{ return id in (\[[^;]+\]);/)[1],owned=rules.match(/p\.owned\.hasOnly\((\[[^;]+?\])\)/)[1],prices=rules.match(/function price\(id\) \{ return (\{[^;]+?\})\[id\];/)[1];
 const parse=value=>JSON.parse(value.replaceAll("'",'"'));assert.deepEqual(parse(ids),ANIMALS.map(a=>a.id));assert.deepEqual(parse(owned),ANIMALS.map(a=>a.id));assert.deepEqual(parse(prices),Object.fromEntries(ANIMALS.map(a=>[a.id,a.price])));assert.equal(Number(rules.match(/p\.owned\.size\(\) <= (\d+)/)[1]),ANIMALS.length);
});

test('retired companion prices exist only in a one-time cleanup rule, without a purchasing path',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 const refund=rules.slice(rules.indexOf('function retiredCompanionCredit('),rules.indexOf('function retirePurchases('));
 const pairs=[...refund.matchAll(/friends\.hasAny\(\['([^']+)'\]\) \? (\d+) : 0/g)].map(m=>[m[1],Number(m[2])]);
 assert.deepEqual(Object.fromEntries(pairs),RETIRED_COMPANION_PRICES);assert(!rules.includes('function gearChange('));
 assert(rules.includes('!p.keys().hasAny([\'ownedSkills\',\'equippedSkill\',\'ownedCompanions\',\'companion\'])'));
 assert(rules.includes('p.coins == old.coins + retiredCredit(old) + retiredCompanionCredit(old)'));
});
