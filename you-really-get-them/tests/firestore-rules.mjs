// Integration checks only: requires a locally running official Firestore Emulator.
import {before,after,beforeEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {CARDS} from '../src/gacha.js';
const address=process.env.FIRESTORE_EMULATOR_HOST;
if(!/^(127\.0\.0\.1|localhost):\d+$/.test(address||''))throw Error('Set FIRESTORE_EMULATOR_HOST to a local Firestore Emulator, for example 127.0.0.1:8089.');
const require=createRequire(process.env.YRGT_RULES_TEST_PACKAGE_JSON?resolve(process.env.YRGT_RULES_TEST_PACKAGE_JSON):new URL('../package.json',import.meta.url));
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,serverTimestamp}=require('firebase/firestore');
const [host,port]=address.split(':');let environment;
const metadata=cards=>({displayName:'收藏玩家',photoURL:'',favoriteCards:cards,updatedAt:serverTimestamp()});
const list=n=>Array.from({length:n},(_,i)=>`card_${i}`);
before(async()=>{
 environment=await initializeTestEnvironment({projectId:'demo-yrgt-card-capacity',firestore:{host,port:Number(port),rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
});
beforeEach(async()=>environment.clearFirestore());
after(async()=>{await environment?.cleanup()});
test('an owner can create and read the complete 164-card collection',async()=>{
 const db=environment.authenticatedContext('owner').firestore(),cards=CARDS.map(c=>c.id);
 await assertSucceeds(setDoc(doc(db,'users/owner'),metadata(cards)));
 const saved=await assertSucceeds(getDoc(doc(db,'users/owner')));assert.deepEqual(saved.data().favoriteCards,cards);
});
test('an owner can update from 100 through 164 to the 200-card capacity',async()=>{
 const db=environment.authenticatedContext('owner').firestore(),ref=doc(db,'users/owner');
 for(const count of [100,164,200])await assertSucceeds(setDoc(ref,metadata(list(count))));
});
test('201 entries and a non-list favoriteCards value are rejected',async()=>{
 const db=environment.authenticatedContext('owner').firestore(),ref=doc(db,'users/owner');
 await assertFails(setDoc(ref,metadata(list(201))));await assertFails(setDoc(ref,metadata('not-a-list')));
});
test('unauthenticated and other-account access remain rejected',async()=>{
 const owner=environment.authenticatedContext('owner').firestore();await setDoc(doc(owner,'users/owner'),metadata(list(164)));
 for(const context of [environment.unauthenticatedContext(),environment.authenticatedContext('other')]){
  const ref=doc(context.firestore(),'users/owner');await assertFails(getDoc(ref));await assertFails(setDoc(ref,metadata(list(164))));
 }
});
test('a larger collection does not permit adding cloud coin fields',async()=>{
 const db=environment.authenticatedContext('owner').firestore();
 await assertFails(setDoc(doc(db,'users/owner'),{...metadata(list(164)),coins:999999}));
});
