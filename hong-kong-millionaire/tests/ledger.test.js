import test from 'node:test';import assert from 'node:assert/strict';import {DailyLedger,LEDGER_KEY,pendingAccount} from '../src/ledger.js';import {hkDay,DAY_MS,questionFor} from '../src/game.js';
function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
const NOW=Date.UTC(2026,10,14,4);
test('guest refresh resumes the same attempt and never creates a new question plan',async()=>{const s=storage(),one=new DailyLedger({storage:s,now:()=>NOW}),a=await one.start();const b=await new DailyLedger({storage:s,now:()=>NOW+1000}).start();assert.equal(a.token,b.token);assert.equal(a.run.questionAt,b.run.questionAt);const after=await one.action({type:'answer',choice:questionFor(a.run).answer},a.token);assert.equal(after.run.correct,1);assert.equal((await one.start()).run.correct,1);});
test('a completed anonymous day remains consumed and login cannot promote it into a second ranked run',async()=>{const ledger=new DailyLedger({storage:storage(),now:()=>NOW}),a=await ledger.start();await ledger.action({type:'walk'},a.token);assert.equal((await ledger.start()).run.phase,'finished');await assert.rejects(()=>ledger.start('account-uid'),/guest-used/);assert.throws(()=>ledger.markCloud('account-uid',{day:hkDay(NOW)}),/guest-used/);});
test('logging out after an account run does not grant a new guest attempt',async()=>{const ledger=new DailyLedger({storage:storage(),now:()=>NOW});await ledger.start('owner');await assert.rejects(()=>ledger.start('guest'),/account-used/);ledger.markCloud('owner',{day:hkDay(NOW)});assert.equal(ledger.read().owner,'owner');});
test('the following Hong Kong day starts fresh and does not save anonymous historical records',async()=>{let now=NOW;const s=storage(),ledger=new DailyLedger({storage:s,now:()=>now}),a=await ledger.start();now+=DAY_MS;const b=await ledger.start();assert.notEqual(b.token,a.token);assert.equal(b.day,a.day+1);assert.equal(JSON.parse(s.getItem(LEDGER_KEY)).day,b.day);});
test('unavailable local storage is explicit and cannot silently award repeat guest attempts',async()=>{const ledger=new DailyLedger({storage:{getItem:()=>null,setItem(){throw Error('blocked');},removeItem(){}},now:()=>NOW});assert.equal(ledger.available,false);await assert.rejects(()=>ledger.start(),/storage-required/);});

test('a first anonymous attempt uses the standard daily key and the current question bank',async()=>{
 const s=storage(),ledger=new DailyLedger({storage:s,now:()=>NOW});assert.equal(ledger.read(),null);
 const entry=await ledger.start();assert.equal(entry.owner,'guest');assert.equal(entry.run.bankVersion,'hk-2026-11');assert.equal(LEDGER_KEY,'sky.hk-millionaire.today.v1');
 assert.equal(JSON.parse(s.getItem(LEDGER_KEY)).token,entry.token);assert.equal(ledger.read().run.index,0);
});

test('a server-verified unclaimed reservation can be released, with a pending current-release marker',async()=>{
 {
  const s=storage(),ledger=new DailyLedger({storage:s,now:()=>NOW}),mark=await ledger.start('owner');
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

test('different accounts reserve and resume independently in the same browser',async()=>{
 const ledger=new DailyLedger({storage:storage(),now:()=>NOW}),a=await ledger.start('account-a');
 ledger.markCloud('account-a',{day:hkDay(NOW)});const b=await ledger.start('account-b');
 assert.equal(b.owner,'account-b');assert.notEqual(b.token,a.token);assert.equal(ledger.readAccount('account-a').state,'confirmed');
 ledger.markCloud('account-b',{day:hkDay(NOW)});
 const againA=await ledger.start('account-a');assert.equal(againA.token,a.token);assert.equal(againA.state,'confirmed');
 assert.equal(ledger.readAccount('account-b').token,b.token);assert.equal(ledger.readAccount('account-b').state,'confirmed');
 await assert.rejects(()=>ledger.start('guest'),/account-used/);
});
test('a rejected second account cannot erase the first account daily restriction',async()=>{
 const ledger=new DailyLedger({storage:storage(),now:()=>NOW}),a=await ledger.start('account-a');ledger.markCloud('account-a',{day:hkDay(NOW)});
 const b=await ledger.start('account-b');assert.equal(await ledger.releaseUnclaimed('account-b',b.token),true);
 assert.equal(ledger.read().owner,'account-a');assert.equal(ledger.read().token,a.token);assert.equal(ledger.readAccount('account-b'),null);
 await assert.rejects(()=>ledger.start('guest'),/account-used/);
});
test('pending markers for other accounts survive switching, releasing and midnight rollover',async()=>{
 let now=NOW;const ledger=new DailyLedger({storage:storage(),now:()=>now}),a=await ledger.start('account-a'),b=await ledger.start('account-b');
 assert.equal(await ledger.releaseUnclaimed('account-a',a.token),true);assert.equal(ledger.read().owner,'account-b');assert.equal(ledger.read().token,b.token);
 assert.equal(await ledger.releaseUnclaimed('account-b',b.token),true);assert.equal(ledger.read(),null);
 await ledger.start('account-a');ledger.markCloud('account-a',{day:hkDay(now)});await ledger.start('account-b');
 now+=DAY_MS;assert.equal(ledger.readAccount('account-a'),null);assert.equal(ledger.readAccount('account-b'),null);assert.equal((await ledger.start()).owner,'guest');
});
