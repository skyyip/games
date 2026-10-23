import test from 'node:test';
import assert from 'node:assert/strict';
import { readFavourites, saveFavourites, toggleFavourite, FAVOURITES_KEY } from '../src/favourites.js';

const ids=['grid-rush','in-order','spill','line-up','pikmin'];
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};

test('starring moves a game first and unstarring moves it last while preserving the other cards',()=>{
  const {state}=readFavourites(memory(),ids);
  const starred=toggleFavourite(state,'pikmin');
  assert.deepEqual(starred.order,['pikmin','grid-rush','in-order','spill','line-up']);
  assert.deepEqual(starred.favourites,['pikmin']);
  const second=toggleFavourite(starred,'spill');
  assert.deepEqual(second.order,['spill','pikmin','grid-rush','in-order','line-up']);
  const unstarred=toggleFavourite(second,'spill');
  assert.deepEqual(unstarred.order,['pikmin','grid-rush','in-order','line-up','spill']);
  assert.deepEqual(unstarred.favourites,['pikmin']);
  assert.deepEqual(toggleFavourite(unstarred,'pikmin').order,['grid-rush','in-order','line-up','spill','pikmin']);
  assert.deepEqual(state.order,ids,'earlier state is not mutated');
});

test('favourites and the complete card order survive saving and reading, including games moved to the end',()=>{
  const storage=memory();
  let {state}=readFavourites(storage,ids);
  for(const id of ['line-up','pikmin','line-up'])state=toggleFavourite(state,id);
  assert.equal(saveFavourites(storage,state),true);
  const restored=readFavourites(storage,ids);
  assert.equal(restored.available,true);
  assert.deepEqual(restored.state.order,['pikmin','grid-rush','in-order','spill','line-up']);
  assert.deepEqual(restored.state.favourites,['pikmin']);
  assert.equal(JSON.parse(storage.getItem(FAVOURITES_KEY)).version,1);
});

test('corrupt records are ignored and stale, duplicate or unknown games cannot enter the card list',()=>{
  const storage=memory();
  for(const raw of ['{','null','[]','42',JSON.stringify({version:2,order:ids,favourites:ids}),JSON.stringify({version:1,order:ids,favourites:'all'})]) {
    storage.setItem(FAVOURITES_KEY,raw);
    assert.deepEqual(readFavourites(storage,ids),{state:{order:ids,favourites:[]},available:true});
  }
  storage.setItem(FAVOURITES_KEY,JSON.stringify({version:1,order:['spill','removed','spill','pikmin'],favourites:['pikmin','removed','pikmin',null]}));
  assert.deepEqual(readFavourites(storage,[...ids,'new-game']).state,{
    order:['pikmin','spill','grid-rush','in-order','line-up','new-game'],favourites:['pikmin'],
  });
});

test('blocked or full storage preserves working in-memory favourites and unknown actions do nothing',()=>{
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
  for(const storage of [undefined,blocked]) {
    const {state,available}=readFavourites(storage,ids);
    assert.equal(available,false);
    const next=toggleFavourite(state,'line-up');
    assert.equal(next.order[0],'line-up');
    assert.equal(saveFavourites(storage,next),false);
    assert.equal(toggleFavourite(next,'unknown'),next);
  }
});
