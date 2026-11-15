import test from 'node:test';import assert from 'node:assert/strict';import {DailyLedger,LEDGER_KEY,pendingAccount} from '../src/ledger.js';import {hkDay,DAY_MS,questionFor,LEGACY_BANK_VERSION} from '../src/game.js';
function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
const NOW=Date.UTC(2026,10,14,4);
test('guest refresh resumes the same attempt and never creates a new question plan',async()=>{const s=storage(),one=new DailyLedger({storage:s,now:()=>NOW}),a=await one.start();const b=await new DailyLedger({storage:s,now:()=>NOW+1000}).start();assert.equal(a.token,b.token);assert.equal(a.run.questionAt,b.run.questionAt);const after=await one.action({type:'answer',choice:questionFor(a.run).answer},a.token);assert.equal(after.run.correct,1);assert.equal((await one.start()).run.correct,1);});
test('a completed anonymous day remains consumed and login cannot promote it into a second ranked run',async()=>{const ledger=new DailyLedger({storage:storage(),now:()=>NOW}),a=await ledger.start();await ledger.action({type:'walk'},a.token);assert.equal((await ledger.start()).run.phase,'finished');await assert.rejects(()=>ledger.start('account-uid'),/guest-used/);assert.throws(()=>ledger.markCloud('account-uid',{day:hkDay(NOW)}),/guest-used/);});
test('logging out after an account run does not grant a new guest attempt',async()=>{const ledger=new DailyLedger({storage:storage(),now:()=>NOW});await ledger.start('owner');await assert.rejects(()=>ledger.start('guest'),/account-used/);ledger.markCloud('owner',{day:hkDay(NOW)});assert.equal(ledger.read().owner,'owner');});
test('the following Hong Kong day starts fresh and does not save anonymous historical records',async()=>{let now=NOW;const s=storage(),ledger=new DailyLedger({storage:s,now:()=>now}),a=await ledger.start();now+=DAY_MS;const b=await ledger.start();assert.notEqual(b.token,a.token);assert.equal(b.day,a.day+1);assert.equal(JSON.parse(s.getItem(LEDGER_KEY)).day,b.day);});
test('unavailable local storage is explicit and cannot silently award repeat guest attempts',async()=>{const ledger=new DailyLedger({storage:{getItem:()=>null,setItem(){throw Error('blocked');},removeItem(){}},now:()=>NOW});assert.equal(ledger.available,false);await assert.rejects(()=>ledger.start(),/storage-required/);});

test('refresh of a v1 guest run preserves its consumed daily attempt and can answer',async()=>{
 const s=storage(),ledger=new DailyLedger({storage:s,now:()=>NOW});const a=await ledger.start();a.run.bankVersion=LEGACY_BANK_VERSION;s.setItem(LEDGER_KEY,JSON.stringify(a));
 const loaded=await new DailyLedger({storage:s,now:()=>NOW+1000}).start();assert.equal(loaded.token,a.token);assert.equal(loaded.run.bankVersion,LEGACY_BANK_VERSION);
 const next=await ledger.action({type:'answer',choice:questionFor(loaded.run).answer},a.token);assert.equal(next.run.correct,1);assert.equal(next.run.bankVersion,LEGACY_BANK_VERSION);
});

test('a server-verified unclaimed reservation can be released, including old revision-zero markers',async()=>{
 for(const legacy of [false,true]){
  const s=storage(),ledger=new DailyLedger({storage:s,now:()=>NOW}),mark=await ledger.start('owner');
  if(legacy){delete mark.state;s.setItem(LEDGER_KEY,JSON.stringify(mark));}
  assert(pendingAccount(ledger.read()));assert.equal(await ledger.releaseUnclaimed('other',mark.token),false);
  assert.equal(await ledger.releaseUnclaimed('owner','wrong-token'),false);
  assert.equal(await ledger.releaseUnclaimed('owner',mark.token),true);
  assert.equal((await ledger.start()).owner,'guest');
 }
});
test('recovery cannot clear a confirmed run, old confirmed marker, guest run or newer reservation',async()=>{
 const s=storage(),ledger=new DailyLedger({storage:s,now:()=>NOW}),mark=await ledger.start('owner');
 ledger.markCloud('owner',{day:hkDay(NOW)});assert.equal(pendingAccount(ledger.read()),false);
 assert.equal(await ledger.releaseUnclaimed('owner',mark.token),false);
 const oldConfirmed=ledger.read();delete oldConfirmed.state;s.setItem(LEDGER_KEY,JSON.stringify(oldConfirmed));
 assert.equal(await ledger.releaseUnclaimed('owner',mark.token),false);
 s.removeItem(LEDGER_KEY);const newer=await ledger.start('owner');
 assert.equal(await ledger.releaseUnclaimed('owner',mark.token),false);assert.equal(ledger.read().token,newer.token);
 assert.equal(await ledger.releaseUnclaimed('owner',newer.token),true);const guest=await ledger.start();
 assert.equal(await ledger.releaseUnclaimed('guest',guest.token),false);
});
