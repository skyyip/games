import {rewardRules} from './reward-rules.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {QUESTIONS} from '../src/questions.js';
import {PRIZES,BANK_VERSION,QUESTION_PLANS} from '../src/game.js';
import {COLLECTIONS as C} from '../src/schema.js';
const pools=QUESTION_PLANS[BANK_VERSION],json=JSON.stringify,answers=new Map(QUESTIONS.map(q=>[q.id,q.answer]));
const choose=values=>`tier == 0 ? ${values[0]} : tier == 1 ? ${values[1]} : ${values[2]}`;
const slots=choose(pools.map((p,i)=>`(day*${p.dayStep}+(index%5)*${p.slotStep}+${i*11})%${p.ids.length}`));
const ids=choose(pools.map(p=>json(p.ids))),keys=choose(pools.map(p=>json(p.ids.map(id=>answers.get(id)))));
const source=`rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
  function owner(uid) { return request.auth != null && request.auth.uid == uid; }
  function today() { return int((request.time.toMillis()+28800000) / 86400000); }
  function seasonNow() { let t=request.time+duration.value(8,'h'); return string(t.year())+'-'+(t.month()<10?'0':'')+string(t.month()); }
  function player(uid) { return /databases/$(database)/documents/${C.players}/$(uid); }
  function run(uid,day) { let id=string(day); return /databases/$(database)/documents/${C.players}/$(uid)/runs/$(id); }
  function result(uid,day) { let id=uid+'_'+string(day); return /databases/$(database)/documents/${C.results}/$(id); }
  function rank(uid) { return /databases/$(database)/documents/${C.rankings}/$(uid); }
  function season(uid,s) { let id=uid+'_'+s; return /databases/$(database)/documents/${C.seasons}/$(id); }
  // Evaluate one tier only. A full-bank answer map exceeded the 1,000-expression budget.
  function question(day,index) {
   let tier=int(index / 5);
   let slot=${slots};
   let ids=${ids};
   let answers=${keys};
   return [ids[slot],answers[slot]];
  }
  function prize(n) { return n==0?0:${json(PRIZES)}[n-1]; }
  function floorPrize(n) { return n>=10?60000:n>=5?8000:0; }
  function titles(n) { return n>=1000000?['ordinary','neighbour','expert','peak','millionaire']:n>=500000?['ordinary','neighbour','expert','peak']:n>=60000?['ordinary','neighbour','expert']:n>=8000?['ordinary','neighbour']:['ordinary']; }
  function cap(index) { return 25000; }
  function timely(r) { return r.day==today() && request.time<=r.questionAt+duration.value(cap(r.index)+2000,'ms'); }
  function elapsed(r) { let ms=r.answerAt.toMillis()-r.questionAt.toMillis(); return ms>cap(r.index)?cap(r.index):ms; }
  function lifeLeft(r) { return (r.halfFor==-1?1:0)+(r.phoneFor==-1?1:0)+(r.audienceFor==-1?1:0); }
  function nameValid(name) { return name is string && name.size()>=2 && name.size()<=20; }
  function profileCreate(p,uid) {
   return p.keys().hasOnly(['uid','displayName','total','bestPrize','games','titles','unlocked','wrong','favourites','activeDay','activeKind','lastSettledDay','createdAt','updatedAt'])
    && p.uid==uid && p.get('activeKind','daily')=='daily' && nameValid(p.displayName) && p.total is int && p.total==0 && p.bestPrize is int && p.bestPrize==0 && p.games is int && p.games==0
    && p.titles==[] && p.unlocked==[] && p.wrong==[] && p.favourites==[] && p.activeDay==null && p.lastSettledDay==null && p.createdAt==request.time && p.updatedAt==request.time;
  }
  function start(r,uid,day) {
   return r.keys().hasOnly(['version','bankVersion','uid','day','season','phase','index','correct','timeMs','startedAt','questionAt','answerAt','endedAt','updatedAt','outcome','choice','halfFor','phoneFor','audienceFor','audienceHadHalf','answers','seen','payout','reason'])
    && r.version==1 && r.bankVersion=='${BANK_VERSION}' && r.uid==uid && r.day is int && day==string(today()) && r.day==today() && r.season==seasonNow()
    && r.phase=='playing' && r.index is int && r.index==0 && r.correct is int && r.correct==0 && r.timeMs is int && r.timeMs==0
    && r.startedAt==request.time && r.questionAt==request.time && r.updatedAt==request.time && r.answerAt==null && r.endedAt==null && r.outcome=='' && r.choice is int && r.choice==-1
    && r.halfFor is int && r.halfFor==-1 && r.phoneFor is int && r.phoneFor==-1 && r.audienceFor is int && r.audienceFor==-1 && r.audienceHadHalf==false
    && r.answers=={} && r.seen==[] && r.payout is int && r.payout==0 && r.reason=='' && get(player(uid)).data.activeDay==null && get(player(uid)).data.get('activeKind','daily')=='daily' && get(player(uid)).data.lastSettledDay!=r.day && getAfter(player(uid)).data.activeDay==r.day;
  }
  // Strict diff allowlists preserve immutable fields and valid untouched state; do not revalidate the whole run on every update.
  function lifeline(r,o) {
   let changed=r.diff(o).affectedKeys();
   return timely(o) && (
    (changed.hasOnly(['halfFor','updatedAt']) && o.halfFor==-1 && r.halfFor is int && r.halfFor==o.index)
    || (changed.hasOnly(['phoneFor','updatedAt']) && o.phoneFor==-1 && r.phoneFor is int && r.phoneFor==o.index)
    || (changed.hasOnly(['audienceFor','audienceHadHalf','updatedAt']) && o.audienceFor==-1 && r.audienceFor is int && r.audienceFor==o.index && r.audienceHadHalf==(o.halfFor==o.index))
   );
  }
  function answer(r,o) {
   let expected=question(o.day,o.index);
   let item=r.answers[string(o.index)];
   return r.phase=='reveal' && r.diff(o).affectedKeys().hasOnly(['phase','correct','answerAt','updatedAt','outcome','choice','answers','seen'])
    && r.choice is int && r.correct is int && r.answerAt==request.time && r.seen==o.seen.concat([expected[0]])
    && r.answers.size()==o.answers.size()+1 && r.answers.diff(o.answers).affectedKeys().hasOnly([string(o.index)])
    && item.keys().hasOnly(['qid','choice','outcome','startedAt','answeredAt']) && item.qid==expected[0] && item.choice==r.choice && item.outcome==r.outcome && item.startedAt==o.questionAt && item.answeredAt==request.time
    && ((r.choice>=0 && r.choice<=3 && timely(o) && r.outcome==(r.choice==expected[1]?'correct':'wrong') && r.correct==o.correct+(r.outcome=='correct'?1:0))
      || (r.choice==-1 && r.correct==o.correct && ((r.outcome=='walk' && timely(o)) || (r.outcome=='timeout' && (today()!=o.day || request.time>=o.questionAt+duration.value(cap(o.index),'ms'))))));
  }
  function advance(r,o) {
   return o.outcome=='correct' && o.correct<15 && o.day==today() && r.diff(o).affectedKeys().hasOnly(['phase','index','timeMs','questionAt','answerAt','outcome','choice','updatedAt'])
    && r.index is int && r.index==o.index+1 && r.timeMs is int && r.timeMs==o.timeMs+elapsed(o) && r.questionAt==request.time && r.answerAt==null && r.outcome=='' && r.choice==-1;
  }
  function finishReason(r,o) {
   return (o.outcome=='wrong' && r.reason=='wrong') || (o.outcome=='walk' && r.reason=='walk') || (o.outcome=='timeout' && r.reason=='timeout')
    || (o.outcome=='correct' && ((o.correct==15 && r.reason=='complete') || (o.correct<15 && (r.reason=='walk' || (r.reason=='timeout' && o.day!=today())))));
  }
  function finished(r,o,uid) {
   return r.phase=='finished' && r.diff(o).affectedKeys().hasOnly(['phase','timeMs','payout','reason','endedAt','updatedAt']) && finishReason(r,o)
    && r.timeMs is int && r.timeMs==o.timeMs+elapsed(o) && r.payout is int && r.payout==(r.reason=='wrong'?floorPrize(o.correct):prize(o.correct)) && r.endedAt==request.time
    && getAfter(player(uid)).data.activeDay==null && getAfter(player(uid)).data.lastSettledDay==o.day;
  }
  function runUpdate(r,o,uid) {
   return r.updatedAt==request.time && (o.phase=='playing'?(r.phase=='playing'?lifeline(r,o):answer(r,o))
    :o.phase=='reveal'?(r.phase=='playing'?advance(r,o):finished(r,o,uid)):false);
  }
  function profileFinish(p,o,uid) {
   let r=getAfter(run(uid,o.activeDay)).data;
   let failed=r.outcome=='correct'?[]:[r.seen[r.seen.size()-1]];
   return o.activeDay is int && p.diff(o).affectedKeys().hasOnly(['total','bestPrize','games','titles','unlocked','wrong','activeDay','lastSettledDay','updatedAt'])
    && get(run(uid,o.activeDay)).data.phase!='finished' && r.phase=='finished' && p.activeDay==null && p.lastSettledDay==o.activeDay
    && p.total is int && p.total==o.total+r.payout && p.bestPrize==(o.bestPrize>r.payout?o.bestPrize:r.payout) && p.games==o.games+1 && p.titles==titles(p.bestPrize)
    && p.unlocked is list && p.unlocked.size()<=${QUESTIONS.length} && p.unlocked.toSet().size()==p.unlocked.size() && p.unlocked.toSet()==o.unlocked.toSet().union(r.seen.toSet())
    && p.wrong is list && p.wrong.toSet().size()==p.wrong.size() && p.wrong.toSet()==o.wrong.toSet().union(failed.toSet())
    && getAfter(result(uid,r.day)).data.completedAt==request.time && getAfter(rank(uid)).data.updatedAt==request.time && getAfter(season(uid,r.season)).data.updatedAt==request.time;
  }
  function retireExtraProfile(p,o,uid){
   return o.activeDay is int&&o.get('activeKind','daily')!='daily'&&!exists(run(uid,o.activeDay))&&p.diff(o).affectedKeys().hasOnly(['activeDay','activeKind','lastSettledDay','updatedAt'])
    &&p.activeDay==null&&p.get('activeKind','daily')=='daily'&&p.lastSettledDay==o.activeDay;
  }
  function profileUpdate(p,o,uid) {
   let changed=p.diff(o).affectedKeys();
   return p.updatedAt==request.time && (
    changed.hasOnly(['displayName','favourites','updatedAt'])?(nameValid(p.displayName) && p.favourites is list && p.favourites.toSet().size()==p.favourites.size() && p.favourites.hasOnly(o.unlocked))
    :changed.hasOnly(['activeDay','activeKind','updatedAt'])?(o.activeDay==null && o.lastSettledDay!=today() && p.get('activeKind','daily')=='daily' && p.activeDay is int && p.activeDay==today() && getAfter(run(uid,today())).data.phase=='playing')
    :(retireExtraProfile(p,o,uid)||profileFinish(p,o,uid)));
  }
  match /${C.players}/{uid} {
   allow get: if owner(uid); allow list,delete: if false;
   allow create: if owner(uid) && profileCreate(request.resource.data,uid);
   allow update: if owner(uid) && profileUpdate(request.resource.data,resource.data,uid);
   match /runs/{day} {
    allow get: if owner(uid); allow list: if owner(uid) && request.query.limit<=60; allow delete: if false;
    allow create: if owner(uid) && start(request.resource.data,uid,day);
    allow update: if owner(uid) && runUpdate(request.resource.data,resource.data,uid);
   }
  }
  function publicFinish(uid,p,r) { return owner(uid) && get(player(uid)).data.games+1==p.games && p.activeDay==null && r.phase=='finished' && r.endedAt==request.time; }
  function resultValid(v,id) {
   let p=getAfter(player(v.uid)).data;
   let r=getAfter(run(v.uid,p.lastSettledDay)).data;
   return publicFinish(v.uid,p,r) && v.keys().hasOnly(['uid','day','displayName','prize','timeMs','lifelinesLeft','correct','reason','completedAt'])
    && id==v.uid+'_'+string(r.day) && v.day==r.day && v.displayName==p.displayName && v.prize==r.payout && v.timeMs==r.timeMs && v.lifelinesLeft==lifeLeft(r) && v.correct==r.correct && v.reason==r.reason && v.completedAt==request.time;
  }
  function rankValid(v,uid) {
   let p=getAfter(player(uid)).data;
   let r=getAfter(run(uid,p.lastSettledDay)).data;
   return publicFinish(uid,p,r) && v.keys().hasOnly(['uid','displayName','total','bestPrize','games','updatedAt']) && v.uid==uid && v.displayName==p.displayName
    && v.total==p.total && v.bestPrize==p.bestPrize && v.games==p.games && v.updatedAt==request.time;
  }
  function seasonValid(v,id,old) {
   let p=getAfter(player(v.uid)).data;
   let r=getAfter(run(v.uid,p.lastSettledDay)).data;
   return publicFinish(v.uid,p,r) && v.keys().hasOnly(['uid','season','displayName','total','bestPrize','games','updatedAt'])
    && id==v.uid+'_'+r.season && v.season==r.season && v.displayName==p.displayName && v.updatedAt==request.time
    && v.total==old.total+r.payout && v.games==old.games+1 && v.bestPrize==(old.bestPrize>r.payout?old.bestPrize:r.payout);
  }
  match /${C.results}/{id} { allow get: if true; allow list: if request.query.limit<=20; allow create: if resultValid(request.resource.data,id); allow update,delete: if false; }
  match /${C.rankings}/{uid} { allow get: if true; allow list: if request.query.limit<=20; allow create,update: if rankValid(request.resource.data,uid); allow delete: if false; }
  match /${C.seasons}/{id} {
   allow get: if true; allow list: if request.query.limit<=20; allow delete: if false;
   allow create: if seasonValid(request.resource.data,id,{'total':0,'games':0,'bestPrize':0});
   allow update: if seasonValid(request.resource.data,id,resource.data);
  }
${rewardRules()}
  match /{document=**} { allow read,write: if false; }
 }
}
`;
const file=new URL('../firestore.rules',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==source)throw Error('Generated rules differ from the current bank');console.log(`Rules match ${QUESTIONS.length} questions and the current ${BANK_VERSION} schema.`);}
else{await writeFile(file,source);console.log('Generated single-bank rules:',source.length,'characters');}
