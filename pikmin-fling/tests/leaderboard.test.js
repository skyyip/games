import test from 'node:test';
import assert from 'node:assert/strict';
import {readLeaderboard,saveLeaderboard,addResult,STORAGE_KEY} from '../src/leaderboard.js';

test('each count persists only its fastest three full-precision results in ascending order',()=>{
  const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  let {records}=readLeaderboard(storage);
  const date='2026-10-23T00:00:00.000Z';
  for(const count of [20,30,40]) {
    for(const time of [5000.789,3000.1234,4000.4567])records=addResult(records,count,time,date).records;
    const slower=addResult(records,count,8000,date);
    assert.equal(slower.rank,null);assert.equal(slower.personalBest,false);
    assert.deepEqual(slower.records[count].map(r=>r.time),[3000.1234,4000.4567,5000.789]);
    const best=addResult(records,count,2500.999999,date);
    assert.equal(best.rank,1);assert.equal(best.personalBest,true);records=best.records;
    const tie=addResult(records,count,2500.999999,date);assert.equal(tie.personalBest,false);
  }
  assert.equal(saveLeaderboard(storage,records),true);
  assert.equal(memory.has(STORAGE_KEY),true);
  assert.deepEqual(readLeaderboard(storage).records,records);
});

test('corrupt or unavailable storage never prevents a round or keeps invalid records',()=>{
  for(const raw of ['broken','null','[]',JSON.stringify({20:[null,{time:-1,date:'bad'},{time:1,date:'bad'},...Array.from({length:5},(_,i)=>({time:5-i,date:'2026-10-23'}))]})]) {
    const {records}=readLeaderboard({getItem:()=>raw});
    assert.ok(records[20].length<=3);
    assert.ok(records[20].every(r=>r.time>=0 && Number.isFinite(Date.parse(r.date))));
  }
  assert.equal(readLeaderboard(null).available,false);
  const blocked={getItem(){throw new Error('denied')},setItem(){throw new Error('full')}};
  assert.equal(readLeaderboard(blocked).available,false);
  assert.equal(saveLeaderboard(blocked,{20:[],30:[],40:[]}),false);
  assert.throws(()=>addResult({20:[],30:[],40:[]},20,Infinity),RangeError);
});
