import test from 'node:test';import assert from 'node:assert/strict';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';import {JOBS} from '../src/content.js';
import {ASSET_INFO,SALARY_SOURCES,WORLD_EVENTS} from '../src/economy.js';import {LIFE_EVENTS,eventEligible} from '../src/life-events.js';
function rig(){const g=new LifeGame({seed:123,name:'測試人生'});g.chooseCareer(JOBS[0].id);g.roll=()=>.95;g.s.cash=1000000;return g;}
function finish(g){if(g.s.pending)g.resolve(Math.max(0,g.s.pending.choices.findIndex(c=>c.approach==='check')));}
function ready(g){g.s.ap=3;g.s.pending=null;g.s.stats.energy=g.energyMax;}
function choose(g,id,index=0){assert(g.triggerLifeEvent(id));assert(LifeGame.restore(g.s));assert(g.resolve(index));assert(LifeGame.restore(g.s));}
test('all405 salaries use a dated, named HKD reference and never claim unsupported individual averages',()=>{
 assert.equal(JOBS.length,405);for(const j of JOBS){assert(j.salary>=14900&&j.salary<=33000);assert(j.salaryInfo.estimatedRole);assert(SALARY_SOURCES.some(s=>s.id===j.salaryInfo.source));assert(j.salaryInfo.note.includes('並非'));}
 assert.equal(JOBS.find(j=>j.name==='咖啡師').salary,17995);assert.equal(JOBS.find(j=>j.name==='貨車司機').salary,26300);
});
test('monthly salary is taxed once, promotions require time and work evidence, overtime retains base pay',()=>{
 const g=rig();g.s.status='employed';g.s.level=1;g.s.stats.reputation=0;let cash=g.s.cash;assert(g.work());assert(Math.abs((g.s.cash-cash)-(g.salary-g.s.life.mpf-g.s.life.tax))<.01);finish(g);cash=g.s.cash;assert(g.work());assert.equal(g.s.cash,cash);g.endMonth();assert.equal(g.s.monthWork,0);
 const previous=g.salary;g.s.life.careerMonths=17;g.s.profession.passed=10;g.s.profession.completed=10;g.endMonth();assert(g.salary>previous);finish(g);g.work(true);cash=g.s.cash;const gross=g.s.life.gross,mpf=g.s.life.mpf,tax=g.s.life.tax;g.work();assert.equal(g.s.life.gross-gross,g.salary);assert(Math.abs((g.s.cash-cash)-(g.salary-(g.s.life.mpf-mpf)-(g.s.life.tax-tax)))<.01);
});
test('related career transfer retains more mastery and fewer industry contacts than an unrelated move',()=>{
 const a=rig(),b=rig();for(const g of [a,b]){g.s.status='employed';g.s.level=5;g.s.salaryFactor=1.5;g.s.stats.contacts=30;g.s.stats.reputation=100;for(const key of Object.keys(g.s.skills))g.s.skills[key]=60;}
 const related=JOBS.find(j=>j.category==='trades'),unrelated=JOBS.find(j=>j.category==='software');
 assert(a.chooseCareer(related.id));assert(b.chooseCareer(unrelated.id));assert(a.s.mastery>b.s.mastery);assert(a.s.stats.contacts>b.s.stats.contacts);assert(a.s.stats.reputation>b.s.stats.reputation);assert.equal(a.s.level,0);assert.equal(a.s.salaryFactor,1);assert.equal(a.s.skills.craft,60);assert(LifeGame.restore(a.s));
});
test('habits alter illness probability, decay monthly, and overtime damages sleep',()=>{
 const g=rig();g.s.habits={exercise:10,diet:10,sleep:10};const risk=g.illnessRisk;g.habit('exercise');g.habit('diet');g.habit('sleep');assert(g.illnessRisk<risk);const h={...g.s.habits};g.endMonth();assert(g.s.habits.exercise<h.exercise);assert(g.s.habits.diet<h.diet);ready(g);const sleep=g.s.habits.sleep;g.work(true);assert(g.s.habits.sleep<sleep);
});
test('even excellent habits cannot eliminate illness; diagnosis charges money and treatment restores ability',()=>{
 const g=rig();g.s.habits={exercise:100,diet:100,sleep:100};g.roll=()=>0;const cash=g.s.cash;g.endMonth();assert(g.s.healthData.illness);assert(g.s.healthData.bills>0);assert(g.s.cash<cash);g.s.pending=null;g.roll=()=>.95;const salary=g.apprenticeSalary,before=g.s.cash;g.work();assert.equal(g.s.cash-before,Math.round(salary*.65));ready(g);const bills=g.s.healthData.bills;assert(g.treat());assert.equal(g.s.healthData.illness.months,2);assert.equal(g.s.healthData.bills,bills+200);
});
test('each scam choice records a loss while verification protects cash',()=>{
 for(const id of ['phone-scam','online-scam','dating-scam','investment-scam']){const safe=rig(),risk=rig();choose(safe,id,0);assert.equal(safe.s.risks.scamLoss,0);choose(risk,id,1);assert(risk.s.risks.scamLoss>0);assert(risk.s.cash<safe.s.cash);}
});
test('recruitment trafficking interrupts progression, then support opens recovery without a dead end',()=>{
 const g=rig();choose(g,'kk-recruitment',1);assert(g.s.risks.captivity>0);assert.equal(g.work(),false);assert.equal(g.chooseCareer(JOBS[3].id),false);assert.equal(g.changeLife('travel'),false);assert(g.support());assert.equal(g.s.pending.id,'rescue');g.resolve(0);assert.equal(g.s.risks.captivity,0);assert(g.s.risks.delay>0);ready(g);assert(g.support());assert(LifeGame.restore(g.s));for(let i=0;i<5;i++){g.s.pending=null;g.endMonth();}assert.equal(g.s.risks.delay,0);
});
test('adult temptation outcomes are non-graphic, probabilistic, costly and allow recovery',()=>{
 for(const id of ['adult-nightlife','gambling-temptation','drug-temptation']){const g=rig();g.s.metrics.gambles=1;g.roll=()=>0;choose(g,id,1);assert(g.s.metrics.spent>0);assert(g.s.stats.stress>0);if(id==='drug-temptation'){assert(g.s.risks.dependence>=30);assert(g.s.risks.delay>0);ready(g);const old=g.s.risks.dependence;g.support();assert(g.s.risks.dependence<old);}}
});
test('romance, marriage, children and infidelity respect relationship state and have ongoing costs',()=>{
 const g=rig();assert.equal(g.triggerLifeEvent('marriage'),false);choose(g,'romance');assert.equal(g.s.family.status,1);choose(g,'marriage');assert.equal(g.s.family.status,2);choose(g,'parenthood');assert.equal(g.s.family.children.length,1);g.endMonth();assert.equal(g.s.lastLedger.family,3800);assert.equal(g.s.family.children[0],1);
 ready(g);const affection=g.s.family.affection;assert(g.relationshipAction('time'));assert(g.s.family.affection>affection);g.roll=()=>0;choose(g,'affair',2);assert.equal(g.s.family.status,0);assert.equal(g.s.family.children.length,1);g.s.pending=null;g.endMonth();assert.equal(g.s.lastLedger.family,3000);
});
test('children become financially adult at18 and household status does not erase care responsibilities',()=>{
 const g=rig();g.s.family.children=[216,215];g.s.family.status=0;g.endMonth();assert.equal(g.s.lastLedger.family,3000);g.endMonth();assert.equal(g.s.lastLedger.family,0);
});
test('new investments charge friction, respect minimums, pay rent and keep limited losses on derivatives',()=>{
 const g=rig();assert.equal(g.invest('property',9999),false);const before=g.wealth;assert(g.invest('property',10000));assert.equal(g.wealth,before-300);assert(g.invest('cards',1000));assert.equal(Math.round(g.assetValue('cards')),880);g.endMonth();assert(g.s.lastLedger.rental>0);assert(g.invest('derivatives',1000));g.s.marketPlan.derivatives=-1;g.endMonth();assert.equal(g.assetValue('derivatives'),0);assert.equal(g.s.prices.derivatives,100);assert(LifeGame.restore(g.s));
});
test('wars, crashes and disasters move multiple assets and persist across wages and living expenses',()=>{
 for(const world of WORLD_EVENTS){const g=rig();g.invest('property',10000);g.s.marketPlan={...g.s.marketPlan,world:structuredClone(world),...Object.fromEntries(['stock','etf','crypto','property','cards'].map(k=>[k,world[k]])),derivatives:Math.max(-1,world.stock*3-.01)};const old=g.s.prices.stock;g.endMonth();assert.equal(g.s.world.id,world.id);assert(g.s.prices.stock<old);assert.equal(g.s.lastLedger.living,Math.round(g.livingCost*world.living));const cash=g.s.cash;g.work();assert(Math.abs(g.s.cash-cash-(Math.round(g.apprenticeSalary*world.income)-g.s.life.mpf-g.s.life.tax))<.01);assert(LifeGame.restore(g.s));finish(g);g.s.marketPlan.world=null;g.endMonth();assert.equal(g.s.world.months,world.months-1);}
});
test('all eligible extended choices have save-safe consequences and remain resolvable with no cash',()=>{
 for(const event of LIFE_EVENTS)for(let i=0;i<event.choices.length;i++){const g=rig();g.s.metrics.gambles=1;g.s.family.status=event.id==='marriage'?1:['parenthood','affair','family-tension'].includes(event.id)?2:0;g.s.family.affection=80;if(event.id==='rescue')g.s.risks.captivity=6;if(event.id==='recovery-support')g.s.risks.dependence=40;assert(eventEligible(event,g.s));g.s.cash=0;g.s.pending=structuredClone(event);assert(LifeGame.restore(g.s));g.roll=()=>0;assert(g.resolve(i));assert(LifeGame.restore(g.s),event.id);assert(g.s.cash>=0);}
});
test('legacy saves migrate all new systems and reject unsafe outcome/economy payloads',()=>{
 const g=rig();for(const k of ['habits','healthData','family','risks','world','monthWork','transfer'])delete g.s[k];for(const k of ['property','cards','derivatives']){delete g.s.assets[k];delete g.s.prices[k];delete g.s.marketPlan[k];}delete g.s.marketPlan.world;assert(LifeGame.restore(g.s));const valid=LifeGame.restore(g.s);valid.s.pending=structuredClone(LIFE_EVENTS.find(e=>e.id==='drug-temptation'));valid.s.pending.choices[1].outcome.effects.hack=4;assert.equal(LifeGame.restore(valid.s),null);valid.s.pending=null;valid.s.world={...WORLD_EVENTS[0],income:Infinity};assert.equal(LifeGame.restore(valid.s),null);
});
test('random events happen during a non-working life and all expanded systems still settle at65',()=>{
 const g=rig();g.changeLife('travel');g.roll=()=>0;g.endMonth();assert(g.s.pending);assert(g.s.pending.group);g.resolve(0);g.roll=()=>.95;g.s.month=RETIRE_MONTH-1;g.s.elapsed=g.s.month-g.s.profile.startAge*12;g.endMonth();assert.equal(g.s.status,'retired');assert.equal(g.s.pending,null);assert(LifeGame.restore(g.s));
});
