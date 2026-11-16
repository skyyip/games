import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffleChoices,optionOrder} from '../src/choice-order.js';
test('the option shuffle reaches all 24 permutations, rather than four rotations',()=>{
 const permutations=new Set();for(let a=0;a<4;a++)for(let b=0;b<3;b++)for(let c=0;c<2;c++){const picks=[a,b,c];const order=shuffleChoices(()=>picks.shift());assert.deepEqual([...order].sort(),[0,1,2,3]);permutations.add(order.join(''));}assert.equal(permutations.size,24);
});
test('the same run survives reload with its order; a fresh run gets a fresh shuffle',async()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},run={uid:'shuffle-test',day:20000,startedAt:1000,index:0};
 const order=optionOrder(run,'e01',{storage,pick:()=>0});assert.deepEqual(optionOrder(run,'e01',{storage,pick:max=>max-1}),order);
 const reload=await import('../src/choice-order.js?reload=1');assert.deepEqual(reload.optionOrder(run,'e01',{storage,pick:max=>max-1}),order);
 assert.notDeepEqual(optionOrder({...run,startedAt:2000},'e01',{storage,pick:max=>max-1}),order);
});
test('bad stored orders are repaired and returned arrays cannot mutate the saved order',()=>{
 const storage={getItem:()=> '[0,0,1,2]',setItem(){}},run={uid:'shuffle-repair',startedAt:1,index:2,day:20000},order=optionOrder(run,'e02',{storage,pick:()=>0});assert.deepEqual([...order].sort(),[0,1,2,3]);order.reverse();assert.notDeepEqual(optionOrder(run,'e02',{storage}),order);
});
