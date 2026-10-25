import test from 'node:test';
import assert from 'node:assert/strict';
import {readRecords,addRecord,saveRecords,STORAGE_KEY} from '../src/records.js';
const date='2026-10-25T00:00:00.000Z',entry=(distance,direction='up')=>({distance,direction,date});
test('only the three longest completed distances persist, with full precision and stable ties',()=>{
  const memory=new Map([['another-game','untouched']]),storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  let {records}=readRecords(storage);
  for(const d of [10.12345,30.12345,20.12345,5])records=addRecord(records,entry(d),date).records;
  assert.deepEqual(records.map(r=>r.distance),[30.12345,20.12345,10.12345]);
  const tie=addRecord(records,entry(30.12345,'down'),date);assert.equal(tie.rank,2);assert.equal(tie.records[0].direction,'up');assert.equal(tie.records[1].direction,'down');
  assert.equal(addRecord(tie.records,entry(1),date).rank,null);
  assert.equal(saveRecords(storage,tie.records),true);assert.deepEqual(readRecords(storage).records,tie.records);assert.equal(memory.get('another-game'),'untouched');assert.ok(memory.has(STORAGE_KEY));
});
test('malformed storage and invalid scores are ignored safely',()=>{
  for(const raw of ['bad','null','[]','{"version":2,"records":[]}'])assert.deepEqual(readRecords({getItem:()=>raw}).records,[]);
  const bad=[null,entry(-1),entry(0),entry(Infinity),entry(5000),{...entry(5),date:'bad'},{...entry(5),direction:'left'},entry('5')];
  const storage={getItem:()=>JSON.stringify({version:1,records:[...bad,entry(25),entry(45),entry(15),entry(35)]})};
  assert.deepEqual(readRecords(storage).records.map(r=>r.distance),[45,35,25]);
  for(const value of bad.filter(r=>r?.date!=='bad'))assert.throws(()=>addRecord([],value??{},date),RangeError);
  assert.throws(()=>addRecord([],entry(5),'bad'),RangeError);
});
test('denied or full storage keeps gameplay available with in-memory records',()=>{
  const blocked={getItem(){throw new Error('denied');},setItem(){throw new Error('full');}};
  assert.equal(readRecords(blocked).available,false);assert.equal(readRecords(undefined).available,false);assert.equal(saveRecords(blocked,[]),false);
  const next=addRecord([],entry(15),date);assert.equal(next.rank,1);assert.equal(saveRecords(undefined,next.records),false);assert.equal(next.records[0].distance,15);
});
