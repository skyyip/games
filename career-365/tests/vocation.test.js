import test from 'node:test';
import assert from 'node:assert/strict';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';
import {JOBS,EVENT_DECK} from '../src/content.js';
import {VOCATIONAL_COURSES,vocationalCourse} from '../src/vocation-content.js';
import {taskMaterial,vocationRecord,vocationEvidence,vocationRequirements} from '../src/vocation.js';
const job=name=>JOBS.find(j=>j.name===name);
function rig(name='水電工'){const g=new LifeGame({seed:123});g.chooseCareer(job(name).id);g.s.cash=500000;g.setEraAuto(false);g.roll=()=>.99;return g;}
function ready(g){g.s.pending=null;if(g.s.ap===0)g.endMonth();if(g.s.stats.energy<30&&g.s.ap>0)g.rest();if(g.s.ap===0)g.endMonth();g.s.pending=null;g.s.stats.energy=g.energyMax;}
function finish(g,{revise=false,kind='work'}={}){ready(g);assert(g.openVocationalTask(kind));g.inspectVocationalTask('clue');g.inspectVocationalTask('mentor');const t=taskMaterial(g);g.answerVocationalTask(revise?t.order.findIndex(n=>n!==t.question.answer):t.order.indexOf(t.question.answer));if(revise)assert(g.reviewVocationalConcept());assert(g.resolve(t.choices.findIndex(c=>c.approach===t.pressure.fit)));assert(LifeGame.restore(g.s));}

test('every career has a usable course; the eight featured professions have distinct authored curricula and work requirements',()=>{
 assert.equal(Object.keys(VOCATIONAL_COURSES).length,8);for(const j of JOBS){const c=vocationalCourse(j);assert.equal(c.skills.length,4);assert.equal(c.lessons.length,5);assert(c.questions.length>=4&&c.questions.every(q=>q&&q.explanation));assert(c.cases.length>=3);const g=rig(j.name);assert(g.openVocationalTask());assert(LifeGame.restore(g.s));}
 assert.match(vocationalCourse(job('法醫')).depth,/領域課程/);assert.match(vocationalCourse(job('護理師')).depth,/完整學徒/);assert.notDeepEqual(vocationalCourse(job('試吃員')).skills,vocationalCourse(job('神秘顧客')).skills);
});

test('preview, both learning aids, answering and correction spend no resources, survive reload and cannot mint rewards',()=>{
 let g=rig();const before={ap:g.s.ap,cash:g.s.cash,stats:structuredClone(g.s.stats),mastery:g.s.mastery,seed:g.s.seed,practice:g.s.life.entry.practice};assert(g.openVocationalTask());for(const k of ['clue','mentor','ai']){assert(g.inspectVocationalTask(k));assert.equal(g.inspectVocationalTask(k),false);}const t=taskMaterial(g);assert(g.answerVocationalTask(t.order.findIndex(n=>n!==t.question.answer)));assert.equal(g.answerVocationalTask(0),false);assert(g.reviewVocationalConcept());assert.equal(g.reviewVocationalConcept(),false);
 assert.deepEqual({ap:g.s.ap,cash:g.s.cash,stats:g.s.stats,mastery:g.s.mastery,seed:g.s.seed,practice:g.s.life.entry.practice},before);g=LifeGame.restore(g.s);assert(g);assert(g.s.pending.vocation.revised);assert(g.s.pending.vocation.mentor&&g.s.pending.vocation.ai);assert(g.cancelVocationalTask());assert.equal(g.s.ap,before.ap);assert.equal(vocationRecord(g.s).attempts,0);assert.equal(g.s.life.entry.practice,0);
});

test('enabling the visible curriculum changes no resources and makes the displayed evidence requirements apply before the first task',()=>{
 const g=rig(),before={seed:g.s.seed,stats:structuredClone(g.s.stats),cash:g.s.cash,ap:g.s.ap,skills:structuredClone(g.s.skills),credentials:structuredClone(g.s.life.credentials)};assert(g.enableVocationalCourse());assert.equal(g.enableVocationalCourse(),false);assert.deepEqual({seed:g.s.seed,stats:g.s.stats,cash:g.s.cash,ap:g.s.ap,skills:g.s.skills,credentials:g.s.life.credentials},before);g.s.mastery=100;g.s.life.entry.months=12;g.s.life.entry.practice=6;assert.equal(g.graduateCareer(),false);assert(LifeGame.restore(g.s));
});

test('a committed occupational task costs exactly one arrangement and the declared energy and pays no duplicate monthly wage',()=>{
 const g=rig();assert(g.openVocationalTask());g.inspectVocationalTask('clue');g.inspectVocationalTask('mentor');let t=taskMaterial(g);g.answerVocationalTask(t.order.indexOf(t.question.answer));let choice=t.choices.findIndex(c=>c.approach==='rush'),energy=g.s.stats.energy;assert(g.resolve(choice));assert.equal(g.s.ap,1);assert.equal(g.s.stats.energy,energy-18);const wage=g.s.life.gross;assert.equal(wage,g.apprenticeSalary);assert.equal(g.resolve(choice),false);assert.equal(g.s.ap,1);
 g.openVocationalTask();g.inspectVocationalTask('clue');g.inspectVocationalTask('ai');t=taskMaterial(g);g.answerVocationalTask(t.order.indexOf(t.question.answer));choice=t.choices.findIndex(c=>c.approach==='talk');energy=g.s.stats.energy;g.resolve(choice);assert.equal(g.s.ap,0);assert.equal(g.s.stats.energy,energy-22);assert.equal(g.s.life.gross,wage);assert.equal(vocationRecord(g.s).attempts,2);
});

test('all eight apprenticeships advance through concrete chapters, retain proof and require training time before graduation',()=>{
 for(const name of Object.keys(VOCATIONAL_COURSES)){const g=rig(name);for(let i=0;i<5;i++)finish(g,{revise:i===1});assert.equal(vocationRecord(g.s).phase,5,name);assert(vocationEvidence(g.s));assert(vocationRequirements(g).some(x=>!x.ok));assert.equal(g.s.status,'apprentice');assert.equal(g.graduateCareer(),false);assert.equal(g.s.life.entry.assessed,false);}
});

test('failure preserves progress, explains the problem and allows a focused drill without counting it as supervised practice',()=>{
 const g=rig();g.openVocationalTask();const energy=g.s.stats.energy;assert(g.resolve(0));const r=vocationRecord(g.s);assert.equal(r.phase,0);assert(!r.last.passed);assert(r.last.problem&&r.last.impact&&r.last.next);assert.equal(r.last.answer,null);assert(g.s.stats.energy<energy);const practice=g.s.life.entry.practice,mastery=g.s.mastery;g.s.stats.energy=14;assert(g.openVocationalTask('drill'));const t=taskMaterial(g);g.inspectVocationalTask('clue');g.inspectVocationalTask('mentor');g.answerVocationalTask(t.order.indexOf(t.question.answer));const choice=t.choices.findIndex(c=>c.approach==='rush');assert(g.resolve(choice));assert.equal(g.s.ap,0);assert.equal(g.s.life.entry.practice,practice);assert(g.s.mastery>mastery);assert.equal(r.phase,0);assert.equal(r.drills,1);assert.equal(g.s.life.gross,g.apprenticeSalary);
});

test('insufficient energy, arrangements or recovery never partially charge a task, and a preview can always be cancelled',()=>{
 for(const prepare of [g=>g.s.stats.energy=0,g=>g.s.ap=0,g=>g.s.risks.delay=1,g=>g.s.risks.captivity=1]){const g=rig();assert(g.openVocationalTask());prepare(g);const before=JSON.stringify(g.s);assert.equal(g.resolve(0),false);assert.equal(JSON.stringify(g.s),before);assert(g.cancelVocationalTask());assert.equal(g.s.pending,null);}
});

test('deterministic qualification still requires all training, practice, capability and supervised evidence',()=>{
 const g=rig('護理師');for(let i=0;i<5;i++)finish(g);const req=g.entryRequirement;g.s.mastery=100;g.s.life.entry.months=req.months;g.s.life.entry.practice=req.practice;ready(g);g.s.ap=2;g.roll=()=>.9999;const beforePlan=JSON.stringify(g.s);assert(g.needsVocationalAssessment());assert.equal(g.plan(12),0);assert.equal(JSON.stringify(g.s),beforePlan);const cash=g.s.cash;assert(g.qualifyCareer());assert.equal(g.s.status,'employed');assert.equal(g.s.cash,cash-1000);assert.equal(g.s.ap,1);assert(g.s.life.credentials[g.s.career]);assert.equal(g.qualifyCareer(),false);assert(LifeGame.restore(g.s));
 const h=rig('護理師');h.openVocationalTask();h.cancelVocationalTask();h.s.mastery=100;h.s.life.entry.months=48;h.s.life.entry.practice=18;assert.equal(h.qualifyCareer(),false);assert.equal(h.graduateCareer(),false);
});

test('work-stage responsibility increases and promotion evidence belongs to the current profession, with skills retained across transfers',()=>{
 const g=rig();g.s.status='employed';g.s.level=1;g.s.life.credentials[g.s.career]=true;finish(g);const r=vocationRecord(g.s),saved=structuredClone(r);assert.equal(r.employeePassed,1);assert.equal(g.vocationalPromotionReady(),false);ready(g);g.chooseCareer(job('AI代理工程師').id);assert.deepEqual(vocationRecord(g.s,job('水電工').id),saved);g.s.status='employed';g.s.level=4;g.s.life.credentials[g.s.career]=true;ready(g);g.openVocationalTask();const t=taskMaterial(g);assert.match(t.stage,/跨方責任/);assert(t.threshold>62);assert.equal(vocationRecord(g.s).employeePassed,0);assert.equal(g.vocationalPromotionReady(),false);assert(LifeGame.restore(g.s));
});

test('routine-training summaries settle real months, stop for decisions or assessment, preserve the 65-year ending and never consume skip budget',()=>{
 const g=rig();for(let i=0;i<5;i++)finish(g);assert(g.canSummarizeTraining());const month=g.s.month,practice=g.s.life.entry.practice;g.triggerOccupationEvent=()=>false;g.triggerLifeEvent=()=>false;g.triggerEraEvent=()=>false;g.checkHealth=()=>{};const n=g.summarizeTraining(3);assert(n>0&&n<=3);assert.equal(g.s.month,month+n);assert(g.s.life.entry.practice>=practice);assert(g.s.lastLedger);assert.equal(g.s.ap,2);assert(LifeGame.restore(g.s));
 const h=rig('護理師');for(let i=0;i<5;i++)finish(h);h.s.month=RETIRE_MONTH-1;h.s.elapsed=h.s.month-h.s.profile.startAge*12;h.summarizeTraining(12);assert.equal(h.s.month,RETIRE_MONTH);assert.equal(h.s.status,'retired');assert(LifeGame.restore(h.s));
 const pending=rig();pending.openVocationalTask();const before=JSON.stringify(pending.s);assert.equal(pending.summarizeTraining(3),false);assert.equal(JSON.stringify(pending.s),before);
});

test('legacy migration leaves resources, credentials and seeds unchanged; malformed or forged vocational saves are rejected',()=>{
 const g=rig(),raw=structuredClone(g.s);delete raw.life.vocation;const old={seed:raw.seed,cash:raw.cash,ap:raw.ap,skills:raw.skills,credentials:raw.life.credentials};const restored=LifeGame.restore(raw);assert(restored);assert.deepEqual({seed:restored.s.seed,cash:restored.s.cash,ap:restored.s.ap,skills:restored.s.skills,credentials:restored.s.life.credentials},old);assert.deepEqual(restored.s.life.vocation.jobs,{});
 g.openVocationalTask();for(const edit of [s=>s.pending.choices[0].label='free reward',s=>s.pending.vocation.career='invalid',s=>s.pending.vocation.answer=3,s=>s.pending.vocation.revised='true',s=>s.life.vocation.jobs[s.career].skills[0]=-1,s=>s.life.vocation.jobs[s.career].phase=99,s=>delete s.pending.vocation]){const bad=structuredClone(g.s);edit(bad);assert.equal(LifeGame.restore(bad),null);}
});

test('optional PQ preparation remains bounded and durable within a vocational task, and cancelling clears only the preparation',()=>{
 let g=rig();g.openVocationalTask();const ap=g.s.ap,energy=g.s.stats.energy;assert(g.prepareMind('explore'));assert.equal(g.s.ap,ap);assert.equal(g.s.stats.energy,energy-4);g=LifeGame.restore(g.s);assert(g);g.inspectVocationalTask('clue');g.inspectVocationalTask('mentor');const t=taskMaterial(g);g.answerVocationalTask(t.order.indexOf(t.question.answer));g.resolve(t.choices.findIndex(c=>c.approach==='check'));assert.equal(g.s.life.mind.responses,1);assert.equal(g.s.life.mind.prepared,null);assert.match(vocationRecord(g.s).last.problem,/評分支持/);assert(LifeGame.restore(g.s));
 const h=rig();h.openVocationalTask();h.prepareMind('empathy');assert(h.cancelVocationalTask());assert.equal(h.s.life.mind.prepared,null);assert.equal(h.s.life.mind.responses,0);assert.equal(h.s.ap,2);assert.equal(h.s.life.mind.lastResponse,h.s.elapsed);assert(LifeGame.restore(h.s));
});

test('summarized training stops at the first unresolved decision and planning does not automatically answer a vocational task',()=>{
 const g=rig();for(let i=0;i<5;i++)finish(g);const original=g.endMonth.bind(g),month=g.s.month;g.endMonth=()=>{const ok=original();if(ok&&!g.s.pending)g.s.pending=structuredClone(EVENT_DECK.find(e=>e.id==='community'));return ok;};assert.equal(g.summarizeTraining(12),1);assert.equal(g.s.month,month+1);assert(g.s.pending);assert(LifeGame.restore(g.s));
 const h=rig();h.openVocationalTask();h.cancelVocationalTask();assert.equal(h.plan(12,'earn'),0);assert.equal(h.s.pending.id,'vocational-task');assert.equal(h.s.ap,1);assert.equal(vocationRecord(h.s).attempts,0);
});
