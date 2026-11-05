// Actual Firebase client transactions against the local emulator, never production.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createSparkAdapter} from '../src/social-firestore.js';
const require=createRequire(new URL('../package.json',import.meta.url));
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing'),sdk=require('firebase/firestore');
const env=await initializeTestEnvironment({projectId:'demo-career365',firestore:{host:'127.0.0.1',port:8090,rules:await readFile(new URL('../firestore.rules',import.meta.url),'utf8')}});
const dbs=new Map(),clients=new Map();let count=0,serial=0;
const db=u=>{if(!dbs.has(u))dbs.set(u,u?env.authenticatedContext(u,{firebase:{sign_in_provider:u==='anon'?'anonymous':'password',identities:u==='anon'?{}:{email:[u+'@example.test']}}}).firestore():env.unauthenticatedContext().firestore());return dbs.get(u);};
const ref=(u,k,id,...p)=>sdk.doc(db(u),'career365_spark_'+k,id,...p),read=(u,k,id,...p)=>sdk.getDocFromServer(ref(u,k,id,...p)),update=(u,k,id,d)=>sdk.updateDoc(ref(u,k,id),{...d,updatedAt:sdk.serverTimestamp()});
const client=u=>{if(!clients.has(u))clients.set(u,createSparkAdapter({sdk,db:db(u),currentUser:()=>({uid:u,isAnonymous:u==='anon'}),newId:()=>`company_${String(++serial).padStart(20,'0')}`}));return clients.get(u);};
const call=(u,a,i={})=>client(u).call(a,i,u),context={runId:'life_12345678901234567890',retired:false,career:'plumber'};
const profile=(u,more={})=>call(u,'publishProfile',{handle:u,name:u,avatar:'🐸',bio:'一起合作',status:'available',skills:['people'],discoverable:true,allowInvites:true,allowReferrals:true,showCareer:true,context,...more});
const check=async(n,f)=>{await f();count++;console.log('PASS '+n);};
const denied=f=>assertFails(f());
async function makeFriends(a,b){await call(a,'friend',{uid:b});await call(b,'friend',{uid:a,state:'accepted'});}
async function hire(owner,candidate,c){await call(owner,'request',{company:c,uid:candidate,role:'people',kind:'invite'});await call(candidate,'respond',{id:c+'_'+candidate,state:'accepted'});}
try{
 await env.clearFirestore();
 await check('registered profiles and immutable handle reservations are created atomically',async()=>{for(const u of ['alice','bob','carol','david','erin','mallory'])await profile(u);const s=await call('alice','bootstrap');assert.equal(s.mode,'spark');assert.equal(s.profile.handle,'alice');assert(!('balance' in s));});
 await check('all expanded comic avatars persist, old avatar IDs remain valid and invalid IDs are rejected',async()=>{
  for(let i=8;i<20;i++){await profile('portrait'+i,{avatar:'comic-'+i});assert.equal((await call('portrait'+i,'bootstrap')).profile.avatar,'comic-'+i);}
  await denied(()=>sdk.updateDoc(ref('alice','profiles','alice'),{avatar:'comic-20',updatedAt:sdk.serverTimestamp()}));
  assert.equal((await call('alice','bootstrap')).profile.avatar,'🐸');
 });
 await check('guests and anonymous users cannot access Spark social data',async()=>{await denied(()=>read(null,'profiles','alice'));await denied(()=>read('anon','profiles','alice'));});
 await check('linked anonymous tokens with a permanent Email identity remain supported',async()=>{const linked=env.authenticatedContext('linked',{firebase:{sign_in_provider:'anonymous',identities:{email:['linked@example.test']}}}).firestore();await assertSucceeds(sdk.getDocFromServer(sdk.doc(linked,'career365_spark_profiles','alice')));});
 await check('foreign edits, private fields, fake rewards and forged handles are rejected',async()=>{await denied(()=>update('mallory','profiles','alice',{name:'hacked'}));await denied(()=>update('alice','profiles','alice',{cash:99999}));await denied(()=>update('alice','accounts','alice',{balance:99999}));await denied(()=>sdk.setDoc(ref('mallory','handles','fake'),{uid:'alice',handle:'fake'}));await denied(()=>update('alice','profiles','alice',{handle:'other'}));});
 await check('private cards cannot be found by strangers or enumerated',async()=>{await profile('bob',{discoverable:false});await denied(()=>read('mallory','profiles','bob'));await denied(()=>sdk.getDocs(sdk.collection(db('alice'),'career365_spark_profiles')));await denied(()=>call('mallory','findCard',{handle:'bob'}));});
 await check('friendship needs both mirrored writes and recipient consent',async()=>{await denied(()=>sdk.setDoc(ref('alice','links','alice','peers','bob'),{from:'alice',to:'bob',state:'accepted',updatedAt:sdk.serverTimestamp()}));await call('alice','friend',{uid:'bob'});await denied(()=>call('alice','friend',{uid:'bob',state:'accepted'}));await call('bob','friend',{uid:'alice',state:'accepted'});assert.equal((await call('alice','bootstrap')).friends[0].uid,'bob');});
 await check('quick notes need a relationship, valid text enum and a 60-second interval',async()=>{await denied(()=>call('mallory','note',{uid:'bob',kind:'thanks'}));await call('alice','note',{uid:'bob',kind:'thanks'});await denied(()=>call('alice','note',{uid:'bob',kind:'again'}));await denied(()=>call('bob','note',{uid:'alice',kind:'arbitrary HTML'}));assert.equal((await call('bob','bootstrap')).notes[0].kind,'thanks');});
 let c;
 await check('company creation binds the owner account without money or server privileges',async()=>{c=await call('alice','createCompany',{name:'河岸咖啡',description:'一起討論服務',terms:'沒有薪金，彈性合作',listed:true});assert.equal((await read('alice','accounts','alice')).data().companyId,c);await assert.rejects(call('alice','createCompany',{name:'第二間'}),/already-employed/);});
 await check('cannot force membership or move another account into a company',async()=>{await denied(()=>update('alice','companies',c,{memberIds:['bob']}));await denied(()=>update('mallory','accounts','mallory',{companyId:c}));await denied(()=>update('alice','accounts','bob',{companyId:c}));});
 await check('invited player negotiates, owner offers again, candidate accepts atomically',async()=>{await call('alice','request',{company:c,uid:'bob',role:'people',kind:'invite'});await call('bob','respond',{id:c+'_bob',state:'requested',terms:'週末有空再合作'});await assert.rejects(call('bob','respond',{id:c+'_bob',state:'accepted'}),/forbidden/);await denied(()=>update('bob','requests',c+'_bob',{state:'accepted'}));await call('alice','respond',{id:c+'_bob',state:'offered'});await call('bob','respond',{id:c+'_bob',state:'accepted'});const s=await call('bob','bootstrap');assert.equal(s.company.id,c);assert.deepEqual(s.company.memberIds,['bob']);});
 await check('public application requires a company offer and final candidate acceptance',async()=>{await call('carol','request',{company:c,role:'people',kind:'application'});await assert.rejects(call('carol','respond',{id:c+'_carol',state:'accepted'}),/forbidden/);await denied(()=>update('carol','requests',c+'_carol',{state:'accepted'}));await call('alice','respond',{id:c+'_carol',state:'offered'});await call('carol','respond',{id:c+'_carol',state:'accepted'});});
 await check('referral requires friendship, opt-in and candidate-first consent',async()=>{await denied(()=>call('bob','request',{company:c,uid:'david',role:'people',kind:'referral'}));await makeFriends('bob','david');await call('bob','request',{company:c,uid:'david',role:'people',kind:'referral'});await denied(()=>call('alice','respond',{id:c+'_david',state:'offered'}));await call('david','respond',{id:c+'_david',state:'requested'});await call('alice','respond',{id:c+'_david',state:'offered'});await call('david','respond',{id:c+'_david',state:'accepted'});});
 let task;
 await check('only owners publish tasks; no balances, score or reward fields are accepted',async()=>{await denied(()=>call('bob','task',{company:c,title:'冒充負責人',description:'x',role:'people'}));await call('alice','task',{company:c,title:'如何回應客人？',description:'寫下處理建議',role:'people'});task=(await call('alice','bootstrap')).company.tasks[0].id;await denied(()=>sdk.updateDoc(ref('alice','companies',c,'tasks',task),{reward:1000,updatedAt:sdk.serverTimestamp()}));});
 await check('outsiders cannot read or claim work; concurrent claims have only one winner',async()=>{await denied(()=>read('mallory','companies',c,'tasks',task));await denied(()=>call('mallory','task',{company:c,id:task,status:'claimed'}));const outcomes=await Promise.allSettled(['bob','carol'].map(u=>call(u,'task',{company:c,id:task,status:'claimed'})));assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);});
 await check('delivery is accepted by owner only; completion creates private immutable records for both participants',async()=>{const t=(await read('alice','companies',c,'tasks',task)).data();await denied(()=>call('david','task',{company:c,id:task,status:'submitted',delivery:'偽造'}));await call(t.assignee,'task',{company:c,id:task,status:'submitted',delivery:'先聆聽，再確認可以提供的解法'});await assert.rejects(call(t.assignee,'task',{company:c,id:task,status:'completed'}),/forbidden/);await denied(()=>sdk.updateDoc(ref(t.assignee,'companies',c,'tasks',task),{status:'completed',updatedAt:sdk.serverTimestamp()}));await call('alice','task',{company:c,id:task,status:'completed',feedback:'已一起討論完成'});await denied(()=>call('alice','task',{company:c,id:task,status:'claimed'}));const d=(await read('alice','companies',c,'tasks',task)).data();assert.equal(d.status,'completed');assert(!('score' in d));assert(!('reward' in d));});
 await check('cooperation records are private, immutable, paired and not forgeable from completed work',async()=>{
  const t=(await read('alice','companies',c,'tasks',task)).data(),id=c+'_'+task;
  const records=await call(t.assignee,'history');assert.equal(records.length,1);assert.equal(records[0].runId,context.runId);assert.equal(records[0].kind,'delivery');assert.equal((await call('alice','history'))[0].kind,'review');
  await denied(()=>read('mallory','rewards',t.assignee,'receipts',id));
  await denied(()=>sdk.updateDoc(ref(t.assignee,'rewards',t.assignee,'receipts',id),{role:'tech'}));
  await denied(()=>sdk.deleteDoc(ref(t.assignee,'rewards',t.assignee,'receipts',id)));
  await denied(()=>sdk.setDoc(ref('alice','rewards','alice','receipts',id+'fake'),{...records[0],id:id+'fake',createdAt:sdk.serverTimestamp()}));
  await denied(()=>sdk.updateDoc(ref(t.assignee,'rewards',t.assignee,'receipts',id),{state:'granted',grantedAt:sdk.serverTimestamp()}));
 });
 await check('claiming uses atomic daily quota, is retryable without a second charge, and cannot cross lives',async()=>{
  const t=(await read('alice','companies',c,'tasks',task)).data(),id=c+'_'+task;
  const outcomes=await Promise.all([call(t.assignee,'claimReward',{id}),call(t.assignee,'claimReward',{id})]);assert(outcomes.every(r=>r.state==='granted'));
  const {rewardDay}=await import('../src/social-game.js'),day=String(rewardDay()),q=await read(t.assignee,'rewards',t.assignee,'days',day);assert.equal(q.data().count,1);
  await denied(()=>sdk.updateDoc(ref(t.assignee,'rewards',t.assignee,'days',day),{count:0,updatedAt:sdk.serverTimestamp()}));
  await call('alice','syncLife',{...context,runId:'other_life_12345678901234'});await assert.rejects(call('alice','claimReward',{id}),/reward-life/);await call('alice','syncLife',context);
  assert.equal((await call('alice','claimReward',{id})).state,'granted');
 });
 await check('only three new grants per account day, excess stays pending and history survives leaving',async()=>{
  const owner='erin',worker='david',cc=await call(owner,'createCompany',{name:'合作紀錄',description:'測試上限',listed:true});
  await call(worker,'leaveCompany',{company:c});await hire(owner,worker,cc);
  for(let i=0;i<4;i++){
   await call(owner,'task',{company:cc,title:'上限測試'+i,description:'寫下驗證建議',role:'analysis'});const t=(await call(owner,'bootstrap')).company.tasks[0];
   await call(worker,'task',{company:cc,id:t.id,status:'claimed'});await call(worker,'task',{company:cc,id:t.id,status:'submitted',delivery:'核對原始資料與假設'});
   // Omitting the completion records must fail, even for the company owner.
   await denied(()=>sdk.updateDoc(ref(owner,'companies',cc,'tasks',t.id),{status:'completed',updatedAt:sdk.serverTimestamp()}));
   await call(owner,'task',{company:cc,id:t.id,status:'completed',feedback:'完成核對'});
   if(i<3)await call(worker,'claimReward',{id:cc+'_'+t.id});else await assert.rejects(call(worker,'claimReward',{id:cc+'_'+t.id}),/reward-limit/);
  }
  await call(worker,'leaveCompany',{company:cc});const records=await call(worker,'history');assert.equal(records.filter(r=>r.state==='pending').length,1);assert(records.some(r=>r.companyId===cc));
  await call(owner,'updateCompany',{company:cc,status:'closed'});
 });
 await check('private history paginates without losing tied timestamps and denies unbounded enumeration',async()=>{
  await profile('archive');
  await env.withSecurityRulesDisabled(async context=>{const admin=context.firestore(),batch=sdk.writeBatch(admin);for(let i=0;i<23;i++)batch.set(sdk.doc(admin,'career365_spark_rewards','archive','receipts','record_'+String(i).padStart(3,'0')),{createdAt:sdk.Timestamp.fromMillis(1000),title:'歷史'+i});await batch.commit();});
  const first=await call('archive','history'),next=await call('archive','history',{after:first.at(-1).id});assert.equal(first.length,20);assert.equal(next.length,3);assert.equal(new Set([...first,...next].map(r=>r.id)).size,23);
  await denied(()=>sdk.getDocs(sdk.collection(db('archive'),'career365_spark_rewards','archive','receipts')));
  await denied(()=>sdk.getDocs(sdk.query(sdk.collection(db('mallory'),'career365_spark_rewards','archive','receipts'),sdk.limit(20))));
 });
 await check('company owner cannot silently transfer management',async()=>{await denied(()=>update('alice','companies',c,{owner:'bob',memberIds:['carol','david']}));await call('alice','handover',{company:c,uid:'bob'});await assert.rejects(call('alice','handover',{company:c,state:'accepted'}),/forbidden/);await denied(()=>sdk.updateDoc(ref('alice','companies',c,'handover','current'),{state:'accepted',updatedAt:sdk.serverTimestamp()}));await call('bob','handover',{company:c,state:'accepted'});assert.equal((await read('bob','companies',c)).data().owner,'bob');assert.equal((await read('alice','accounts','alice')).data().companyId,null);});
 await check('new-life members leave; owner retirement pauses the company for handover',async()=>{await call('carol','syncLife',{runId:'new_life_12345678901234',retired:false});assert.equal((await read('carol','accounts','carol')).data().companyId,null);await call('bob','syncLife',{runId:context.runId,retired:true});assert.equal((await read('bob','companies',c)).data().status,'paused');});
 await check('eight seats cannot be exceeded by racing invitation acceptances',async()=>{await profile('seatowner');const cc=await call('seatowner','createCompany',{name:'八席測試',description:'測試',listed:true});for(let i=0;i<9;i++)await profile('seat'+i);for(let i=0;i<7;i++)await hire('seatowner','seat'+i,cc);for(const u of ['seat7','seat8'])await call('seatowner','request',{company:cc,uid:u,role:'people',kind:'invite'});const result=await Promise.allSettled(['seat7','seat8'].map(u=>call(u,'respond',{id:cc+'_'+u,state:'accepted'})));assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal((await read('seatowner','companies',cc)).data().memberIds.length,8);});
 await check('unbounded scans and other players private accounts, links and inboxes are denied',async()=>{await denied(()=>sdk.getDocs(sdk.collection(db('mallory'),'career365_spark_companies')));await denied(()=>read('mallory','accounts','bob'));await denied(()=>read('mallory','links','bob','peers','alice'));await denied(()=>read('mallory','inbox','bob','notes','alice'));});
 await check('reports are private and per-pair repetition is limited',async()=>{await call('alice','report',{uid:'mallory',reason:'spam'});await denied(()=>read('mallory','reports','alice_mallory'));await denied(()=>call('alice','report',{uid:'mallory',reason:'other'}));await denied(()=>sdk.getDocs(sdk.collection(db('alice'),'career365_spark_reports')));});
 await check('blocking closes friendship and prevents profile, new invitations and messages',async()=>{await call('alice','block',{uid:'bob'});assert.equal((await call('alice','bootstrap')).friends.length,0);await denied(()=>call('bob','note',{uid:'alice',kind:'thanks'}));await denied(()=>call('bob','findCard',{handle:'alice'}));await denied(()=>call('bob','friend',{uid:'alice'}));await call('alice','unblock',{uid:'bob'});await denied(()=>call('alice','friend',{uid:'bob'}));});
 await check('owner closing a company clears owner pointer and members can detach on next open',async()=>{await call('bob','updateCompany',{company:c,status:'closed'});await call('david','syncLife',context);assert.equal((await read('david','accounts','david')).data().companyId,null);});
 console.log(`${count} Spark social emulator scenarios passed.`);
}finally{await env.cleanup();}
