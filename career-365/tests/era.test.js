import test from 'node:test';
import assert from 'node:assert/strict';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';
import {JOBS,CATEGORIES} from '../src/content.js';
import {ERA_TOPICS,ERA_PHASES,ERA_SPECIALTIES,ERA_REFERENCE_DATE} from '../src/era-content.js';
import {eraCalendar,eraPhase,eraCandidate,courseOffer,canEarnEra,eraDemand,eraMarketImpact,eraOperatingCost,eraWorkBonus,relevantEraTopics,settleEra} from '../src/era.js';
import {ERA_QUESTIONS} from '../src/era-knowledge.js';
import {questionsFor} from '../src/professional-knowledge.js';
const job=name=>JOBS.find(j=>j.name===name);
function game(name='咖啡師'){const g=new LifeGame({seed:123,name:'把時代走成自己的路'});g.chooseCareer(job(name).id);g.s.cash=1000000;g.setEraAuto(false);g.roll=()=>.95;return g;}
function ready(g){assert.equal(g.s.pending,null);g.s.ap=2;g.s.stats.energy=g.energyMax;}
function advance(g,n){for(let i=0;i<n;i++){if(g.s.pending)g.resolve(g.s.pending.choices.length-1);assert(g.endMonth());}if(g.s.pending)g.resolve(g.s.pending.choices.length-1);ready(g);}
function move(g,n){g.s.elapsed+=n;g.s.month+=n;ready(g);}
function themeGame(t){return game(JOBS.find(j=>t.categories.includes(j.category)).name);}
function qualified(g){g.s.status='employed';g.s.life.credentials[g.s.career]=true;g.s.skills[g.job.skill]=55;return g;}

test('nine dated themes,27 scenes and12 specialties cover every occupation without inventing salary averages',()=>{
 assert.equal(ERA_TOPICS.length,9);assert.equal(new Set(ERA_TOPICS.map(t=>t.id)).size,9);assert.equal(ERA_SPECIALTIES.length,12);
 for(const t of ERA_TOPICS){assert.equal(t.stages.length,3);assert.equal(t.headlines.length,5);assert(t.npc);assert(t.reference.date<=ERA_REFERENCE_DATE);assert.match(t.reference.url,/^https:\/\//);for(const row of t.stages){assert.equal(new Set(row[2]).size,3);assert(row[1].length>20);}for(const id of t.categories)assert(CATEGORIES.some(c=>c.id===id));}
 for(const j of JOBS){const g=game(j.name);assert(relevantEraTopics(g.s).length>=2);assert(g.eraDemand>=.88&&g.eraDemand<=1.12);}
});
test('calendar follows game months; phases visit all five stages and repeat on a24-month cycle',()=>{
 const g=game(),initial=JSON.stringify(g.s.era);assert.deepEqual(eraCalendar(g.s),{year:2026,month:11,label:'2026年11月'});assert.equal(JSON.stringify(g.s.era),initial);
 for(const t of ERA_TOPICS){const seen=new Set(),first=eraPhase(g.s,t.id);for(let n=0;n<24;n++){seen.add(eraPhase(g.s,t.id).id);move(g,1);}assert.equal(seen.size,ERA_PHASES.length);assert.equal(eraPhase(g.s,t.id).id,first.id);assert.equal(eraPhase(g.s,t.id).cycle,first.cycle+1);}
 assert.equal(eraCalendar(g.s).year,2044);assert.equal(eraPhase(g.s,'ai').inspiration,false);
});
test('old lives anchor the new backdrop at their current age without resetting time, wages or pending work',()=>{
 const g=game();advance(g,18);g.work();const old=structuredClone(g.s),prior=JSON.stringify(old.pending);delete old.era;const r=LifeGame.restore(old);assert(r);assert.equal(r.s.month,g.s.month);assert.equal(r.s.elapsed,g.s.elapsed);assert.equal(r.eraCalendar.label,'2026年11月');assert.equal(JSON.stringify(r.s.pending),prior);assert.equal(r.salary,g.salary);assert.equal(r.s.era.nextEvent,g.s.elapsed+6);
});
test('every theme supports three chapters, all response routes, a free pause and canonical save continuation',()=>{
 for(const t of ERA_TOPICS)for(let route=0;route<4;route++){let g=themeGame(t);g.s.cash=0;for(let stage=0;stage<3;stage++){ready(g);assert(g.exploreEra(t.id),t.id);assert.equal(g.s.pending.eraEvent.stage,stage);assert.equal(g.s.pending.choices.length,4);assert.equal(g.endMonth(),false);g=LifeGame.restore(g.s);assert(g,t.id);g.roll=()=>.95;assert(g.resolve(route));assert.equal(g.resolve(route),false);assert(g.s.cash>=0);assert(LifeGame.restore(g.s),t.id);if(route===3)break;move(g,2);}assert.equal(g.s.era.threads[t.id].stage,3);assert.equal(g.s.era.metrics[route===3?'paused':'finished'],1);assert.equal(g.s.monthWork,0);assert.equal(g.s.life.entry.practice,0);assert.equal(g.s.life.entry.assessed,false);}
});
test('coffee story remembers the chosen response and its original profession after a transfer',()=>{
 let g=game();assert(g.exploreEra('ai'));assert.match(g.s.pending.title,/無人咖啡店/);g.resolve(2);move(g,2);assert(g.chooseCareer(job('航空機師').id));ready(g);assert(g.exploreEra('ai'));assert.match(g.s.pending.text,/咖啡師的日常/);assert.match(g.s.pending.text,/跨職業協作/);assert.equal(g.s.pending.eraEvent.sourceCareer,job('咖啡師').id);g=LifeGame.restore(g.s);g.resolve(1);move(g,2);g.exploreEra('ai');assert.match(g.s.pending.title,/不只一種咖啡店/);assert.equal(g.s.pending.choices[0].reward,0);assert(LifeGame.restore(g.s));
});
test('an unrelated old project remains reachable after switching, without changing new-job demand',()=>{
 const g=game('寵物溝通師');g.exploreEra('pets');g.resolve(0);move(g,2);g.chooseCareer(job('航空機師').id);ready(g);assert(relevantEraTopics(g.s).some(t=>t.id==='pets'));const demand=eraDemand(g.s);const copy=structuredClone(g.s);delete copy.era.threads.pets;assert.equal(eraDemand(copy),demand);assert(g.exploreEra('pets'));assert.match(g.s.pending.text,/寵物溝通師/);assert.equal(g.s.pending.choices[0].reward,0);
});
test('stories respect action, recovery, due dates, two-project capacity and per-cycle opt-out',()=>{
 const g=game();g.s.ap=0;let old=JSON.stringify(g.s);assert.equal(g.exploreEra('ai'),false);assert.equal(JSON.stringify(g.s),old);ready(g);g.s.risks.delay=1;old=JSON.stringify(g.s);assert.equal(g.exploreEra('ai'),false);assert.equal(JSON.stringify(g.s),old);g.s.risks.delay=0;g.exploreEra('ai');assert.equal(g.s.ap,1);g.resolve(1);assert.equal(g.exploreEra('ai'),false);ready(g);assert(g.exploreEra('pets'));g.resolve(1);ready(g);assert.equal(g.exploreEra('climate'),false);move(g,2);assert(g.exploreEra('ai'));g.resolve(3);ready(g);assert.equal(eraCandidate(g.s,'ai'),false);assert(g.exploreEra('climate'));g.resolve(3);move(g,24);assert(eraCandidate(g.s,'ai'));
});
test('automatic encounters can be disabled; active follow-ups have priority and do not spend a focus action',()=>{
 const g=game();move(g,6);assert.equal(g.triggerEraEvent(),false);g.setEraAuto(true);g.roll=()=>0;const ap=g.s.ap;assert(g.triggerEraEvent());const id=g.s.pending.eraEvent.theme;assert.equal(g.s.ap,ap);g.resolve(1);assert.equal(g.triggerEraEvent(),false);move(g,3);assert(g.triggerEraEvent());assert.equal(g.s.pending.eraEvent.theme,id);assert.equal(g.s.pending.eraEvent.stage,1);
});
test('every specialty needs paid lessons and elapsed training, remains through transfer and grants no formal qualification',()=>{
 for(const spec of ERA_SPECIALTIES){const g=game(JOBS.find(j=>spec.categories.includes(j.category)).name),cash=g.s.cash;const offer=courseOffer(g.s,spec.id);assert.equal(offer.months,3);assert(g.enrollEraSpecialty(spec.id));for(let n=0;n<3;n++){ready(g);assert(g.studyEraSpecialty(spec.id));}assert.equal(g.s.cash,cash-offer.fee-1050);assert.equal(g.s.era.courses[spec.id].completed,false);assert.equal(g.s.life.entry.practice,0);assert.equal(g.s.life.entry.assessed,false);assert.equal(g.s.life.credentials[g.job.id],undefined);advance(g,2);assert.equal(g.s.era.courses[spec.id].completed,false);advance(g,1);assert.equal(g.s.era.courses[spec.id].completed,true);assert.equal(g.s.era.metrics.completedCourses,1);assert(LifeGame.restore(g.s),spec.id);g.chooseCareer(job('航空機師').id);assert.equal(g.s.era.courses[spec.id].completed,true);assert.equal(g.s.status,'apprentice');}
});
test('unrelated study requires six months and six lessons, with paused progress and at most two simultaneous courses',()=>{
 const g=game('咖啡師');g.s.skills.analysis=0;const id='digital-compliance',offer=courseOffer(g.s,id);assert.equal(offer.months,6);assert.equal(offer.fee,1800);g.enrollEraSpecialty(id);ready(g);g.enrollEraSpecialty('small-business-ai');ready(g);assert.equal(g.enrollEraSpecialty('age-friendly-design'),false);g.pauseEraSpecialty(id);assert(g.enrollEraSpecialty('age-friendly-design'));assert.equal(g.pauseEraSpecialty(id),false);g.pauseEraSpecialty('age-friendly-design');g.pauseEraSpecialty(id);for(let n=0;n<6;n++){ready(g);assert(g.studyEraSpecialty(id));}advance(g,5);assert.equal(g.s.era.courses[id].completed,false);advance(g,1);assert.equal(g.s.era.courses[id].completed,true);assert(LifeGame.restore(g.s));
});
test('learning actions reject missing money, energy, pending choices and captivity without charging',()=>{
 const g=game();g.s.cash=1199;let old=JSON.stringify(g.s);assert.equal(g.enrollEraSpecialty('small-business-ai'),false);assert.equal(JSON.stringify(g.s),old);g.s.cash=10000;g.enrollEraSpecialty('small-business-ai');for(const change of [()=>g.s.cash=349,()=>{g.s.cash=1000;g.s.stats.energy=11;},()=>{g.s.stats.energy=100;g.s.risks.captivity=1;}]){change();old=JSON.stringify(g.s);assert.equal(g.studyEraSpecialty('small-business-ai'),false);assert.equal(JSON.stringify(g.s),old);}g.s.risks.captivity=0;ready(g);g.exploreEra('ai');old=JSON.stringify(g.s);assert.equal(g.studyEraSpecialty('small-business-ai'),false);assert.equal(g.pauseEraSpecialty('small-business-ai'),false);assert.equal(JSON.stringify(g.s),old);
});
test('specialty bonuses are bounded and do not alter base salary or replace regulated supervised practice',()=>{
 const g=game('藥師'),salary=g.salary;g.enrollEraSpecialty('ai-assurance');for(let n=0;n<3;n++){ready(g);g.studyEraSpecialty('ai-assurance');}move(g,3);settleEra(g);assert.equal(eraWorkBonus(g.s),2);assert.equal(g.salary,salary);assert.equal(g.s.status,'apprentice');assert.equal(g.s.life.entry.practice,0);assert.equal(canEarnEra(g.s,'ai'),false);assert.equal(g.qualifyCareer(),false);
});
test('only eligible qualified work or retained qualified consultancy can earn a small trend commission',()=>{
 for(const status of ['apprentice','student','travel','overseas','early-retired','sabbatical']){const g=game();g.s.status=status;assert.equal(canEarnEra(g.s,'ai'),false,status);}const g=qualified(game());assert(canEarnEra(g.s,'ai'));g.s.status='early-retired';assert(canEarnEra(g.s,'ai'));g.s.risks.delay=1;assert.equal(canEarnEra(g.s,'ai'),false);const p=game('藥師');p.s.status='employed';assert.equal(canEarnEra(p.s,'ai'),false);p.s.life.credentials[p.job.id]=true;assert(canEarnEra(p.s,'ai'));
});
test('final commissions are probabilistic, small, disclosed and never duplicated as monthly wages',()=>{
 for(const success of [true,false]){const g=qualified(game());for(let stage=0;stage<3;stage++){ready(g);g.exploreEra('ai');if(stage===2){const choice=g.s.pending.choices[0],cash=g.s.cash;assert(choice.chance>0&&choice.chance<1);assert(choice.reward>0&&choice.reward<2000);g.roll=()=>success?0:.999;g.resolve(0);assert.equal(g.s.cash,cash-300+(success?choice.reward:0));assert.equal(g.s.era.metrics.earned,success?choice.reward:0);}else g.resolve(0);move(g,2);}assert.equal(g.s.monthWork,0);assert.equal(g.s.metrics.work,0);assert(LifeGame.restore(g.s));}
});
test('fictional market nudges stay small, preserve bank rates and retain explicit full-loss settlement',()=>{
 const g=game();for(let n=0;n<24;n++){for(const id of ['stock','etf','crypto','cards','property','derivatives'])assert(Math.abs(eraMarketImpact(g.s,id))<=.019);assert.equal(eraMarketImpact(g.s,'bank'),0);move(g,1);}g.s.assets.bank=1000;g.s.assets.derivatives=10;g.s.marketPlan.derivatives=-1;g.endMonth();assert.equal(g.s.assets.derivatives,0);assert.equal(g.s.assets.bank,1002);
});
test('business operating pressure is explicit in the monthly ledger and capped independently of wages',()=>{
 const g=qualified(game());g.startBusiness();const cost=eraOperatingCost(g.s);assert(cost>=0&&cost<=360);const salary=g.salary;g.endMonth();assert.equal(g.s.lastLedger.eraOperating,cost);assert.equal(g.salary,salary);
});
test('27 new topic questions belong only to applicable sectors and use actual answer grading',()=>{
 assert.equal(ERA_QUESTIONS.length,27);for(const t of ERA_TOPICS){const qs=ERA_QUESTIONS.filter(q=>q.theme===t.id);assert.equal(qs.length,3);for(const q of qs){const g=themeGame(t);assert(questionsFor(g.job).some(item=>item.id===q.id));g.knowledgeQuiz(q.id);const i=g.s.pending.knowledge.order.indexOf(q.answer);g.roll=()=>.999;assert(g.resolve(i));assert.equal(g.s.life.learning.correct,1);assert.equal(g.s.life.entry.practice,0);assert(LifeGame.restore(g.s));}}
});
test('malformed trend state and forged pending rewards or provenance are rejected on import and resolution',()=>{
 const g=game();g.exploreEra('ai');const raw=JSON.stringify(g.s);for(const mutate of [s=>s.era.referenceDate='2099-01-01',s=>s.era.started=s.elapsed+1,s=>s.era.threads.ai.stage=2,s=>s.era.threads.ai.sourceCareer='fake',s=>s.era.history=[{}],s=>s.era.courses.fake={},s=>s.pending.choices[0].reward=999999,s=>s.pending.choices[0].effects.cash=1000,s=>s.pending.eraEvent.cycle=99,s=>s.pending.text='偽造新聞']){const s=JSON.parse(raw);mutate(s);assert.equal(LifeGame.restore(s),null);}g.s.pending.choices[0].reward=999999;const prior=JSON.stringify(g.s);assert.equal(g.resolve(0),false);assert.equal(JSON.stringify(g.s),prior);
});
test('automatic monthly trends appear after the introductory months and stop year plans for a real choice',()=>{
 const g=new LifeGame({seed:123});g.roll=()=>.95;g.s.cash=1000000;g.enroll();const advanced=g.plan(12);assert.equal(advanced,6);assert.equal(g.s.pending.id,'era-event');const month=g.s.month;assert.equal(g.plan(12),0);assert.equal(g.s.month,month);assert(g.resolve(3));assert.equal(g.s.era.metrics.paused,1);assert(LifeGame.restore(g.s));
});
test('full lives with automatic trends and study reach65 and preserve the comic, history and retirement result',()=>{
 for(const name of ['咖啡師','AI代理工程師','藥師']){let g=game(name);g.setEraAuto(true);const spec=ERA_SPECIALTIES.find(c=>c.categories.includes(g.job.category));g.enrollEraSpecialty(spec.id);for(let n=0;n<3;n++){ready(g);g.studyEraSpecialty(spec.id);}for(let n=0;n<3000&&g.s.status!=='retired';n++){if(g.s.pending)g.resolve(g.s.pending.id==='era-event'?1:0);else g.plan(12);}assert.equal(g.s.month,RETIRE_MONTH);assert.equal(g.s.status,'retired');assert(g.s.era.history.length>0&&g.s.era.history.length<=40);assert(g.s.era.metrics.finished>0);assert.equal(g.s.era.metrics.completedCourses,1);const r=LifeGame.restore(g.s);assert(r,name);assert.deepEqual(r.retirement(),g.retirement());assert.equal(r.exploreEra('ai'),false);assert.equal(r.enrollEraSpecialty('ip-licensing'),false);}
});
