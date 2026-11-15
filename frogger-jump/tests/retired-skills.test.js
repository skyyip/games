import test from 'node:test';import assert from 'node:assert/strict';import {RETIRED_SKILL_PRICES,retiredSkillCredit} from '../src/retired-skills.js';import {freshProfile,readProfile} from '../src/profile.js';import {retiredCompanionCredit,retiredPurchaseCredit,RETIRED_COMPANION_PRICES} from '../src/retired-companions.js';
test('retired purchases refund once at the documented prices and preserve animal inventory',()=>{const p={...freshProfile('River'),coins:100,owned:['frog','bunny'],selected:'bunny',best:87,bestAnimal:'bunny',runs:['settled-run'],ownedCompanions:['ray'],companion:'ray',ownedSkills:Object.keys(RETIRED_SKILL_PRICES),equippedSkill:'double'},next=readProfile(JSON.stringify(p));assert.equal(next.coins,5460);assert.equal(next.selected,'bunny');assert.equal(next.best,87);assert.equal(next.bestAnimal,'bunny');assert.deepEqual(next.runs,['settled-run']);assert(!('companion' in next));assert(!('ownedCompanions' in next));assert(!('ownedSkills' in next));assert(!('equippedSkill' in next));assert.deepEqual(readProfile(JSON.stringify(next)),next);});
test('refunds ignore duplicates and unknown items, and general skills cannot be purchased again',()=>{assert.equal(retiredSkillCredit({ownedSkills:['double','double','fake']}),640);assert.equal(retiredSkillCredit({ownedSkills:null}),0);const p=readProfile(JSON.stringify({...freshProfile('River'),coins:10,ownedSkills:['prune']}));assert.equal(p.coins,730);assert.equal(retiredSkillCredit(p),0);});

test('companion refunds deduplicate known IDs and local reloads never repeat the credit',()=>{
 assert.equal(retiredCompanionCredit({ownedCompanions:['koi','koi','unknown','hippo']}),640);
 assert.equal(retiredCompanionCredit({ownedCompanions:null}),0);
 const old={...freshProfile('River'),coins:20,ownedCompanions:Object.keys(RETIRED_COMPANION_PRICES),companion:'shark'},next=readProfile(JSON.stringify(old));
 assert.equal(next.coins,1900);assert.equal(retiredPurchaseCredit(next),0);assert.deepEqual(readProfile(JSON.stringify(next)),next);
 for(const key of ['ownedSkills','equippedSkill','ownedCompanions','companion'])assert(!Object.hasOwn(next,key));
});
