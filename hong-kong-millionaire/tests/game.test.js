import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {QUESTIONS} from '../src/questions.js';import {COMIC_QUESTIONS} from '../src/comic-questions.js';import {URBAN_QUESTIONS} from '../src/urban-questions.js';import {DAILY_DESIGN_QUESTIONS} from '../src/daily-design-questions.js';import {BANK_VERSION,QUESTION_PLANS} from '../src/game.js';import {questionShareText} from '../src/question-share.js';import {newRun,act,finish,hkDay,dayEnd,questionFor,questionId,presentation,MODES,PRIZES,insurance,earned,titleFor,remaining,limitMs,audience,removedOptions,livesLeft,shareText,nextProfile,spent} from '../src/game.js';
const NOW=Date.UTC(2026,10,14,4),DAY=hkDay(NOW);
function rig(){let now=NOW,run=newRun(DAY,now);return {get run(){return run;},step(ms){now+=ms;},answer(correct=true){run=act(run,{type:'answer',choice:(questionFor(run).answer+(correct?0:1))%4},now+=1000);return run;},next(){run=act(run,{type:'next'},now+=300);},action(a){run=act(run,a,now);return run;}};}
test('291 factual question records have stable unique IDs, distinct choices, sources and existing artwork',()=>{assert.equal(QUESTIONS.length,291);assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,291);for(const [i,size]of [84,134,73].entries())assert.equal(QUESTIONS.filter(q=>q.tier===i+1).length,size);for(const q of QUESTIONS){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.answer>=0&&q.answer<=3);assert(q.explanation&&q.hint&&q.source.label);assert.equal(new URL(q.source.url).protocol,'https:');assert(existsSync(new URL('../assets/'+q.art+'.svg',import.meta.url)));}});
test('daily plans are shared, repeatable, progressive and have15 unique questions',()=>{const modes=new Set();for(let day=DAY;day<DAY+30;day++){const ids=[];for(let i=0;i<15;i++){ids.push(questionId(day,i));assert.equal(questionFor({...newRun(day,NOW),index:i}).tier,Math.floor(i/5)+1);assert.deepEqual(presentation(day,i),presentation(day,i));assert(presentation(day,i).partial>=.05&&presentation(day,i).partial<=.1);modes.add(presentation(day,i).mode);}assert.equal(new Set(ids).size,15);}assert.deepEqual(modes,new Set(MODES));});
test('Hong Kong midnight defines the daily boundary instead of UTC or device timezone',()=>{const last=Date.UTC(2026,10,14,15,59,59,999),next=last+1;assert.equal(hkDay(next),hkDay(last)+1);assert.equal(dayEnd(hkDay(last)),next);});
for(const count of [0,4,5,9,10,13,14])test(`wrong after${count} correct answers pays only the applicable insurance`,()=>{const r=rig();for(let i=0;i<count;i++){r.answer();r.next();}r.answer(false);assert.equal(r.run.phase,'finished');assert.equal(r.run.correct,count);assert.equal(r.run.payout,insurance(count));assert.equal(r.run.reason,'wrong');});
for(const count of [0,4,5,9,10,14])test(`walking after${count} correct answers preserves the actual current prize`,()=>{const r=rig();for(let i=0;i<count;i++){r.answer();if(i<count-1)r.next();}r.action({type:'walk'});assert.equal(r.run.payout,earned(count));assert.equal(r.run.reason,'walk');});
test('15 final correct answers win the virtual million exactly once',()=>{const r=rig();for(let i=0;i<15;i++){r.answer();if(i<14)r.next();}assert.equal(r.run.payout,1000000);assert.equal(titleFor(r.run.payout).id,'millionaire');assert.throws(()=>r.action({type:'answer',choice:0}),/already-finished/);assert.equal(r.run.timeMs,15000);});
test('every question has a 25-second deadline that survives reload and hints',()=>{const r=rig(),at=r.run.questionAt;r.action({type:'life',kind:'phone'});assert.equal(r.run.questionAt,at);assert.equal(remaining(JSON.parse(JSON.stringify(r.run)),at+24000),1000);r.step(25000);r.action({type:'answer',choice:questionFor(r.run).answer});assert.equal(r.run.reason,'timeout');assert.equal(r.run.payout,0);assert.equal(r.run.timeMs,25000);for(let i=0;i<15;i++)assert.equal(limitMs(i),25000);const later={...newRun(DAY,NOW),index:10,correct:10};assert.equal(act(later,{type:'answer',choice:questionFor(later).answer},NOW+24999).correct,11);assert.equal(act(later,{type:'timeout'},NOW+25000).payout,60000);});
test('all three lifelines spend once, half keeps the correct choice, and simulated votes sum100',()=>{let r=newRun(DAY,NOW);for(const kind of ['half','phone','audience']){r=act(r,{type:'life',kind},NOW+100);assert.throws(()=>act(r,{type:'life',kind},NOW+101),/life-used/);}assert.equal(livesLeft(r),0);const removed=removedOptions(r);assert.equal(removed.length,2);assert(!removed.includes(questionFor(r).answer));assert.throws(()=>act(r,{type:'answer',choice:removed[0]},NOW+200),/invalid-choice/);const votes=audience(r);assert.equal(votes.reduce((a,b)=>a+b),100);for(const option of removed)assert.equal(votes[option],0);});
test('hard questions can produce misleading simulated majorities while polls are deterministic',()=>{let incorrect=0;for(let day=DAY;day<DAY+60;day++){const r={...newRun(day,NOW),index:14,correct:14,audienceFor:14};const votes=audience(r);assert.deepEqual(votes,audience(r));assert.equal(votes.reduce((a,b)=>a+b),100);if(votes.indexOf(Math.max(...votes))!==questionFor(r).answer)incorrect++;}assert(incorrect>10&&incorrect<50);});
test('an already wrong server reveal cannot become a richer timeout after midnight',()=>{let r=newRun(DAY,NOW);for(let i=0;i<14;i++){r=act(r,{type:'answer',choice:questionFor(r).answer},NOW+1000);r=act(r,{type:'next'},NOW+1200);}r=act(r,{type:'answer',choice:(questionFor(r).answer+1)%4},NOW+1400,{autoFinish:false});assert.equal(r.outcome,'wrong');r=act(r,{type:'timeout'},dayEnd(DAY)+1);assert.equal(r.payout,60000);assert.equal(r.reason,'wrong');});
test('spoiler-free sharing excludes questions, option text and personal account information',()=>{const r=rig();r.answer(false);const shared=shareText(r.run,'https://sky-playground.com/games/hong-kong-millionaire/');assert(shared.includes('🟥'));assert(shared.includes('香港百萬富翁'));assert(!shared.includes(questionFor(r.run).question));for(const option of questionFor(r.run).options)assert(!shared.includes(option));});
test('completed accounts unlock permanent culture records but no guest career profile is written by the engine',()=>{const r=rig();r.answer(false);const p={total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[],activeDay:DAY,lastSettledDay:null};const next=nextProfile(p,r.run);assert.equal(next.games,1);assert.equal(next.unlocked.length,1);assert.deepEqual(next.wrong,next.unlocked);assert.equal(next.activeDay,null);assert.deepEqual(next.titles,['ordinary']);assert.equal(p.games,0);});
test('generated rules and indexes describe this independent game without paid functions or other game collections',()=>{const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');for(const pool of QUESTION_PLANS[BANK_VERSION]){assert(rules.includes(JSON.stringify(pool.ids)));assert(rules.includes(JSON.stringify(pool.ids.map(id=>QUESTIONS.find(q=>q.id===id).answer))));}assert(!/frogger_|career_|bbl_/.test(rules));const indexes=JSON.parse(readFileSync(new URL('../firestore.indexes.json',import.meta.url)));assert.equal(indexes.indexes.length,4);assert.equal(JSON.parse(readFileSync(new URL('../.firebaserc',import.meta.url))).projects.default,'sky-playground-millionaire');});
test('a final correct answer awaiting cloud settlement stays complete across midnight',()=>{let r=newRun(DAY,NOW);for(let i=0;i<15;i++){r=act(r,{type:'answer',choice:questionFor(r).answer},NOW+1000,{autoFinish:false});if(i<14)r=act(r,{type:'next'},NOW+1200);}const done=act(r,{type:'timeout'},dayEnd(DAY)+1);assert.equal(done.reason,'complete');assert.equal(done.payout,1000000);});

test('expanded pools reach every question and never repeat within a daily plan',()=>{
 const seen=new Set();
 for(let day=DAY;day<DAY+180;day++){
  const ids=Array.from({length:15},(_,index)=>questionId(day,index));assert.equal(new Set(ids).size,15);
  ids.forEach(id=>seen.add(id));
  for(let index=0;index<15;index++){const q=questionFor({...newRun(day,NOW),index}),p=presentation(day,index);assert((q.textOnly?['text']:(q.modes??MODES)).includes(p.mode));}
 }
 assert.equal(seen.size,QUESTIONS.length);for(const q of URBAN_QUESTIONS)assert(seen.has(q.id));
});
test('rules use one question bank and the standard game collections',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');assert(rules.includes('p.unlocked.size()<='+QUESTIONS.length));
 assert(rules.includes(BANK_VERSION));for(const pool of QUESTION_PLANS[BANK_VERSION])assert(rules.includes(JSON.stringify(pool.ids)));
 assert(rules.includes('question(o.day,o.index)'));assert(rules.includes('hkm_players'));assert(!/hkm_v4_|hk-2026-11-v[1234]/.test(rules));
});
test('question sharing is deliberate and contains no answer key, explanation, hint or account data',()=>{
 const q={...URBAN_QUESTIONS[7],explanation:'PRIVATE_EXPLANATION',hint:'PRIVATE_HINT',answer:3,uid:'PRIVATE_UID'};
 const shared=questionShareText(q,'https://sky-playground.com/games/hong-kong-millionaire/');
 assert(shared.includes(q.question));for(const option of q.options)assert(shared.includes(option));
 for(const secret of ['PRIVATE_EXPLANATION','PRIVATE_HINT','PRIVATE_UID','正確答案'])assert(!shared.includes(secret));assert(shared.includes('不附答案'));
});


test('all 67 supplied topics have a distinct integrated comic question and a documented correction',()=>{
 const source=JSON.parse(readFileSync(new URL('../docs/source-67-topics.json',import.meta.url),'utf8'));
 assert.equal(source.sourceEntries-source.duplicateEntries,67);assert.equal(source.topics.length,67);assert.equal(COMIC_QUESTIONS.length,67);
 const positions=[0,0,0,0];for(const [i,q]of COMIC_QUESTIONS.entries()){
  assert.equal(q.id,'c'+String(i+1).padStart(2,'0'));assert.equal(q.sourceNumber,i+1);assert(q.review);assert(QUESTIONS.includes(q));
  assert.equal(q.art,'comic-'+String(i+1).padStart(2,'0'));assert(q.modes.every(mode=>MODES.includes(mode)));assert(q.focus.x>0&&q.focus.x<100&&q.focus.y>0&&q.focus.y<100);positions[q.answer]++;
 }
 assert(Math.max(...positions)-Math.min(...positions)<=1);
});
test('new games use one current bank and reject an unknown bank',()=>{
 assert.equal(newRun(DAY,NOW).bankVersion,'hk-2026-11');assert.deepEqual(Object.keys(QUESTION_PLANS),['hk-2026-11']);
 for(const bankVersion of ['unknown-bank']){
  assert.throws(()=>act({...newRun(DAY,NOW),bankVersion},{type:'walk'},NOW),/bank-version/);
  assert.throws(()=>questionId(DAY,0,bankVersion),/bank-version/);
 }
});

test('all 60 new supplied topics are integrated once with balanced answers and review sources',()=>{
 const draft=JSON.parse(readFileSync(new URL('../docs/source-60-topics.json',import.meta.url),'utf8'));
 assert.equal(draft.sourceEntries,60);assert.equal(draft.topics.length,60);assert.equal(DAILY_DESIGN_QUESTIONS.length,60);
 const positions=[0,0,0,0];for(const [index,q]of DAILY_DESIGN_QUESTIONS.entries()){
  assert.equal(q.id,draft.topics[index].id);assert.equal(q.sourceNumber,index+1);assert(QUESTIONS.includes(q));assert(q.review);
  assert(q.modes.every(mode=>MODES.includes(mode)));assert.equal(q.art,'daily-'+String(index+1).padStart(2,'0'));positions[q.answer]++;
 }
 assert.deepEqual(positions,[15,15,15,15]);assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,QUESTIONS.length);
});
