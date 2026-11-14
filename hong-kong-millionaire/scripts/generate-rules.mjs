import {readFile,writeFile} from 'node:fs/promises';import {QUESTIONS} from '../src/questions.js';import {PRIZES,BANK_VERSION} from '../src/game.js';
const ids=QUESTIONS.map(q=>q.id),pools=[1,2,3].map(t=>QUESTIONS.filter(q=>q.tier===t).map(q=>q.id)),json=JSON.stringify;
const source=`rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
  function owner(uid) { return request.auth != null && request.auth.uid == uid; }
  function today() { return int((request.time.toMillis() + 28800000) / 86400000); }
  function seasonNow() { let t=request.time + duration.value(8,'h'); return string(t.year()) + '-' + (t.month() < 10 ? '0' : '') + string(t.month()); }
  function player(uid) { return /databases/$(database)/documents/hkm_players/$(uid); }
  function run(uid,day) { let key=string(day); return /databases/$(database)/documents/hkm_players/$(uid)/runs/$(key); }
  function result(uid,day) { let key=uid+'_'+string(day); return /databases/$(database)/documents/hkm_results/$(key); }
  function rank(uid) { return /databases/$(database)/documents/hkm_rankings/$(uid); }
  function season(uid,s) { let key=uid+'_'+s; return /databases/$(database)/documents/hkm_seasons/$(key); }
  function qid(day,index) { let tier=int(index / 5); let slot=(day*17+(index%5)*7+tier*11)%30; return tier == 0 ? ${json(pools[0])}[slot] : tier == 1 ? ${json(pools[1])}[slot] : ${json(pools[2])}[slot]; }
  function key(day,index) { return ${json(Object.fromEntries(QUESTIONS.map(q=>[q.id,q.answer])))}[qid(day,index)]; }
  function prize(count) { return count == 0 ? 0 : ${json(PRIZES)}[count-1]; }
  function floorPrize(count) { return count >= 10 ? 60000 : count >= 5 ? 8000 : 0; }
  function titles(best) { return best >= 1000000 ? ['ordinary','neighbour','expert','peak','millionaire'] : best >= 500000 ? ['ordinary','neighbour','expert','peak'] : best >= 60000 ? ['ordinary','neighbour','expert'] : best >= 8000 ? ['ordinary','neighbour'] : ['ordinary']; }
  function cap(index) { return index >= 10 ? 40000 : 20000; }
  function timely(r) { return r.day == today() && request.time <= r.questionAt + duration.value(cap(r.index)+2000,'ms'); }
  function elapsed(r) { let ms=r.answerAt.toMillis()-r.questionAt.toMillis(); return ms > cap(r.index) ? cap(r.index) : ms; }
  function lifeLeft(r) { return (r.halfFor == -1 ? 1 : 0)+(r.phoneFor == -1 ? 1 : 0)+(r.audienceFor == -1 ? 1 : 0); }
  function profileValid(p,uid) {
   return p.keys().hasOnly(['uid','displayName','total','bestPrize','games','titles','unlocked','wrong','favourites','activeDay','lastSettledDay','createdAt','updatedAt'])
    && p.uid == uid && p.displayName is string && p.displayName.size() >= 2 && p.displayName.size() <= 20
    && p.total is int && p.total >= 0 && p.total <= 1000000000000 && p.bestPrize is int && p.bestPrize >= 0 && p.bestPrize <= 1000000
    && p.games is int && p.games >= 0 && p.games <= 1000000 && p.titles is list
    && p.unlocked is list && p.unlocked.size() <= 90 && p.unlocked.toSet().size() == p.unlocked.size() && p.unlocked.hasOnly(${json(ids)})
    && p.wrong is list && p.wrong.toSet().size() == p.wrong.size() && p.wrong.hasOnly(p.unlocked)
    && p.favourites is list && p.favourites.toSet().size() == p.favourites.size() && p.favourites.hasOnly(p.unlocked)
    && (p.activeDay == null || p.activeDay is int) && (p.lastSettledDay == null || p.lastSettledDay is int)
    && p.createdAt is timestamp && p.updatedAt == request.time;
  }
  function runValid(r,uid) {
   return r.keys().hasOnly(['version','bankVersion','uid','day','season','phase','index','correct','timeMs','startedAt','questionAt','answerAt','endedAt','updatedAt','outcome','choice','halfFor','phoneFor','audienceFor','audienceHadHalf','answers','seen','payout','reason'])
    && r.version == 1 && r.bankVersion == '${BANK_VERSION}' && r.uid == uid && r.day is int && r.day >= 0 && r.season is string
    && r.phase in ['playing','reveal','finished'] && r.index is int && r.index >= 0 && r.index <= 14 && r.correct is int && r.correct >= 0 && r.correct <= 15
    && r.timeMs is int && r.timeMs >= 0 && r.timeMs <= 400000 && r.startedAt is timestamp && r.questionAt is timestamp
    && (r.answerAt == null || r.answerAt is timestamp) && (r.endedAt == null || r.endedAt is timestamp) && r.updatedAt == request.time
    && r.outcome in ['','correct','wrong','walk','timeout'] && r.choice is int && r.choice >= -1 && r.choice <= 3
    && r.halfFor is int && r.halfFor >= -1 && r.halfFor <= r.index && r.phoneFor is int && r.phoneFor >= -1 && r.phoneFor <= r.index
    && r.audienceFor is int && r.audienceFor >= -1 && r.audienceFor <= r.index && r.audienceHadHalf is bool && r.answers is map && r.answers.size() <= 15 && r.seen is list && r.seen.size() == r.answers.size() && r.seen.toSet().size() == r.seen.size()
    && r.payout is int && r.payout >= 0 && r.payout <= 1000000 && r.reason in ['','wrong','walk','timeout','complete'];
  }
  function start(r,uid,day) {
   return day == string(today()) && r.day == today() && r.season == seasonNow() && r.phase == 'playing' && r.index == 0 && r.correct == 0 && r.timeMs == 0
    && r.startedAt == request.time && r.questionAt == request.time && r.answerAt == null && r.endedAt == null && r.outcome == '' && r.choice == -1
    && r.halfFor == -1 && r.phoneFor == -1 && r.audienceFor == -1 && r.audienceHadHalf == false && r.answers == {} && r.seen == [] && r.payout == 0 && r.reason == ''
    && get(player(uid)).data.activeDay == null && getAfter(player(uid)).data.activeDay == r.day;
  }
  function lifeline(r,old) {
   return old.phase == 'playing' && timely(old) && (
    (r.diff(old).affectedKeys().hasOnly(['halfFor','updatedAt']) && old.halfFor == -1 && r.halfFor == old.index)
    || (r.diff(old).affectedKeys().hasOnly(['phoneFor','updatedAt']) && old.phoneFor == -1 && r.phoneFor == old.index)
    || (r.diff(old).affectedKeys().hasOnly(['audienceFor','audienceHadHalf','updatedAt']) && old.audienceFor == -1 && r.audienceFor == old.index && r.audienceHadHalf == (old.halfFor == old.index))
   );
  }
  function answer(r,old) {
   let item=r.answers[string(old.index)];
   return old.phase == 'playing' && r.phase == 'reveal' && r.diff(old).affectedKeys().hasOnly(['phase','correct','answerAt','updatedAt','outcome','choice','answers','seen'])
    && r.seen == old.seen.concat([qid(old.day,old.index)]) && r.answerAt == request.time && r.answers.size() == old.answers.size()+1 && r.answers.diff(old.answers).affectedKeys().hasOnly([string(old.index)])
    && item.keys().hasOnly(['qid','choice','outcome','startedAt','answeredAt']) && item.qid == qid(old.day,old.index) && item.choice == r.choice && item.outcome == r.outcome && item.startedAt == old.questionAt && item.answeredAt == request.time
    && (
     (r.choice >= 0 && timely(old) && r.outcome == (r.choice == key(old.day,old.index) ? 'correct' : 'wrong') && r.correct == old.correct+(r.outcome == 'correct' ? 1 : 0))
     || (r.choice == -1 && r.correct == old.correct && ((r.outcome == 'walk' && timely(old)) || (r.outcome == 'timeout' && (today() != old.day || request.time >= old.questionAt + duration.value(cap(old.index),'ms')))))
    );
  }
  function advance(r,old) {
   return old.phase == 'reveal' && old.outcome == 'correct' && old.correct < 15 && old.day == today() && r.phase == 'playing'
    && r.diff(old).affectedKeys().hasOnly(['phase','index','timeMs','questionAt','answerAt','outcome','choice','updatedAt'])
    && r.index == old.index+1 && r.timeMs == old.timeMs+elapsed(old) && r.questionAt == request.time && r.answerAt == null && r.outcome == '' && r.choice == -1;
  }
  function finishReason(r,old) {
   return (old.outcome == 'wrong' && r.reason == 'wrong') || (old.outcome == 'walk' && r.reason == 'walk') || (old.outcome == 'timeout' && r.reason == 'timeout')
    || (old.outcome == 'correct' && ((old.correct == 15 && r.reason == 'complete') || (old.correct < 15 && (r.reason == 'walk' || (r.reason == 'timeout' && old.day != today())))));
  }
  function finished(r,old,uid) {
   return old.phase == 'reveal' && r.phase == 'finished' && r.diff(old).affectedKeys().hasOnly(['phase','timeMs','payout','reason','endedAt','updatedAt']) && finishReason(r,old)
    && r.timeMs == old.timeMs+elapsed(old) && r.payout == (r.reason == 'wrong' ? floorPrize(old.correct) : prize(old.correct)) && r.endedAt == request.time
    && getAfter(player(uid)).data.activeDay == null && getAfter(player(uid)).data.lastSettledDay == old.day;
  }
  function profileFinish(p,old,uid) {
   let r=getAfter(run(uid,old.activeDay)).data;
   let failed=r.outcome == 'correct' ? [] : [r.seen[r.seen.size()-1]];
   return old.activeDay is int && p.diff(old).affectedKeys().hasOnly(['total','bestPrize','games','titles','unlocked','wrong','activeDay','lastSettledDay','updatedAt'])
    && get(run(uid,old.activeDay)).data.phase != 'finished' && r.phase == 'finished' && p.activeDay == null && p.lastSettledDay == old.activeDay
    && p.total == old.total+r.payout && p.bestPrize == (old.bestPrize > r.payout ? old.bestPrize : r.payout) && p.games == old.games+1 && p.titles == titles(p.bestPrize)
    && p.unlocked.toSet() == old.unlocked.toSet().union(r.seen.toSet()) && p.wrong.toSet() == old.wrong.toSet().union(failed.toSet())
    && getAfter(result(uid,r.day)).data.completedAt == request.time && getAfter(rank(uid)).data.updatedAt == request.time && getAfter(season(uid,r.season)).data.updatedAt == request.time;
  }
  match /hkm_players/{uid} {
   allow get: if owner(uid); allow list, delete: if false;
   allow create: if owner(uid) && profileValid(request.resource.data,uid) && request.resource.data.total == 0 && request.resource.data.bestPrize == 0 && request.resource.data.games == 0 && request.resource.data.titles == [] && request.resource.data.unlocked == [] && request.resource.data.wrong == [] && request.resource.data.favourites == [] && request.resource.data.activeDay == null && request.resource.data.lastSettledDay == null && request.resource.data.createdAt == request.time;
   allow update: if owner(uid) && profileValid(request.resource.data,uid) && request.resource.data.createdAt == resource.data.createdAt && (
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['displayName','favourites','updatedAt'])
    || (resource.data.activeDay == null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['activeDay','updatedAt']) && request.resource.data.activeDay == today() && getAfter(run(uid,today())).data.phase == 'playing')
    || profileFinish(request.resource.data,resource.data,uid)
   );
   match /runs/{day} {
    allow get: if owner(uid); allow list: if owner(uid) && request.query.limit <= 60; allow delete: if false;
    allow create: if owner(uid) && runValid(request.resource.data,uid) && start(request.resource.data,uid,day);
    allow update: if owner(uid) && runValid(request.resource.data,uid) && (lifeline(request.resource.data,resource.data) || answer(request.resource.data,resource.data) || advance(request.resource.data,resource.data) || finished(request.resource.data,resource.data,uid));
   }
  }
  function settled(uid) { let p=getAfter(player(uid)).data; return getAfter(run(uid,p.lastSettledDay)).data; }
  function publicFinish(uid) { let before=get(player(uid)).data; let after=getAfter(player(uid)).data; return owner(uid) && before.games+1 == after.games && after.activeDay == null && settled(uid).phase == 'finished' && settled(uid).endedAt == request.time; }
  match /hkm_results/{id} {
   allow get: if true; allow list: if request.query.limit <= 20; allow update, delete: if false;
   allow create: if publicFinish(request.resource.data.uid) && request.resource.data.keys().hasOnly(['uid','day','displayName','prize','timeMs','lifelinesLeft','correct','reason','completedAt'])
    && id == request.auth.uid+'_'+string(request.resource.data.day) && request.resource.data.day == settled(request.auth.uid).day && request.resource.data.displayName == getAfter(player(request.auth.uid)).data.displayName
    && request.resource.data.prize == settled(request.auth.uid).payout && request.resource.data.timeMs == settled(request.auth.uid).timeMs && request.resource.data.lifelinesLeft == lifeLeft(settled(request.auth.uid)) && request.resource.data.correct == settled(request.auth.uid).correct && request.resource.data.reason == settled(request.auth.uid).reason && request.resource.data.completedAt == request.time;
  }
  match /hkm_rankings/{uid} {
   allow get: if true; allow list: if request.query.limit <= 20; allow delete: if false;
   allow create, update: if publicFinish(uid) && request.resource.data.keys().hasOnly(['uid','displayName','total','bestPrize','games','updatedAt']) && request.resource.data.uid == uid
    && request.resource.data.displayName == getAfter(player(uid)).data.displayName && request.resource.data.total == getAfter(player(uid)).data.total && request.resource.data.bestPrize == getAfter(player(uid)).data.bestPrize && request.resource.data.games == getAfter(player(uid)).data.games && request.resource.data.updatedAt == request.time;
  }
  match /hkm_seasons/{id} {
   allow get: if true; allow list: if request.query.limit <= 20; allow delete: if false;
   allow create: if publicFinish(request.resource.data.uid) && seasonValid(request.resource.data,id) && request.resource.data.total == settled(request.auth.uid).payout && request.resource.data.games == 1 && request.resource.data.bestPrize == settled(request.auth.uid).payout;
   allow update: if publicFinish(request.resource.data.uid) && seasonValid(request.resource.data,id) && request.resource.data.total == resource.data.total+settled(request.auth.uid).payout && request.resource.data.games == resource.data.games+1 && request.resource.data.bestPrize == (resource.data.bestPrize > settled(request.auth.uid).payout ? resource.data.bestPrize : settled(request.auth.uid).payout);
  }
  function seasonValid(s,id) { return s.keys().hasOnly(['uid','season','displayName','total','bestPrize','games','updatedAt']) && s.uid == request.auth.uid && id == request.auth.uid+'_'+s.season && s.season == settled(request.auth.uid).season && s.displayName == getAfter(player(request.auth.uid)).data.displayName && s.updatedAt == request.time; }
  match /{document=**} { allow read, write: if false; }
 }
}
`;
const file=new URL('../firestore.rules',import.meta.url);if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==source)throw Error('Generated rules differ from the current question bank');console.log('Rules match all90 question keys, plan, prizes and bank version.');}else{await writeFile(file,source);console.log('Generated independent Spark-compatible rules:',source.length,'characters');}
