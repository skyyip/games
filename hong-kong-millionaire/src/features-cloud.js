import {sessionClock} from './session-clock.js';
import {readServer} from './cloud-read.js';
import {COLLECTIONS} from './schema.js';
import {emptyWallet,walletAction,walletBalance,weekendKey,isWeekend,practiceReward,randomSeed,WEEKEND_LIMIT} from './economy.js';
import {newSession,sessionAct,sessionFinish,sessionTerminal,roomWinner,asyncRoom,ROOM_ASYNC_WINDOW,ROOM_INTERVAL,ROOM_FEE_RESERVE,ROOM_LIMIT,roomFeeShare,roomCanFinish,roomCode,roomEntry} from './session-engine.js';
import {normalizeRun} from './cloud-transition.js';
import {hkDay,QUESTION_MS} from './game.js';
export const FEATURE_COLLECTIONS=Object.freeze({wallets:'hkm_wallets',styles:'hkm_styles',rooms:'hkm_rooms'});
const player=(c,uid)=>c.doc(c.db,COLLECTIONS.players,uid),walletRef=(c,uid)=>c.doc(c.db,FEATURE_COLLECTIONS.wallets,uid),roomRef=(c,id)=>c.doc(c.db,FEATURE_COLLECTIONS.rooms,id);
const sessionRef=(c,uid,s)=>s.kind==='room'?c.doc(c.db,FEATURE_COLLECTIONS.rooms,s.room,'sessions',uid):c.doc(c.db,COLLECTIONS.players,uid,'sessions',s.id);
const data=snap=>snap.exists()?snap.data():null,stampNum=value=>value?.toMillis?.()??value;
export const normalizeRoom=r=>r?{...r,...Object.fromEntries(['createdAt','startedAt','updatedAt'].map(k=>[k,stampNum(r[k])]))}:null;
export async function wallet(c,uid){
 const ref=walletRef(c,uid);let w=await c.getDoc(ref);
 if(!w.exists()){await c.runTransaction(c.db,async t=>{const [p,latest]=await Promise.all([t.get(player(c,uid)),t.get(ref)]);if(!p.exists())throw Error('login-required');if(!latest.exists())t.set(ref,emptyWallet(uid,c.serverTimestamp()));});w=await c.getDoc(ref);}
 const p=await c.getDoc(player(c,uid));return {profile:data(p),wallet:data(w),balance:walletBalance(data(p),data(w))};
}
export async function shop(c,uid,action){
 await wallet(c,uid);const requestId=action.requestId??crypto.randomUUID();if(!/^[a-f0-9-]{36}$/.test(requestId))throw Error('invalid-item');
 const receiptRef=c.doc(c.db,FEATURE_COLLECTIONS.wallets,uid,'receipts',requestId);let outcome;
 await c.runTransaction(c.db,async t=>{
  const [p,w,receipt]=await Promise.all([t.get(player(c,uid)),t.get(walletRef(c,uid)),t.get(receiptRef)]);
  if(receipt.exists()){if(receipt.data().op!==action.type)throw Error('receipt-mismatch');outcome=receipt.data().item;return;}
  const next=walletAction(p.data(),w.data(),{...action,requestId}),stamp=c.serverTimestamp();outcome=next.item;
  t.set(walletRef(c,uid),{...next,updatedAt:stamp});t.set(receiptRef,{uid,op:next.op,item:next.item,cost:next.spent-w.data().spent,revision:next.revision,createdAt:stamp});
  if(action.type==='equip')t.set(c.doc(c.db,FEATURE_COLLECTIONS.styles,uid),{uid,frame:next.frame,theme:next.theme,prefix:next.prefix,updatedAt:stamp});
 });return {...await wallet(c,uid),outcome,requestId};
}
export async function publicStyles(c,uids){return Object.fromEntries(await Promise.all([...new Set(uids)].slice(0,20).map(async uid=>[uid,data(await c.getDoc(c.doc(c.db,FEATURE_COLLECTIONS.styles,uid)))])));}
export async function getSession(c,uid,descriptor){return normalizeRun(data(await readServer(c,sessionRef(c,uid,descriptor))));}
export function watchSession(c,uid,descriptor,callback,onError){return c.onSnapshot(sessionRef(c,uid,descriptor),{includeMetadataChanges:true},snap=>{if(!snap.metadata.hasPendingWrites)callback(normalizeRun(data(snap)));},onError);}
export async function activeSession(c,uid){
 const ref=walletRef(c,uid),w=data(await readServer(c,ref));if(!w?.activeSession)return null;
 const r=w.activeKind==='room'?data(await c.getDoc(roomRef(c,w.activeRoom))):null;
 const active=['room','weekend','retry'].includes(w.activeKind)?await getSession(c,uid,{id:w.activeSession,kind:w.activeKind,room:w.activeRoom}):null;
 if(!['room','weekend','retry'].includes(w.activeKind)||!active||active.phase==='finished'||w.activeKind==='room'&&(!r||!Number.isInteger(r.entryFee))){
  await c.runTransaction(c.db,async t=>{const current=(await t.get(ref)).data();if(current.activeSession!==w.activeSession)return;t.update(ref,{activeSession:'',activeKind:'',activeRoom:'',revision:current.revision+1,op:'retire-extra',item:current.activeSession,updatedAt:c.serverTimestamp()});});return null;
 }
 return active;
}
function afterMs(c,stamp,ms){const nano=stamp.nanoseconds+(ms%1000)*1000000;return new c.Timestamp(stamp.seconds+Math.floor(ms/1000)+Math.floor(nano/1000000000),nano%1000000000);}
export async function syncSessionClock(c,uid,descriptor){
 const ref=sessionRef(c,uid,descriptor);let sent=null;
 await c.runTransaction(c.db,async t=>{sent=null;const snap=await t.get(ref);if(!snap.exists())throw Error('run-missing');if(snap.data().phase==='finished')return;sent=performance.now();t.update(ref,{updatedAt:c.serverTimestamp()});});
 const run=await getSession(c,uid,descriptor),received=performance.now();if(run&&sent!==null)sessionClock.observe(run.updatedAt,sent,received);return run;
}
export async function resumeSession(c,uid,descriptor){
 let run=await syncSessionClock(c,uid,descriptor);if(!run||run.phase==='finished')return run;
 const time=sessionClock.lowerBound(),roomEnded=run.kind==='room'&&time>=(asyncRoom(run)?run.deadlineAt:run.questionAt+(run.count-run.index)*ROOM_INTERVAL);
 if(run.phase==='playing'&&(roomEnded||time>=run.questionAt+QUESTION_MS||run.kind!=='room'&&hkDay(time)!==run.day))run=await moveSession(c,uid,descriptor,{type:'timeout'});
 if(run.phase==='reveal'&&(roomEnded||sessionTerminal(run,time)||run.kind!=='room'&&run.day!==hkDay(time)))run=await settleSession(c,uid,descriptor);
 return run;
}
export async function startSession(c,uid,{kind,room=''}){
 if(!['weekend','retry','room'].includes(kind))throw Error('invalid-session');
 const id=kind==='room'?room:kind+'_'+crypto.randomUUID(),descriptor={id,kind,room};let sent=null;
 await c.runTransaction(c.db,async t=>{
  sent=null;const [w,existing,rs]=await Promise.all([t.get(walletRef(c,uid)),t.get(sessionRef(c,uid,descriptor)),kind==='room'?t.get(roomRef(c,room)):Promise.resolve(null)]);
  if(existing.exists())return;if(!w.exists())throw Error('login-required');const old=w.data();if(old.activeSession)throw Error('active-session');
  const r=rs?.data(),now=sessionClock.now(),day=kind==='room'?hkDay(stampNum(r?.startedAt)):hkDay(now);
  if(kind==='weekend'&&(!isWeekend(day)||old.pass!==weekendKey(day)))throw Error('weekend-pass-required');if(kind==='weekend'&&(old.passUses??0)>=WEEKEND_LIMIT)throw Error('weekend-limit');
  if(kind==='retry'&&(old.retryBoughtDay!==day||old.retryUsedDay===day))throw Error('retry-ticket-required');
  if(kind==='room'&&(!r||r.status!=='playing'||!r.players.includes(uid)||r.mode==='async'&&sessionClock.ready&&sessionClock.lowerBound()>=stampNum(r.startedAt)+ROOM_ASYNC_WINDOW))throw Error('room-not-playing');
  const stamp=c.serverTimestamp(),run=newSession({id,uid,kind,seed:kind==='room'?r.seed:randomSeed(),topic:kind==='room'?r.topic:'all',room,...(r?.mode==='async'?{roomMode:'async',deadlineAt:afterMs(c,r.startedAt,ROOM_ASYNC_WINDOW)}:{})},now,kind==='room'?stampNum(r.startedAt):null);run.day=day;
  sent=performance.now();t.set(sessionRef(c,uid,descriptor),{...run,startedAt:stamp,questionAt:kind==='room'&&r.mode!=='async'?r.startedAt:stamp,updatedAt:stamp});
  // Starting a quiz only touches the player's private session and wallet.
  // Fee rebates are claimed after the quiz is visible, outside this transaction.
  t.update(walletRef(c,uid),{activeSession:id,activeKind:kind,activeRoom:room,...(kind==='weekend'?{passUses:(old.passUses??0)+1}:kind==='retry'?{retryUsedDay:day}:{}),revision:old.revision+1,op:'start-session',item:id,updatedAt:stamp});
 });const received=performance.now(),run=await getSession(c,uid,descriptor);
 if(sent!==null){sessionClock.observe(run.startedAt,sent,received);return run;}
 return run.phase==='finished'?run:resumeSession(c,uid,descriptor);
}
export async function moveSession(c,uid,descriptor,action,{expected=null}={}){
 const ref=sessionRef(c,uid,descriptor);let finish=false,sent=null;
 await c.runTransaction(c.db,async t=>{sent=null;const snap=await t.get(ref);if(!snap.exists())throw Error('run-missing');const raw=snap.data(),old=normalizeRun(raw);
  if(old.phase==='finished'||expected&&(old.index!==expected.index||old.phase!==expected.phase||old.questionAt!==expected.questionAt))return;
  const next=sessionAct(old,action,sessionClock.lowerBound());if(next.phase==='finished'){finish=true;return;}const patch={updatedAt:c.serverTimestamp()};
  for(const key of ['phase','index','correct','timeMs','outcome','choice','halfFor','phoneFor','audienceFor'])if(next[key]!==old[key])patch[key]=next[key];
  if(next.questionAt!==old.questionAt)patch.questionAt=old.kind==='room'&&!asyncRoom(old)?afterMs(c,raw.questionAt,ROOM_INTERVAL):c.serverTimestamp();
  if(next.answerAt!==old.answerAt){patch.answerAt=next.answerAt===null?null:c.serverTimestamp();if(next.answerAt!==null){patch.seen=next.seen;patch['answers.'+old.index]={...next.answers[old.index],startedAt:raw.questionAt,answeredAt:c.serverTimestamp()};}}
  sent=performance.now();t.update(ref,patch);
 });const current=await getSession(c,uid,descriptor);if(sent!==null&&current)sessionClock.observe(current.updatedAt,sent,performance.now());return finish||sessionTerminal(current,sessionClock.lowerBound())?settleSession(c,uid,descriptor):current;
}
export async function settleSession(c,uid,descriptor){
 const ref=sessionRef(c,uid,descriptor);
 await c.runTransaction(c.db,async t=>{const [r,w,rs]=await Promise.all([t.get(ref),t.get(walletRef(c,uid)),descriptor.kind==='room'?t.get(roomRef(c,descriptor.room)):Promise.resolve(null)]);
  if(!r.exists())throw Error('run-missing');const old=normalizeRun(r.data());if(old.phase==='finished')return;const oldWallet=w.data(),done=sessionFinish(old,sessionClock.now()),stamp=c.serverTimestamp();
  const already=oldWallet.practiceDay===old.day?oldWallet.practiceEarned:0,credit=old.kind==='weekend'?Math.min(practiceReward(done.correct),Math.max(0,100000-already)):old.kind==='retry'?done.payout:0;
  t.update(ref,{phase:'finished',timeMs:done.timeMs,payout:done.payout,reason:done.reason,endedAt:stamp,updatedAt:stamp,credit,credited:true});
  t.update(walletRef(c,uid),{bonus:oldWallet.bonus+credit,activeSession:'',activeKind:'',activeRoom:'',...(old.kind==='weekend'?{practiceDay:old.day,practiceEarned:already+credit}:{}),revision:oldWallet.revision+1,op:'settle-session',item:old.id,updatedAt:stamp});
  if(old.kind==='room'&&rs.data().status==='playing'&&(!asyncRoom(old)||sessionClock.lowerBound()<old.deadlineAt))t.update(roomRef(c,descriptor.room),{['scores.'+uid]:{correct:done.correct,timeMs:done.timeMs,finished:true,finishedAt:stamp},updatedAt:stamp});
 });return getSession(c,uid,descriptor);
}
export async function createRoom(c,uid,{topic='all',entryFee=1000,code=roomCode()}){
 roomEntry(entryFee);if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code))throw Error('invalid-code');await wallet(c,uid);const ref=roomRef(c,code);
 await c.runTransaction(c.db,async t=>{const [p,w,existing]=await Promise.all([t.get(player(c,uid)),t.get(walletRef(c,uid)),t.get(ref)]);if(existing.exists()){if(existing.data().hostUid===uid)return;throw Error('room-code-used');}
  const old=w.data(),cost=entryFee+ROOM_FEE_RESERVE;if(walletBalance(p.data(),old)<cost)throw Error('insufficient-balance');const stamp=c.serverTimestamp();
  t.set(ref,{id:code,hostUid:uid,hostName:p.data().displayName,players:[uid],names:{[uid]:p.data().displayName},topic,mode:'async',entryFee,pool:entryFee,feeShare:0,rebates:{[uid]:false},refunds:{[uid]:false},seed:randomSeed(),status:'lobby',scores:{[uid]:{correct:0,timeMs:0,finished:false,finishedAt:null}},winner:'',winnerOrder:-1,paidTo:'',createdAt:stamp,startedAt:null,updatedAt:stamp});
  t.update(walletRef(c,uid),{spent:old.spent+cost,revision:old.revision+1,op:'create-room',item:code,updatedAt:stamp});
 });return code;
}
export async function getRoom(c,uid,id){return normalizeRoom(data(await readServer(c,roomRef(c,id))));}
export function watchRoom(c,uid,id,callback,onError){return c.onSnapshot(roomRef(c,id),snapshot=>{if(!snapshot.metadata.hasPendingWrites)callback(normalizeRoom(data(snapshot)));},onError);}
export async function joinRoom(c,uid,id){
 await wallet(c,uid);await c.runTransaction(c.db,async t=>{const [rs,p,w]=await Promise.all([t.get(roomRef(c,id)),t.get(player(c,uid)),t.get(walletRef(c,uid))]);const r=data(rs);if(!r)throw Error('room-missing');if(r.players.includes(uid))return;
  if(r.status!=='lobby'||r.players.length>=ROOM_LIMIT||sessionClock.ready&&sessionClock.lowerBound()>=stampNum(r.createdAt)+3600000)throw Error('room-full');const old=w.data(),cost=r.entryFee+ROOM_FEE_RESERVE;if(walletBalance(p.data(),old)<cost)throw Error('insufficient-balance');const stamp=c.serverTimestamp();
  t.update(roomRef(c,id),{players:[...r.players,uid],['names.'+uid]:p.data().displayName,['scores.'+uid]:{correct:0,timeMs:0,finished:false,finishedAt:null},['rebates.'+uid]:false,['refunds.'+uid]:false,pool:r.pool+r.entryFee,updatedAt:stamp});
  t.update(walletRef(c,uid),{spent:old.spent+cost,revision:old.revision+1,op:'join-room',item:id,updatedAt:stamp});
 });return getRoom(c,uid,id);
}
export async function startRoom(c,uid,id){await c.runTransaction(c.db,async t=>{const r=(await t.get(roomRef(c,id))).data();if(r.hostUid!==uid||r.status!=='lobby'||r.players.length<2)throw Error('room-not-ready');t.update(roomRef(c,id),{status:'playing',feeShare:roomFeeShare(r.players.length),startedAt:c.serverTimestamp(),updatedAt:c.serverTimestamp()});});return getRoom(c,uid,id);}
export async function cancelRoom(c,uid,id){await c.runTransaction(c.db,async t=>{const r=(await t.get(roomRef(c,id))).data();if(r.hostUid!==uid||r.status!=='lobby')throw Error('room-not-ready');t.update(roomRef(c,id),{status:'cancelled',updatedAt:c.serverTimestamp()});});return getRoom(c,uid,id);}
export async function finaliseRoom(c,uid,id){await c.runTransaction(c.db,async t=>{const ref=roomRef(c,id),r=(await t.get(ref)).data();if(r.status!=='playing')return;if(!r.players.includes(uid)||!roomCanFinish(normalizeRoom(r),sessionClock.lowerBound()))throw Error('room-wait');
 const sessions=Object.fromEntries(r.players.map(p=>[p,{phase:r.scores[p]?.finished?'finished':'playing',correct:r.scores[p]?.correct??0,timeMs:r.scores[p]?.timeMs??0}])),winner=roomWinner(r,sessions);t.update(ref,{status:winner?'finished':'cancelled',winner,winnerOrder:winner?r.players.indexOf(winner):-1,updatedAt:c.serverTimestamp()});});return getRoom(c,uid,id);}
export async function claimRoom(c,uid,id){
 await c.runTransaction(c.db,async t=>{const [rs,ws]=await Promise.all([t.get(roomRef(c,id)),t.get(walletRef(c,uid))]);const r=rs.data(),w=ws.data();if(!r.players.includes(uid))throw Error('room-not-ready');
  let amount=0,op='room-rebate';const patch={updatedAt:c.serverTimestamp()};
  if(r.startedAt!==null&&!r.rebates[uid]){amount+=ROOM_FEE_RESERVE-r.feeShare;patch['rebates.'+uid]=true;}
  if(r.status==='cancelled'&&!r.refunds[uid]){amount+=r.entryFee+(r.startedAt===null?ROOM_FEE_RESERVE:0);patch['refunds.'+uid]=true;if(r.startedAt===null)patch['rebates.'+uid]=true;op='room-refund';}
  if(r.status==='finished'&&r.winner===uid&&!r.paidTo){amount+=r.pool;patch.paidTo=uid;op='room-prize';}
  if(Object.keys(patch).length===1)throw Error('already-claimed');
  t.update(roomRef(c,id),patch);t.update(walletRef(c,uid),{bonus:w.bonus+amount,revision:w.revision+1,op,item:id,updatedAt:c.serverTimestamp()});
 });return {...await wallet(c,uid),room:await getRoom(c,uid,id)};
}
export async function myRooms(c,uid){const rows=await c.getDocs(c.query(c.collection(c.db,FEATURE_COLLECTIONS.rooms),c.where('players','array-contains',uid),c.orderBy('createdAt','desc'),c.limit(20)));return rows.docs.map(d=>normalizeRoom(d.data())).filter(r=>Number.isInteger(r.entryFee)&&/^[A-HJ-NP-Z2-9]{8}$/.test(r.id));}
