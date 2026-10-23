import test from 'node:test';
import assert from 'node:assert/strict';
import {readLeaderboard,saveLeaderboard,addResult,STORAGE_KEY} from '../src/leaderboard.js';

test('each mode persists only its fastest three full-precision results in ascending order',()=>{
  const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  let {records}=readLeaderboard(storage);
  const date='2026-10-23T00:00:00.000Z';
  for(const count of ['normal','challenge']) {
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
  for(const raw of ['broken','null','[]',JSON.stringify({normal:[null,{time:-1,date:'bad'},{time:1,date:'bad'},...Array.from({length:5},(_,i)=>({time:5-i,date:'2026-10-23'}))]})]) {
    const {records}=readLeaderboard({getItem:()=>raw});
    assert.ok(records.normal.length<=3);
    assert.ok(records.normal.every(r=>r.time>=0 && Number.isFinite(Date.parse(r.date))));
  }
  assert.equal(readLeaderboard(null).available,false);
  const blocked={getItem(){throw new Error('denied')},setItem(){throw new Error('full')}};
  assert.equal(readLeaderboard(blocked).available,false);
  assert.equal(saveLeaderboard(blocked,{normal:[],challenge:[]}),false);
  assert.throws(()=>addResult({normal:[],challenge:[]},'normal',Infinity),RangeError);
});

 test('the new mode records leave the old count-based records untouched',()=>{
  const old='{"30":[{"time":100,"date":"2026-10-23"}]}';
  const memory=new Map([['pikmin-fling.records.v1',old]]);
  const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  const {records}=readLeaderboard(storage);assert.deepEqual(records,{normal:[],challenge:[]});
  saveLeaderboard(storage,addResult(records,'normal',2500).records);
  assert.equal(memory.get('pikmin-fling.records.v1'),old);
  assert.equal(readLeaderboard(storage).records.challenge.length,0);
});
