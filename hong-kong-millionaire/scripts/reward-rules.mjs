import {GEAR,CULTURE_CARDS,NORMAL_CARDS,FOIL_CARDS,DRAW_PRICE,GOLD_PRICE,DRAW_SLOTS,GOLD_STRIDE,WEEKEND_PASS_PRICE,WEEKEND_LIMIT,RETRY_PRICE} from '../src/economy.js';
import {ROOM_POOLS,ROOM_ASYNC_WINDOW,ROOM_INTERVAL,ROOM_DURATION,ROOM_GRACE} from '../src/session-engine.js';
import {QUESTIONS} from '../src/questions.js';
import {QUESTION_PLANS,BANK_VERSION} from '../src/game.js';
const json=JSON.stringify,keys=new Map(QUESTIONS.map(q=>[q.id,q.answer]));
export function rewardRules(){
 const prefixes=CULTURE_CARDS.reduce((out,c)=>{(out[c.series]??=[]).push(c.id);return out;},{});
 const prefixCheck=Object.entries(prefixes).map(([id,ids])=>'(w.prefix=='+json(id)+'&&'+ids.map(key=>'w.cards.get('+json(key)+',0)>0').join('&&')+')').join('||');
 const placeholders={
  __RETRY_DAYSTEP__:json(QUESTION_PLANS[BANK_VERSION].map(p=>p.dayStep)),__RETRY_SLOTSTEP__:json(QUESTION_PLANS[BANK_VERSION].map(p=>p.slotStep)),__DRAW_PRICE__:String(DRAW_PRICE),__GOLD_PRICE__:String(GOLD_PRICE),__DRAW_SLOTS__:String(DRAW_SLOTS),__GOLD_STRIDE__:String(GOLD_STRIDE),__NORMAL_SLOTS__:String(NORMAL_CARDS.length*10),__FOIL_COUNT__:String(FOIL_CARDS.length),__PASS_PRICE__:String(WEEKEND_PASS_PRICE),__PASS_LIMIT__:String(WEEKEND_LIMIT),__RETRY_PRICE__:String(RETRY_PRICE),
  __RETRY_POOL_IDS__: [1,2,3].map((_,i)=>JSON.stringify(QUESTION_PLANS[BANK_VERSION][i].ids)).reduceRight((tail,ids,i)=>i===2?ids:'tier=='+i+'?'+ids+':'+tail,''),
  __RETRY_POOL_KEYS__:[1,2,3].map((_,i)=>JSON.stringify(QUESTION_PLANS[BANK_VERSION][i].ids.map(id=>keys.get(id)))).reduceRight((tail,ids,i)=>i===2?ids:'tier=='+i+'?'+ids+':'+tail,''),
  __GEAR_PRICE__:json(Object.fromEntries(GEAR.map(g=>[g.id,g.price]))),
  __COMMON__:json(NORMAL_CARDS),__FOIL__:json(FOIL_CARDS),
  __PREFIX_CHECK__:prefixCheck,
  __FRAMES__:json(GEAR.filter(g=>g.kind==='frame').map(g=>g.id)),
  __THEMES__:json(GEAR.filter(g=>g.kind==='theme').map(g=>g.id)),
  __EXITS__:json(GEAR.filter(g=>g.kind==='exit').map(g=>g.id)),
  __SPORT_IDS__:json(ROOM_POOLS.sport.ids),__PLACE_IDS__:json(ROOM_POOLS.places.ids),
  __SPORT_KEYS__:json(ROOM_POOLS.sport.ids.map(id=>keys.get(id))),__PLACE_KEYS__:json(ROOM_POOLS.places.ids.map(id=>keys.get(id))),
  __SPORT_STRIDE__:String(ROOM_POOLS.sport.stride),__PLACE_STRIDE__:String(ROOM_POOLS.places.stride),
  __ASYNC_SECONDS__:String(ROOM_ASYNC_WINDOW/1000),__BANK__:BANK_VERSION,__ROOM_INTERVAL__:String(ROOM_INTERVAL),__ROOM_DURATION__:String(ROOM_DURATION/1000),__ROOM_DEADLINE__:String((ROOM_DURATION+ROOM_GRACE)/1000)
 };
 let body=String.raw`
  // Spendable funds are independent of the immutable pure-daily prize totals.
  function rwPath(uid){return /databases/$(database)/documents/hkm_wallets/$(uid);}
  function rrPath(id){return /databases/$(database)/documents/hkm_rooms/$(id);}
  function rsPath(uid,id){return /databases/$(database)/documents/hkm_players/$(uid)/sessions/$(id);}
  function rrSession(id,uid){return /databases/$(database)/documents/hkm_rooms/$(id)/sessions/$(uid);}
  function rwReceiptPath(uid,id){return /databases/$(database)/documents/hkm_wallets/$(uid)/receipts/$(id);}
  function rwActivePath(uid,w){return w.activeKind=='room'?rrSession(w.activeRoom,uid):rsPath(uid,w.activeSession);}
  function rwChanged(w,o,keys){return w.diff(o).affectedKeys().hasOnly(keys.concat(['revision','op','item','updatedAt']));}
  function rwWeekend(){let d=today();let n=(d+4)%7;return n==0?d-1:d+(6-n+7)%7;}
  function rwIsWeekend(){return (today()+4)%7 in [0,6];}
  function rwOwned(w){return (w.frame=='none'||(w.frame in __FRAMES__&&w.frame in w.owned))&&(w.theme=='default'||(w.theme in __THEMES__&&w.theme in w.owned))&&(w.exit=='default'||(w.exit in __EXITS__&&w.exit in w.owned))&&(w.prefix==''||__PREFIX_CHECK__);}
  function rwCreate(w,uid){
   return w.keys().hasOnly(['uid','spent','bonus','draws','cards','owned','frame','theme','exit','prefix','pass','passUses','retryBoughtDay','retryUsedDay','practiceDay','practiceEarned','activeSession','activeKind','activeRoom','revision','op','item','receipt','createdAt','updatedAt'])
    &&w.uid==uid&&w.spent is int&&w.spent==0&&w.bonus is int&&w.bonus==0&&w.draws is int&&w.draws==0&&w.cards=={}&&w.owned==[]
    &&w.frame=='none'&&w.theme=='default'&&w.exit=='default'&&w.prefix==''&&w.pass is int&&w.pass==-1&&w.passUses is int&&w.passUses==0
    &&w.retryBoughtDay is int&&w.retryBoughtDay==-1&&w.retryUsedDay is int&&w.retryUsedDay==-1
    &&w.practiceDay is int&&w.practiceDay==-1&&w.practiceEarned is int&&w.practiceEarned==0&&w.activeSession==''&&w.activeKind==''&&w.activeRoom==''
    &&w.revision is int&&w.revision==0&&w.op=='create'&&w.item==''&&w.receipt==''&&w.createdAt==request.time&&w.updatedAt==request.time&&exists(player(uid));
  }
  function rwReceipt(w,o,uid){
   let r=getAfter(rwReceiptPath(uid,w.receipt)).data;
   return w.receipt is string&&w.receipt.matches('^[a-f0-9-]{36}$')&&r.uid==uid&&r.op==w.op&&r.item==w.item&&r.revision==w.revision&&r.cost==w.spent-o.spent&&r.createdAt==request.time;
  }
  function rwDraw(w,o,gold){
   let seed=o.createdAt.toMillis();let slot=(seed+o.draws*37)%__DRAW_SLOTS__;
   let id=gold?__FOIL__[(seed+o.draws*__GOLD_STRIDE__)%__FOIL_COUNT__]:(slot<__NORMAL_SLOTS__?__COMMON__[int(slot / 10)]:__FOIL__[slot-__NORMAL_SLOTS__]);
   return rwChanged(w,o,['spent','draws','cards','receipt'])&&w.item==id&&w.spent==o.spent+(gold?__GOLD_PRICE__:__DRAW_PRICE__)&&w.draws is int&&w.draws==o.draws+1
    &&w.cards.diff(o.cards).affectedKeys().hasOnly([id])&&w.cards[id] is int&&w.cards[id]==o.cards.get(id,0)+1;
  }
  function rwBuy(w,o){let price=__GEAR_PRICE__[w.item];return rwChanged(w,o,['spent','owned','receipt'])&&!(w.item in o.owned)&&w.owned==o.owned.concat([w.item])&&w.spent==o.spent+price;}
  function rwShop(w,o,uid){
   return rwReceipt(w,o,uid)&&get(player(uid)).data.total+o.bonus-o.spent>=w.spent-o.spent&&(
    w.op=='draw'?rwDraw(w,o,false):w.op=='gold'?rwDraw(w,o,true):w.op=='buy'?rwBuy(w,o):
    w.op=='equip'?(rwChanged(w,o,['frame','theme','exit','prefix','receipt'])&&w.spent==o.spent&&w.item in ['frame','theme','exit','prefix']&&rwOwned(w)):
    (w.op=='pass'&&rwChanged(w,o,['pass','passUses','spent','receipt'])&&o.pass!=rwWeekend()&&w.pass is int&&w.pass==rwWeekend()&&w.passUses==0&&w.spent==o.spent+__PASS_PRICE__)
    ||(w.op=='retry-ticket'&&rwChanged(w,o,['retryBoughtDay','spent','receipt'])&&o.get('retryBoughtDay',-1)!=today()&&w.retryBoughtDay is int&&w.retryBoughtDay==today()&&w.spent==o.spent+__RETRY_PRICE__));
  }
  function rwStart(w,o,uid){
   let r=getAfter(rwActivePath(uid,w)).data;
   return rwChanged(w,o,['activeSession','activeKind','activeRoom','passUses','bonus','retryUsedDay'])&&o.activeSession==''&&w.item==r.id&&w.activeSession==r.id&&w.activeKind==r.kind&&w.activeRoom==r.room
    &&r.startedAt==request.time&&r.uid==uid&&r.phase=='playing'&&(
     r.kind=='weekend'?(w.passUses is int&&o.get('passUses',0)<__PASS_LIMIT__&&w.passUses==o.get('passUses',0)+1&&w.bonus==o.bonus&&w.get('retryUsedDay',-1)==o.get('retryUsedDay',-1)):
     (w.get('passUses',0)==o.get('passUses',0)&&w.bonus==o.bonus&&(r.kind=='retry'?(o.get('retryBoughtDay',-1)==today()&&o.get('retryUsedDay',-1)!=today()&&w.retryUsedDay is int&&w.retryUsedDay==today()):(r.kind=='room'&&w.get('retryUsedDay',-1)==o.get('retryUsedDay',-1)))));
  }
  function rwSettle(w,o,uid){
   let r=getAfter(rwActivePath(uid,o)).data;
   let oldEarned=o.practiceDay==r.day?o.practiceEarned:0;
   let reward=r.correct*500>5000?5000:r.correct*500;
   let capped=100000-oldEarned<reward?100000-oldEarned:reward;
   let credit=r.kind=='weekend'?capped:r.kind=='retry'?r.payout:0;
   return rwChanged(w,o,['bonus','activeSession','activeKind','activeRoom','practiceDay','practiceEarned'])
    &&o.activeSession!=''&&w.item==o.activeSession&&get(rwActivePath(uid,o)).data.phase!='finished'&&r.phase=='finished'&&r.credited==true&&r.endedAt==request.time&&r.credit==credit
    &&w.bonus==o.bonus+credit&&w.activeSession==''&&w.activeKind==''&&w.activeRoom==''
    &&(r.kind=='weekend'?(r.day>=o.practiceDay&&w.practiceDay==r.day&&w.practiceEarned==oldEarned+credit&&w.practiceEarned<=100000):(w.practiceDay==o.practiceDay&&w.practiceEarned==o.practiceEarned));
  }
  function rwRoomDebit(w,o,uid){
   let r=getAfter(rrPath(w.item)).data;let cost=r.entryFee+15000;
   return rwChanged(w,o,['spent'])&&r.status=='lobby'&&uid in r.players&&r.updatedAt==request.time&&w.spent==o.spent+cost&&get(player(uid)).data.total+o.bonus-o.spent>=cost
    &&(w.op=='create-room'?(r.hostUid==uid&&r.createdAt==request.time):!(uid in get(rrPath(w.item)).data.players));
  }
  function rwRoomCredit(w,o,uid){
   let before=get(rrPath(w.item)).data;let after=getAfter(rrPath(w.item)).data;
   return rwChanged(w,o,['bonus'])&&uid in before.players&&after.updatedAt==request.time&&w.bonus==o.bonus+rrCreditAmount(before,uid)
    &&(before.rebates[uid]!=after.rebates[uid]||before.refunds[uid]!=after.refunds[uid]||before.paidTo!=after.paidTo);
  }
  function rwRetire(w,o,uid){
   return rwChanged(w,o,['activeSession','activeKind','activeRoom'])&&o.activeSession!=''&&w.item==o.activeSession&&w.activeSession==''&&w.activeKind==''&&w.activeRoom==''
    &&(!(o.activeKind in ['room','weekend','retry'])||(o.activeKind=='room'&&(!exists(rrPath(o.activeRoom))||!get(rrPath(o.activeRoom)).data.keys().hasAny(['entryFee'])))||!exists(rwActivePath(uid,o))||get(rwActivePath(uid,o)).data.phase=='finished');
  }
  function rwUpdate(w,o,uid){
   return w.updatedAt==request.time&&w.revision is int&&w.revision==o.revision+1&&w.spent is int&&w.spent>=0&&w.spent<=1000000000000&&w.bonus is int&&w.bonus>=0&&w.bonus<=1000000000000
    &&(w.op in ['draw','gold','buy','equip','pass','retry-ticket']?rwShop(w,o,uid):w.op=='start-session'?rwStart(w,o,uid):w.op=='settle-session'?rwSettle(w,o,uid):w.op=='retire-extra'?rwRetire(w,o,uid):w.op in ['create-room','join-room']?rwRoomDebit(w,o,uid):w.op in ['room-prize','room-refund','room-rebate']?rwRoomCredit(w,o,uid):false);
  }
  match /hkm_wallets/{uid}{
   allow get:if owner(uid);allow list,delete:if false;
   allow create:if owner(uid)&&rwCreate(request.resource.data,uid);
   allow update:if owner(uid)&&rwUpdate(request.resource.data,resource.data,uid);
   match /receipts/{id}{
    allow get:if owner(uid);allow list,update,delete:if false;
    allow create:if owner(uid)&&id.matches('^[a-f0-9-]{36}$')&&request.resource.data.keys().hasOnly(['uid','op','item','cost','revision','createdAt'])
     &&request.resource.data.createdAt==request.time&&request.resource.data.uid==uid
     &&getAfter(rwPath(uid)).data.receipt==id&&getAfter(rwPath(uid)).data.op in ['draw','gold','buy','equip','pass','retry-ticket']
     &&request.resource.data.op==getAfter(rwPath(uid)).data.op&&request.resource.data.item==getAfter(rwPath(uid)).data.item
     &&request.resource.data.revision==getAfter(rwPath(uid)).data.revision&&getAfter(rwPath(uid)).data.updatedAt==request.time
     &&request.resource.data.cost==getAfter(rwPath(uid)).data.spent-get(rwPath(uid)).data.spent;
   }
  }
  match /hkm_styles/{uid}{
   allow get:if true;allow list,delete:if false;
   allow create,update:if owner(uid)&&request.resource.data.keys().hasOnly(['uid','frame','theme','prefix','updatedAt'])
    &&request.resource.data.uid==uid&&request.resource.data.updatedAt==request.time
    &&request.resource.data.frame==getAfter(rwPath(uid)).data.frame&&request.resource.data.theme==getAfter(rwPath(uid)).data.theme&&request.resource.data.prefix==getAfter(rwPath(uid)).data.prefix;
  }

  function rsRoomQuestion(seed,index,topic){
   let ids=topic=='sport'?__SPORT_IDS__:__PLACE_IDS__;let answers=topic=='sport'?__SPORT_KEYS__:__PLACE_KEYS__;let stride=topic=='sport'?__SPORT_STRIDE__:__PLACE_STRIDE__;
   let slot=(seed*17+index*stride)%ids.size();return [ids[slot],answers[slot]];
  }
  function rsRetryQuestion(r){
   let tier=int(r.index / 5);let ids=__RETRY_POOL_IDS__;let answers=__RETRY_POOL_KEYS__;
   let offset=5+(r.seed%int((ids.size()-5) / 5))*5;
   let slot=(r.day*__RETRY_DAYSTEP__[tier]+(offset+r.index%5)*__RETRY_SLOTSTEP__[tier]+tier*11)%ids.size();return [ids[slot],answers[slot]];
  }
  function rsQuestion(r){
   return r.kind=='room'?(r.topic=='all'?question(r.seed,r.index<3?r.index:r.index<7?r.index+2:r.index+3):rsRoomQuestion(r.seed,r.index,r.topic))
    :r.kind=='retry'?rsRetryQuestion(r):question(r.seed,r.index);
  }
  function rsTimely(r){return (r.get('roomMode','live')!='async'||request.time<r.deadlineAt)&&(r.kind=='room'||r.day==today())&&request.time>=r.questionAt&&request.time<=r.questionAt+duration.value(cap(r.index)+2000,'ms');}
  function rsCreate(r,uid,id,roomId){
   let w=getAfter(rwPath(uid)).data;
   return r.keys().hasOnly(['id','uid','kind','seed','topic','room','bankVersion','day','count','phase','index','correct','timeMs','startedAt','questionAt','answerAt','endedAt','outcome','choice','halfFor','phoneFor','audienceFor','answers','seen','payout','credit','credited','reason','updatedAt','roomMode','deadlineAt'])
    &&r.id==id&&r.id is string&&r.id.size()<=100&&r.uid==uid&&r.bankVersion=='__BANK__'&&r.seed is int&&r.seed>=0&&r.seed<=1000000000&&r.day is int&&(roomId!=''?r.day==int((get(rrPath(roomId)).data.startedAt.toMillis()+28800000) / 86400000):r.day==today())
    &&r.count is int&&r.phase=='playing'&&r.index is int&&r.index==0&&r.correct is int&&r.correct==0&&r.timeMs is int&&r.timeMs==0&&r.startedAt==request.time&&r.updatedAt==request.time
    &&r.answerAt==null&&r.endedAt==null&&r.outcome==''&&r.choice is int&&r.choice==-1&&r.halfFor is int&&r.halfFor==-1&&r.phoneFor is int&&r.phoneFor==-1&&r.audienceFor is int&&r.audienceFor==-1
    &&r.answers=={}&&r.seen==[]&&r.payout is int&&r.payout==0&&r.credit is int&&r.credit==0&&r.credited==false&&r.reason==''
    &&w.op=='start-session'&&w.item==id&&w.activeSession==id&&w.activeKind==r.kind&&w.activeRoom==r.room&&w.updatedAt==request.time
    &&(roomId!=''?(r.kind=='room'&&r.room==roomId&&id==roomId&&r.count==10&&get(rrPath(roomId)).data.status=='playing'&&uid in get(rrPath(roomId)).data.players&&r.seed==get(rrPath(roomId)).data.seed&&r.topic==get(rrPath(roomId)).data.topic&&(get(rrPath(roomId)).data.get('mode','live')=='async'?(r.roomMode=='async'&&r.questionAt==request.time&&r.deadlineAt==get(rrPath(roomId)).data.startedAt+duration.value(__ASYNC_SECONDS__,'s')&&request.time<r.deadlineAt):(!r.keys().hasAny(['roomMode','deadlineAt'])&&r.questionAt==get(rrPath(roomId)).data.startedAt&&request.time<get(rrPath(roomId)).data.startedAt+duration.value(__ROOM_DURATION__,'s')))):
     (!r.keys().hasAny(['roomMode','deadlineAt'])&&r.room==''&&r.topic=='all'&&r.count==15&&r.questionAt==request.time&&((r.kind=='weekend'&&id.matches('^weekend_[a-f0-9-]{36}$')&&rwIsWeekend()&&get(rwPath(uid)).data.pass==rwWeekend()&&get(rwPath(uid)).data.get('passUses',0)<__PASS_LIMIT__)||(r.kind=='retry'&&id.matches('^retry_[a-f0-9-]{36}$')&&get(rwPath(uid)).data.get('retryBoughtDay',-1)==today()&&get(rwPath(uid)).data.get('retryUsedDay',-1)!=today()))));
  }
  function rsLife(r,o){
   let changed=r.diff(o).affectedKeys();
   return rsTimely(o)&&(
    changed.hasOnly(['halfFor','updatedAt'])?(o.halfFor==-1&&r.halfFor is int&&r.halfFor==o.index):
    changed.hasOnly(['phoneFor','updatedAt'])?(o.phoneFor==-1&&r.phoneFor is int&&r.phoneFor==o.index):
    (changed.hasOnly(['audienceFor','updatedAt'])&&o.audienceFor==-1&&r.audienceFor is int&&r.audienceFor==o.index));
  }
  function rsAnswer(r,o){
   let expected=rsQuestion(o);let item=r.answers[string(o.index)];
   return r.phase=='reveal'&&r.diff(o).affectedKeys().hasOnly(['phase','correct','answerAt','updatedAt','outcome','choice','answers','seen'])
    &&r.choice is int&&r.correct is int&&r.answerAt==request.time&&r.seen==o.seen.concat([expected[0]])&&r.answers.size()==o.answers.size()+1&&r.answers.diff(o.answers).affectedKeys().hasOnly([string(o.index)])
    &&item.keys().hasOnly(['qid','choice','outcome','startedAt','answeredAt'])&&item.qid==expected[0]&&item.choice==r.choice&&item.outcome==r.outcome&&item.startedAt==o.questionAt&&item.answeredAt==request.time
    &&((r.choice>=0&&r.choice<=3&&rsTimely(o)&&r.outcome==(r.choice==expected[1]?'correct':'wrong')&&r.correct==o.correct+(r.outcome=='correct'?1:0))
     ||(r.choice==-1&&r.correct==o.correct&&((r.outcome=='walk'&&rsTimely(o))||(r.outcome=='timeout'&&((o.kind!='room'&&o.day!=today())||(o.get('roomMode','live')=='async'&&request.time>=o.deadlineAt)||request.time>=o.questionAt+duration.value(cap(o.index),'ms'))))));
  }
  function rsAdvance(r,o){
   return o.index<o.count-1&&(o.kind=='room'?o.outcome!='walk':(o.outcome=='correct'&&o.day==today()))
    &&r.diff(o).affectedKeys().hasOnly(['phase','index','timeMs','questionAt','answerAt','outcome','choice','updatedAt'])&&r.index is int&&r.index==o.index+1
    &&r.timeMs is int&&r.timeMs==o.timeMs+elapsed(o)&&r.answerAt==null&&r.outcome==''&&r.choice==-1
    &&(o.kind=='room'&&o.get('roomMode','live')!='async'?(r.questionAt==o.questionAt+duration.value(__ROOM_INTERVAL__,'ms')&&request.time>=r.questionAt):(r.questionAt==request.time&&(o.get('roomMode','live')!='async'||request.time<o.deadlineAt)));
  }
  function rsReason(o){
   return o.kind=='room'&&o.index==o.count-1?'complete':o.correct==15?'complete':o.outcome=='correct'?(o.kind!='room'&&o.day!=today()?'timeout':'walk'):o.outcome;
  }
  function rsFinish(r,o,uid){
   let w=getAfter(rwPath(uid)).data;let reason=rsReason(o);
   return r.phase=='finished'&&r.diff(o).affectedKeys().hasOnly(['phase','timeMs','payout','reason','endedAt','updatedAt','credit','credited'])
    &&r.reason==reason&&r.timeMs is int&&r.timeMs==o.timeMs+elapsed(o)&&r.payout is int&&r.payout==(o.kind=='room'?0:reason=='wrong'?floorPrize(o.correct):prize(o.correct))
    &&get(rwPath(uid)).data.activeSession==o.id&&get(rwPath(uid)).data.activeKind==o.kind&&get(rwPath(uid)).data.activeRoom==o.room
    &&r.endedAt==request.time&&r.credit is int&&r.credit>=0&&r.credited==true&&w.op=='settle-session'&&w.item==o.id&&w.activeSession==''&&w.updatedAt==request.time
    &&(o.kind=='room'?(get(rrPath(o.room)).data.status=='playing'&&(o.get('roomMode','live')!='async'||request.time<o.deadlineAt)?(getAfter(rrPath(o.room)).data.scores[uid].finished==true&&getAfter(rrPath(o.room)).data.scores[uid].finishedAt==request.time):(get(rrPath(o.room)).data.status in ['finished','cancelled']||(o.get('roomMode','live')=='async'&&request.time>=o.deadlineAt))):true);
  }
  function rsUpdate(r,o,uid){return r.updatedAt==request.time&&((o.phase in ['playing','reveal']&&r.diff(o).affectedKeys().hasOnly(['updatedAt']))||(o.phase=='playing'?(r.phase=='playing'?rsLife(r,o):rsAnswer(r,o)):o.phase=='reveal'?(r.phase=='playing'?rsAdvance(r,o):rsFinish(r,o,uid)):false));}
  match /hkm_players/{uid}/sessions/{id}{
   allow get:if owner(uid);allow list:if owner(uid)&&request.query.limit<=60;allow delete:if false;
   allow create:if owner(uid)&&rsCreate(request.resource.data,uid,id,'');
   allow update:if owner(uid)&&rsUpdate(request.resource.data,resource.data,uid);
  }

  function rrEmpty(){return {'correct':0,'timeMs':0,'finished':false,'finishedAt':null};}
  function rrDebit(uid,id,cost,op){let w=getAfter(rwPath(uid)).data;return w.op==op&&w.item==id&&w.updatedAt==request.time&&w.spent==get(rwPath(uid)).data.spent+cost;}
  function rrCreate(v,id){
   let uid=request.auth.uid;
   return v.keys().hasOnly(['id','hostUid','hostName','players','names','topic','entryFee','pool','feeShare','rebates','refunds','seed','status','scores','winner','winnerOrder','paidTo','createdAt','startedAt','updatedAt','mode'])
    &&id.matches('^[A-HJ-NP-Z2-9]{8}$')&&v.id==id&&v.hostUid==uid&&v.hostName==get(player(uid)).data.displayName&&v.players==[uid]&&v.names.size()==1&&v.names.keys().hasOnly([uid])&&v.names[uid]==v.hostName&&v.scores.size()==1&&v.scores.keys().hasOnly([uid])&&v.scores[uid]==rrEmpty()
    &&v.rebates.size()==1&&v.rebates.keys().hasOnly([uid])&&v.rebates[uid]==false&&v.refunds.size()==1&&v.refunds.keys().hasOnly([uid])&&v.refunds[uid]==false
    &&v.entryFee is int&&v.entryFee>=1000&&v.entryFee<=500000&&v.pool==v.entryFee&&v.feeShare==0
    &&v.mode=='async'&&v.topic in ['all','sport','places']&&v.seed is int&&v.seed>=0&&v.seed<=1000000000
    &&v.status=='lobby'&&v.winner==''&&v.winnerOrder==-1&&v.paidTo==''&&v.createdAt==request.time&&v.startedAt==null&&v.updatedAt==request.time
    &&rrDebit(uid,id,v.entryFee+15000,'create-room');
  }
  function rrJoin(v,o,id){
   let uid=request.auth.uid;
   return o.status=='lobby'&&request.time<o.createdAt+duration.value(1,'h')&&o.players.size()<4&&!(uid in o.players)&&v.diff(o).affectedKeys().hasOnly(['players','names','scores','pool','rebates','refunds','updatedAt'])
    &&v.players==o.players.concat([uid])&&v.names.diff(o.names).affectedKeys().hasOnly([uid])&&v.names[uid]==get(player(uid)).data.displayName
    &&v.scores.diff(o.scores).affectedKeys().hasOnly([uid])&&v.scores[uid]==rrEmpty()&&v.pool==o.pool+o.entryFee
    &&v.rebates.diff(o.rebates).affectedKeys().hasOnly([uid])&&v.rebates[uid]==false&&v.refunds.diff(o.refunds).affectedKeys().hasOnly([uid])&&v.refunds[uid]==false
    &&rrDebit(uid,id,o.entryFee+15000,'join-room');
  }
  function rrReport(v,o,id){
   let uid=request.auth.uid;let r=getAfter(rrSession(id,uid)).data;let item=v.scores[uid];
   return o.status=='playing'&&(o.get('mode','live')!='async'||request.time<o.startedAt+duration.value(__ASYNC_SECONDS__,'s'))&&uid in o.players&&o.scores[uid].finished==false&&v.diff(o).affectedKeys().hasOnly(['scores','updatedAt'])&&v.scores.diff(o.scores).affectedKeys().hasOnly([uid])
    &&get(rrSession(id,uid)).data.phase!='finished'&&r.phase=='finished'&&r.endedAt==request.time&&item.keys().hasOnly(['correct','timeMs','finished','finishedAt'])&&item.finished==true&&item.correct==r.correct&&item.timeMs==r.timeMs&&item.finishedAt==request.time;
  }
  function rrBeats(a,b,ai,bi){return !b.finished||a.correct>b.correct||(a.correct==b.correct&&(a.timeMs<b.timeMs||(a.timeMs==b.timeMs&&ai<=bi)));}
  function rrWinner(v,o){
   let i=v.winnerOrder;let a=o.scores[o.players[i]];
   return i is int&&i>=0&&i<o.players.size()&&v.winner==o.players[i]&&a.finished&&rrBeats(a,o.scores[o.players[0]],i,0)
    &&rrBeats(a,o.scores[o.players[1]],i,1)&&(o.players.size()<3||rrBeats(a,o.scores[o.players[2]],i,2))&&(o.players.size()<4||rrBeats(a,o.scores[o.players[3]],i,3));
  }
  function rrAll(o){return o.scores[o.players[0]].finished&&o.scores[o.players[1]].finished&&(o.players.size()<3||o.scores[o.players[2]].finished)&&(o.players.size()<4||o.scores[o.players[3]].finished);}
  function rrNone(o){return !o.scores[o.players[0]].finished&&!o.scores[o.players[1]].finished&&(o.players.size()<3||!o.scores[o.players[2]].finished)&&(o.players.size()<4||!o.scores[o.players[3]].finished);}
  function rrCreditAmount(o,uid){
   return (o.startedAt!=null&&!o.rebates[uid]?15000-o.feeShare:0)+(o.status=='cancelled'&&!o.refunds[uid]?o.entryFee+(o.startedAt==null?15000:0):0)+(o.status=='finished'&&o.winner==uid&&o.paidTo==''?o.pool:0);
  }
  function rrPayment(v,o,id){
   let uid=request.auth.uid;let w=getAfter(rwPath(uid)).data;
   return uid in o.players&&v.diff(o).affectedKeys().hasOnly(['rebates','refunds','paidTo','updatedAt'])
    &&v.rebates.diff(o.rebates).affectedKeys().hasOnly([uid])&&v.refunds.diff(o.refunds).affectedKeys().hasOnly([uid])
    &&v.rebates[uid]==(o.rebates[uid]||o.startedAt!=null||o.status=='cancelled')&&v.refunds[uid]==(o.refunds[uid]||o.status=='cancelled')
    &&v.paidTo==(o.status=='finished'&&o.winner==uid&&o.paidTo==''?uid:o.paidTo)
    &&(v.rebates!=o.rebates||v.refunds!=o.refunds||v.paidTo!=o.paidTo)
    &&w.op in ['start-session','room-prize','room-refund','room-rebate']&&w.item==id&&w.updatedAt==request.time&&w.bonus==get(rwPath(uid)).data.bonus+rrCreditAmount(o,uid);
  }
  function rrUpdate(v,o,id){
   let uid=request.auth.uid;let changed=v.diff(o).affectedKeys();
   return v.updatedAt==request.time&&(
    changed.hasOnly(['players','names','scores','pool','rebates','refunds','updatedAt'])&&v.players!=o.players?rrJoin(v,o,id):
    changed.hasOnly(['status','startedAt','feeShare','updatedAt'])&&v.status=='playing'?(o.status=='lobby'&&uid==o.hostUid&&o.players.size()>=2&&request.time<o.createdAt+duration.value(1,'h')&&v.startedAt==request.time&&v.feeShare==int(30000 / o.players.size())):
    changed.hasOnly(['status','updatedAt'])&&v.status=='cancelled'&&o.status=='lobby'?(uid==o.hostUid):
    changed.hasOnly(['scores','updatedAt'])?rrReport(v,o,id):
    o.status=='playing'&&changed.hasOnly(['status','winner','winnerOrder','updatedAt'])?(uid in o.players&&(rrAll(o)||request.time>=o.startedAt+duration.value(o.get('mode','live')=='async'?__ASYNC_SECONDS__:__ROOM_DEADLINE__,'s'))&&(v.status=='finished'?rrWinner(v,o):(v.status=='cancelled'&&v.winner==''&&v.winnerOrder==-1&&rrNone(o)))):
    rrPayment(v,o,id));
  }
  match /hkm_rooms/{id}{
   allow get:if request.auth!=null;allow list:if request.auth!=null&&request.auth.uid in resource.data.players&&request.query.limit<=20;allow delete:if false;
   allow create:if request.auth!=null&&rrCreate(request.resource.data,id);
   allow update:if request.auth!=null&&rrUpdate(request.resource.data,resource.data,id);
   match /sessions/{uid}{
    allow get:if owner(uid);allow list,delete:if false;
    allow create:if owner(uid)&&rsCreate(request.resource.data,uid,id,id);
    allow update:if owner(uid)&&rsUpdate(request.resource.data,resource.data,uid);
   }
  }
`;
 for(const [key,value]of Object.entries(placeholders))body=body.replaceAll(key,value);
 return body;
}
