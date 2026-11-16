import {COLLECTIONS} from './schema.js';
import {emptyWallet,walletAction,walletBalance,weekendKey,isWeekend,practiceReward,randomSeed} from './economy.js';
import {newSession,sessionAct,sessionFinish,sessionTerminal,roomWinner,ROOM_INTERVAL} from './session-engine.js';
import {normalizeRun} from './cloud-transition.js';
import {hkDay} from './game.js';
export const FEATURE_COLLECTIONS=Object.freeze({wallets:'hkm_wallets',styles:'hkm_styles',rooms:'hkm_rooms',assisted:'hkm_assisted_results'});
const player=(c,uid)=>c.doc(c.db,COLLECTIONS.players,uid),walletRef=(c,uid)=>c.doc(c.db,FEATURE_COLLECTIONS.wallets,uid),roomRef=(c,id)=>c.doc(c.db,FEATURE_COLLECTIONS.rooms,id);
const sessionRef=(c,uid,s)=>s.kind==='room'?c.doc(c.db,FEATURE_COLLECTIONS.rooms,s.room,'sessions',uid):c.doc(c.db,COLLECTIONS.players,uid,'sessions',s.id);
const data=snap=>snap.exists()?snap.data():null;
const stampNum=value=>value?.toMillis?.()??value;
export const normalizeRoom=r=>r?{...r,...Object.fromEntries(['createdAt','startedAt','expiresAt','updatedAt'].map(k=>[k,stampNum(r[k])]))}:null;
export async function wallet(c,uid){
 const ref=walletRef(c,uid);await c.runTransaction(c.db,async t=>{const [p,w]=await Promise.all([t.get(player(c,uid)),t.get(ref)]);if(!p.exists())throw Error('login-required');if(!w.exists())t.set(ref,emptyWallet(uid,c.serverTimestamp()));});
 const [p,w]=await Promise.all([c.getDoc(player(c,uid)),c.getDoc(ref)]);return {profile:data(p),wallet:data(w),balance:walletBalance(data(p),data(w))};
}
export async function shop(c,uid,action){
 await wallet(c,uid);const requestId=action.requestId??crypto.randomUUID();if(!/^[a-f0-9-]{36}$/.test(requestId))throw Error('invalid-item');
 const receiptRef=c.doc(c.db,FEATURE_COLLECTIONS.wallets,uid,'receipts',requestId);let outcome;
 await c.runTransaction(c.db,async t=>{
  const [p,w,receipt]=await Promise.all([t.get(player(c,uid)),t.get(walletRef(c,uid)),t.get(receiptRef)]);
  if(receipt.exists()){if(receipt.data().op!==action.type)throw Error('receipt-mismatch');outcome=receipt.data().item;return;}
  const next=walletAction(p.data(),w.data(),{...action,requestId}),stamp=c.serverTimestamp();outcome=next.item;
  t.set(walletRef(c,uid),{...next,updatedAt:stamp});
  t.set(receiptRef,{uid,op:next.op,item:next.item,cost:next.spent-w.data().spent,revision:next.revision,createdAt:stamp});
  if(action.type==='equip')t.set(c.doc(c.db,FEATURE_COLLECTIONS.styles,uid),{uid,frame:next.frame,theme:next.theme,prefix:next.prefix,updatedAt:stamp});
 });
 return {...await wallet(c,uid),outcome,requestId};
}
export async function publicStyles(c,uids){const rows=await Promise.all([...new Set(uids)].slice(0,20).map(async uid=>[uid,data(await c.getDoc(c.doc(c.db,FEATURE_COLLECTIONS.styles,uid)))]));return Object.fromEntries(rows);}
export async function getSession(c,uid,descriptor){return normalizeRun(data(await c.getDocFromServer(sessionRef(c,uid,descriptor))));}
export async function activeSession(c,uid){const w=data(await c.getDoc(walletRef(c,uid)));if(!w?.activeSession)return null;return getSession(c,uid,{id:w.activeSession,kind:w.activeKind,room:w.activeRoom});}
export async function startSession(c,uid,{kind,room='',topic='all'}){
 await wallet(c,uid);
 const day=hkDay(),id=kind==='assisted'?'assisted_'+day:kind==='room'?room:'weekend_'+crypto.randomUUID(),descriptor={id,kind,room};
 await c.runTransaction(c.db,async t=>{
  const [p,w,existing,roomSnap]=await Promise.all([t.get(player(c,uid)),t.get(walletRef(c,uid)),t.get(sessionRef(c,uid,descriptor)),kind==='room'?t.get(roomRef(c,room)):Promise.resolve(null)]);
  if(existing.exists())return;const profile=p.data(),old=w.data();if(old.activeSession)throw Error('active-session');
  if(kind==='weekend'&&(!isWeekend(day)||old.pass!==weekendKey(day)))throw Error('weekend-pass-required');
  if(kind==='assisted'&&(old.swapTokens<1||profile.activeDay!==null||profile.lastSettledDay===day))throw Error('daily-used');
  const r=roomSnap?.data();if(kind==='room'&&(!r||r.status!=='playing'||!r.players.includes(uid)||Date.now()>stampNum(r.startedAt)+230000))throw Error('room-not-playing');
  const stamp=c.serverTimestamp(),seed=kind==='room'?r.seed:kind==='assisted'?day:randomSeed();
  const run=newSession({id,uid,kind,seed,topic:kind==='room'?r.topic:'all',room},Date.now(),kind==='room'?stampNum(r.startedAt):null);
  t.set(sessionRef(c,uid,descriptor),{...run,startedAt:stamp,questionAt:kind==='room'?r.startedAt:stamp,updatedAt:stamp});
  t.update(walletRef(c,uid),{activeSession:id,activeKind:kind,activeRoom:room,swapTokens:old.swapTokens-(kind==='assisted'?1:0),revision:old.revision+1,op:'start-session',item:id,updatedAt:stamp});
  if(kind==='assisted')t.update(player(c,uid),{activeDay:day,activeKind:'assisted',updatedAt:stamp});
 });
 return getSession(c,uid,descriptor);
}
export async function moveSession(c,uid,descriptor,action,{expected=null}={}){
 const ref=sessionRef(c,uid,descriptor);let finish=false;
 await c.runTransaction(c.db,async t=>{
  const snap=await t.get(ref);if(!snap.exists())throw Error('run-missing');const raw=snap.data(),old=normalizeRun(raw);
  if(old.phase==='finished'||expected&&(old.index!==expected.index||old.phase!==expected.phase||old.questionAt!==expected.questionAt))return;
  const next=sessionAct(old,action,Date.now());if(next.phase==='finished'){finish=true;return;}
  const patch={updatedAt:c.serverTimestamp()};
  for(const key of ['phase','index','correct','timeMs','outcome','choice','halfFor','phoneFor','audienceFor','swapFor'])if(next[key]!==old[key])patch[key]=next[key];
  if(next.questionAt!==old.questionAt)patch.questionAt=old.kind==='room'?new c.Timestamp(raw.questionAt.seconds+ROOM_INTERVAL/1000,raw.questionAt.nanoseconds):c.serverTimestamp();
  if(next.answerAt!==old.answerAt){patch.answerAt=next.answerAt===null?null:c.serverTimestamp();if(next.answerAt!==null){patch.seen=next.seen;patch['answers.'+old.index]={...next.answers[old.index],startedAt:raw.questionAt,answeredAt:c.serverTimestamp()};}}
  t.update(ref,patch);
 });
 const current=await getSession(c,uid,descriptor);if(finish||sessionTerminal(current))return settleSession(c,uid,descriptor);return current;
}
export async function settleSession(c,uid,descriptor){
 const ref=sessionRef(c,uid,descriptor);
 await c.runTransaction(c.db,async t=>{
  const [r,w,p,roomSnap]=await Promise.all([t.get(ref),t.get(walletRef(c,uid)),t.get(player(c,uid)),descriptor.kind==='room'?t.get(roomRef(c,descriptor.room)):Promise.resolve(null)]);
  if(!r.exists())throw Error('run-missing');const old=normalizeRun(r.data());if(old.phase==='finished')return;
  const oldWallet=w.data(),done=sessionFinish(old),stamp=c.serverTimestamp();
  const already=oldWallet.practiceDay===old.day?oldWallet.practiceEarned:0;
  const credit=old.kind==='weekend'?Math.min(practiceReward(done.correct),Math.max(0,100000-already)):old.kind==='assisted'?done.payout:0;
  t.update(ref,{phase:'finished',timeMs:done.timeMs,payout:done.payout,reason:done.reason,endedAt:stamp,updatedAt:stamp,credit,credited:true});
  t.update(walletRef(c,uid),{bonus:oldWallet.bonus+credit,activeSession:'',activeKind:'',activeRoom:'',...(old.kind==='weekend'?{practiceDay:old.day,practiceEarned:already+credit}:{}),revision:oldWallet.revision+1,op:'settle-session',item:old.id,updatedAt:stamp});
  if(old.kind==='assisted'){
   t.update(player(c,uid),{activeDay:null,activeKind:'daily',lastSettledDay:old.day,updatedAt:stamp});
   t.set(c.doc(c.db,FEATURE_COLLECTIONS.assisted,uid+'_'+old.day),{uid,day:old.day,displayName:p.data().displayName,prize:done.payout,timeMs:done.timeMs,lifelinesLeft:[done.halfFor,done.phoneFor,done.audienceFor].filter(n=>n===-1).length,correct:done.correct,assisted:true,swapUsed:done.swapFor>=0,completedAt:stamp});
  }
  if(old.kind==='room'&&roomSnap.data().status==='playing')t.update(roomRef(c,descriptor.room),{['scores.'+uid]:{correct:done.correct,timeMs:done.timeMs,finished:true,finishedAt:stamp},updatedAt:stamp});
 });
 return getSession(c,uid,descriptor);
}
export async function assistedBoard(c){const rows=await c.getDocs(c.query(c.collection(c.db,FEATURE_COLLECTIONS.assisted),c.where('day','==',hkDay()),c.orderBy('prize','desc'),c.orderBy('timeMs','asc'),c.orderBy('lifelinesLeft','desc'),c.orderBy('completedAt','asc'),c.limit(20)));return rows.docs.map(d=>d.data());}
export async function createRoom(c,uid,{topic='all',pool=0}){
 if(!Number.isInteger(pool)||pool<0||pool>500000)throw Error('invalid-pool');await wallet(c,uid);
 const id=crypto.randomUUID().replaceAll('-',''),ref=roomRef(c,id);
 await c.runTransaction(c.db,async t=>{
  const [p,w]=await Promise.all([t.get(player(c,uid)),t.get(walletRef(c,uid))]);const old=w.data();if(walletBalance(p.data(),old)<30000+pool)throw Error('insufficient-balance');
  const stamp=c.serverTimestamp(),room={id,hostUid:uid,hostName:p.data().displayName,players:[uid],names:{[uid]:p.data().displayName},topic,pool,seed:randomSeed(),status:'lobby',scores:{[uid]:{correct:0,timeMs:0,finished:false,finishedAt:null}},winner:'',winnerOrder:-1,paidTo:'',createdAt:stamp,startedAt:null,updatedAt:stamp};
  t.set(ref,room);t.update(walletRef(c,uid),{spent:old.spent+30000+pool,revision:old.revision+1,op:'create-room',item:id,updatedAt:stamp});
 });return id;
}
export async function getRoom(c,uid,id){return normalizeRoom(data(await c.getDocFromServer(roomRef(c,id))));}
export function watchRoom(c,uid,id,callback,onError){return c.onSnapshot(roomRef(c,id),snapshot=>callback(normalizeRoom(data(snapshot))),onError);}
export async function joinRoom(c,uid,id){
 await c.runTransaction(c.db,async t=>{const [r,p]=await Promise.all([t.get(roomRef(c,id)),t.get(player(c,uid))]);const room=r.data();if(!room)throw Error('room-missing');if(room.players.includes(uid))return;if(room.status!=='lobby'||room.players.length>=6||Date.now()>stampNum(room.createdAt)+3600000)throw Error('room-full');
  t.update(roomRef(c,id),{players:[...room.players,uid],['names.'+uid]:p.data().displayName,['scores.'+uid]:{correct:0,timeMs:0,finished:false,finishedAt:null},updatedAt:c.serverTimestamp()});
 });return getRoom(c,uid,id);
}
export async function startRoom(c,uid,id){await c.runTransaction(c.db,async t=>{const r=(await t.get(roomRef(c,id))).data();if(r.hostUid!==uid||r.status!=='lobby'||r.players.length<2)throw Error('room-not-ready');t.update(roomRef(c,id),{status:'playing',startedAt:c.serverTimestamp(),updatedAt:c.serverTimestamp()});});return getRoom(c,uid,id);}
export async function finaliseRoom(c,uid,id){
 await c.runTransaction(c.db,async t=>{
  const ref=roomRef(c,id),r=(await t.get(ref)).data();if(r.status!=='playing')return;if(!r.players.includes(uid)||Date.now()<stampNum(r.startedAt)+260000)throw Error('room-wait');
  const sessions=Object.fromEntries(r.players.map(p=>[p,{phase:r.scores[p]?.finished?'finished':'playing',correct:r.scores[p]?.correct??0,timeMs:r.scores[p]?.timeMs??0}])),winner=roomWinner(r,sessions);
  t.update(ref,{status:winner?'finished':'cancelled',winner,winnerOrder:winner?r.players.indexOf(winner):-1,updatedAt:c.serverTimestamp()});
 });return getRoom(c,uid,id);
}
export async function claimRoom(c,uid,id,{cancel=false}={}){
 await wallet(c,uid);
 await c.runTransaction(c.db,async t=>{
  const [rs,ws]=await Promise.all([t.get(roomRef(c,id)),t.get(walletRef(c,uid))]);const r=rs.data(),w=ws.data();if(r.paidTo)throw Error('already-claimed');
  const refund=cancel||r.status==='cancelled';if(refund?(r.hostUid!==uid||!['lobby','cancelled'].includes(r.status)):(r.status!=='finished'||r.winner!==uid))throw Error('room-not-ready');
  t.update(roomRef(c,id),{status:refund?'cancelled':'finished',paidTo:uid,updatedAt:c.serverTimestamp()});
  t.update(walletRef(c,uid),{bonus:w.bonus+r.pool,revision:w.revision+1,op:refund?'room-refund':'room-prize',item:id,updatedAt:c.serverTimestamp()});
 });return {...await wallet(c,uid),room:await getRoom(c,uid,id)};
}
export async function myRooms(c,uid){const rows=await c.getDocs(c.query(c.collection(c.db,FEATURE_COLLECTIONS.rooms),c.where('hostUid','==',uid),c.orderBy('createdAt','desc'),c.limit(20)));return rows.docs.map(d=>normalizeRoom(d.data()));}
