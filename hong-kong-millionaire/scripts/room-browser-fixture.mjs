import {emptyWallet,walletAction,walletBalance,practiceReward} from '../src/economy.js';
import {newSession,sessionAct,sessionFinish,sessionTerminal,roomFeeShare,roomCanFinish,roomWinner} from '../src/session-engine.js';
import {hkDay,newRun} from '../src/game.js';
export const adapter=String.raw`
const call=(name,...args)=>globalThis.qaRPC(name,args),uid=globalThis.QA_UID;
export const configured=true;export async function prepareAuth(){}export async function observeAuth(cb){await cb(uid?{uid,email:uid+'@example.test'}:null);return ()=>{};}
export function googleLogin(){return {task:Promise.resolve(),popup:{dispose(){}}};}export async function logout(){}export async function emailLogin(){}export async function resetPassword(){}
export const account=()=>call('account'),resumeAccount=()=>call('resumeAccount'),currentRun=()=>call('currentRun'),claimDaily=()=>call('claimDaily'),move=()=>call('dailyMove'),settle=()=>call('dailySettle'),saveName=account,favourite=account;
export const wallet=()=>call('wallet'),shop=a=>call('shop',a),publicStyles=a=>call('publicStyles',a),leaderboard=()=>call('leaderboard'),history=()=>call('history');
export const activeSession=()=>call('activeSession'),getSession=d=>call('getSession',d),startSession=d=>call('startSession',d),moveSession=(d,a,o)=>call('moveSession',d,a,o),settleSession=d=>call('settleSession',d);
export const createRoom=d=>call('createRoom',d),getRoom=id=>call('getRoom',id),joinRoom=id=>call('joinRoom',id),startRoom=id=>call('startRoom',id),cancelRoom=id=>call('cancelRoom',id),claimRoom=id=>call('claimRoom',id),finaliseRoom=id=>call('finaliseRoom',id),myRooms=()=>call('myRooms');
globalThis.qaStreams={};let serial=0;const watch=async(type,d,cb)=>{const key=type+(++serial);qaStreams[key]=cb;await globalThis.qaWatch(type,key,d);return ()=>{delete qaStreams[key];};};
export const watchRoom=(id,cb)=>watch('room',id,cb),watchSession=(d,cb)=>watch('session',d,cb);
export function errorText(e){return '連接暫時未完成：'+(e.message??e.code??'');}
`;
const clone=o=>structuredClone(o);
export class RoomFixture {
 constructor(){this.now=Date.UTC(2026,10,14,4);this.people=new Map();this.rooms=new Map();this.sessions=new Map();this.receipts=new Map();this.subscriptions=[];this.delayHost=false;this.failShop=false;}
 person(uid){if(!this.people.has(uid))this.people.set(uid,{p:{uid,displayName:'街坊'+uid,total:3000000,bestPrize:1000000,games:3,titles:['ordinary','neighbour','expert','peak','millionaire'],unlocked:['e01'],wrong:['e01'],favourites:[],activeDay:null,lastSettledDay:null},w:emptyWallet(uid,this.now)});return this.people.get(uid);}
 key(uid,id){return uid+':'+id;}
 state(uid){const {p,w}=this.person(uid);return {profile:clone(p),wallet:clone(w),balance:walletBalance(p,w)};}
 broadcast(){for(const s of this.subscriptions){const value=s.type==='room'?this.rooms.get(s.d):this.sessions.get(this.key(s.uid,s.d.id));if(value)s.page.evaluate(({key,value})=>globalThis.qaStreams?.[key]?.(value),{key:s.key,value:clone(value)}).catch(()=>{});}}
 async rpc(uid,name,args){
 const person=this.person(uid),{p,w}=person,now=this.now;
 if(name==='account')return clone(p);if(name==='resumeAccount')return {profile:clone(p),run:null};if(name==='currentRun')return null;if(name==='wallet')return this.state(uid);
 if(name==='shop'){const a=args[0];if(this.receipts.has(a.requestId))return {...this.state(uid),outcome:this.receipts.get(a.requestId)};person.w=walletAction(p,w,a,hkDay(now));this.receipts.set(a.requestId,person.w.item);if(this.failShop){this.failShop=false;throw Error('unavailable');}return {...this.state(uid),outcome:person.w.item};}
 if(name==='publicStyles')return Object.fromEntries(args[0].map(u=>[u,{frame:this.person(u).w.frame,prefix:this.person(u).w.prefix}]));
 if(name==='leaderboard')return [{uid,displayName:p.displayName,prize:1000000,timeMs:10000,lifelinesLeft:3,total:p.total,games:3}];
 if(name==='history')return [{...newRun(hkDay(now),now,uid),phase:'finished',correct:15,payout:1000000,reason:'complete',timeMs:12345,endedAt:now}];
 if(name==='getRoom')return clone(this.rooms.get(args[0])??null);if(name==='myRooms')return [...this.rooms.values()].filter(r=>r.players.includes(uid)).map(clone);
 if(name==='createRoom'){const a=args[0];if(this.rooms.has(a.code))return a.code;w.spent+=a.entryFee+15000;this.rooms.set(a.code,{id:a.code,hostUid:uid,hostName:p.displayName,topic:a.topic,entryFee:a.entryFee,pool:a.entryFee,feeShare:0,players:[uid],names:{[uid]:p.displayName},scores:{[uid]:{correct:0,timeMs:0,finished:false}},rebates:{[uid]:false},refunds:{[uid]:false},seed:12345,status:'lobby',createdAt:now,startedAt:null,winner:'',paidTo:''});return a.code;}
 const room=this.rooms.get(args[0]);
 if(name==='joinRoom'){if(!room.players.includes(uid)){w.spent+=room.entryFee+15000;room.players.push(uid);room.pool+=room.entryFee;room.names[uid]=p.displayName;room.scores[uid]={correct:0,timeMs:0,finished:false};room.rebates[uid]=false;room.refunds[uid]=false;}this.broadcast();return clone(room);}
 if(name==='startRoom'){room.status='playing';room.startedAt=now;room.feeShare=roomFeeShare(room.players.length);this.broadcast();return clone(room);}
 if(name==='cancelRoom'){room.status='cancelled';this.broadcast();return clone(room);}
 if(name==='finaliseRoom'){if(!roomCanFinish(room,now))throw Error('room-wait');const scores=Object.fromEntries(room.players.map(u=>[u,{phase:room.scores[u].finished?'finished':'playing',...room.scores[u]}]));room.winner=roomWinner(room,scores);room.status=room.winner?'finished':'cancelled';this.broadcast();return clone(room);}
 if(name==='claimRoom'){let credit=0;if(room.startedAt!==null&&!room.rebates[uid]){credit+=15000-room.feeShare;room.rebates[uid]=true;}if(room.status==='cancelled'&&!room.refunds[uid]){credit+=room.entryFee+(room.startedAt===null?15000:0);room.refunds[uid]=true;room.rebates[uid]=true;}if(room.winner===uid&&!room.paidTo){credit+=room.pool;room.paidTo=uid;}w.bonus+=credit;this.broadcast();return {...this.state(uid),room:clone(room)};}
 if(name==='activeSession')return clone(this.sessions.get(this.key(uid,w.activeSession))??null);if(name==='getSession')return clone(this.sessions.get(this.key(uid,args[0].id))??null);
 if(name==='startSession'){const a=args[0],id=a.kind==='room'?a.room:'weekend_'+crypto.randomUUID(),key=this.key(uid,id);if(this.sessions.has(key))return clone(this.sessions.get(key));if(w.activeSession)throw Error('active-session');const r=this.rooms.get(a.room);if(a.kind==='weekend'){if(w.passUses>=3)throw Error('weekend-limit');w.passUses++;}else if(!r.rebates[uid]){w.bonus+=15000-r.feeShare;r.rebates[uid]=true;}w.activeSession=id;w.activeKind=a.kind;w.activeRoom=a.room??'';const run=newSession({id,uid,kind:a.kind,room:a.room??'',seed:r?.seed??43210,topic:r?.topic??'all'},now,r?.startedAt);this.sessions.set(key,run);this.broadcast();return clone(run);}
 if(name==='moveSession'){const [d,a,o]=args,key=this.key(uid,d.id);let r=this.sessions.get(key);if(uid==='host'&&this.delayHost)await new Promise(resolve=>setTimeout(resolve,650));const expected=o?.expected;if(expected&&(r.index!==expected.index||r.phase!==expected.phase||r.questionAt!==expected.questionAt))return clone(r);r=sessionAct(r,a,this.now);if(sessionTerminal(r)||r.phase==='finished'){if(r.phase!=='finished')r=sessionFinish(r,this.now);r.credit=r.kind==='weekend'?practiceReward(r.correct):0;r.credited=true;w.bonus+=r.credit;w.activeSession='';if(r.kind==='room')this.rooms.get(r.room).scores[uid]={correct:r.correct,timeMs:r.timeMs,finished:true};}this.sessions.set(key,r);this.broadcast();return clone(r);}
 throw Error('unknown method '+name);
 }
}
