import test from 'node:test';
import assert from 'node:assert/strict';
import {readLeaderboard,saveLeaderboard,addResult,STORAGE_KEY} from '../src/leaderboard.js';

test('timed mode keeps its highest three integer scores, stable ties and dates separately from completion times',()=>{
  const memory=new Map(),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  let {records}=readLeaderboard(storage);
  records=addResult(records,'normal',1234.56789,'2026-10-23').records;
  for(const score of [15,45,30])records=addResult(records,'timed',score,'2026-10-23').records;
  const lower=addResult(records,'timed',10,'2026-10-23');
  assert.equal(lower.rank,null);assert.equal(lower.personalBest,false);
  assert.deepEqual(lower.records.timed.map(r=>r.score),[45,30,15]);
  const best=addResult(records,'timed',60,'2026-10-24');
  assert.equal(best.rank,1);assert.equal(best.personalBest,true);
  const tie=addResult(best.records,'timed',60,'2026-10-25');
  assert.equal(tie.personalBest,false);assert.equal(tie.rank,2);
  assert.deepEqual(tie.records.timed.map(r=>r.date),['2026-10-24','2026-10-25','2026-10-23']);
  assert.equal(tie.records.normal[0].time,1234.56789);
  assert.equal(saveLeaderboard(storage,tie.records),true);
  assert.deepEqual(readLeaderboard(storage).records,tie.records);
});

test('timed record reads reject malformed scores while preserving existing normal and challenge records',()=>{
  const date='2026-10-23',normal=[{time:1234.56789,date}],challenge=[{time:2345.6789,date}];
  const raw=JSON.stringify({normal,challenge,timed:[null,{score:-1,date},{score:141,date},{score:2.5,date},{score:'30',date},{score:30,date:'bad'},{time:30,date},{score:0,date},{score:90,date},{score:45,date},{score:20,date}]});
  const {records}=readLeaderboard({getItem:()=>raw});
  assert.deepEqual(records.normal,normal);assert.deepEqual(records.challenge,challenge);
  assert.deepEqual(records.timed,[{score:90,date},{score:45,date},{score:20,date}]);
  assert.equal(addResult({...records,timed:[]},'timed',0,date).rank,1);
  for(const invalid of [-1,141,1.5,Infinity,'3',null])assert.throws(()=>addResult(records,'timed',invalid,date),RangeError);
  assert.deepEqual(readLeaderboard({getItem:()=>JSON.stringify({normal,challenge})}).records.timed,[]);
});

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
  const {records}=readLeaderboard(storage);assert.deepEqual(records,{normal:[],challenge:[],timed:[]});
  saveLeaderboard(storage,addResult(records,'normal',2500).records);
  assert.equal(memory.get('pikmin-fling.records.v1'),old);
  assert.equal(readLeaderboard(storage).records.challenge.length,0);
});

test('35-second scores preserve 20/30-second archives and migrate only completion times',()=>{
 for(const legacyKey of ['pikmin-fling.records.v2','pikmin-fling.records.v3']){
  const date='2026-10-24',old={normal:[{time:1000,date}],challenge:[{time:2000,date}],timed:[{score:80,date}]};
  const memory=new Map([[legacyKey,JSON.stringify(old)]]);
  const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  const {records}=readLeaderboard(storage);
  assert.deepEqual(records.normal,old.normal);assert.deepEqual(records.challenge,old.challenge);assert.deepEqual(records.timed,[]);
  saveLeaderboard(storage,addResult(records,'timed',60,date).records);
  assert.deepEqual(JSON.parse(memory.get(legacyKey)),old);
  assert.deepEqual(readLeaderboard(storage).records.timed,[{score:60,date}]);
 }
});
