import test from 'node:test';
import assert from 'node:assert/strict';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';
import {JOBS} from '../src/content.js';
import {MONTHLY_CHOICES,INVESTMENT_PRESETS,featuredJobs,choiceSummary} from '../src/monthly-play.js';
import {dueFollowup,queueFollowup} from '../src/context-events.js';
function game(){const g=new LifeGame({seed:123,name:'簡單過日子'});g.chooseCareer(JOBS.find(j=>j.name==='水電工').id);g.s.cash=200000;g.s.era.auto=false;g.roll=()=>.95;return g;}
test('two arrangements finish a month without changing wages, automatic habits or retirement age',()=>{
 const g=game();g.configureLife({routine:{exercise:true,diet:true,sleep:true}});assert.equal(g.s.ap,MONTHLY_CHOICES);g.work();assert.equal(g.s.pending.choices.length,3);g.resolve(0);g.rest();assert.equal(g.s.ap,0);const raw=JSON.stringify(g.s);assert.equal(g.rest(),false);assert.equal(JSON.stringify(g.s),raw);assert(g.endMonth());assert.equal(g.s.ap,2);assert.equal(g.s.lastLedger.routineCost,600);assert(g.s.lastLedger.gross>0);assert(Object.values(g.s.lastLedger.skillGains).some(n=>n>0));assert(g.s.lastLedger.healthChange>=-100);assert(LifeGame.restore(g.s));
 g.s.month=RETIRE_MONTH-1;g.s.elapsed=g.s.month-g.s.profile.startAge*12;g.s.pending=null;assert(g.endMonth());assert.equal(g.s.status,'retired');assert.equal(g.s.month,RETIRE_MONTH);assert.equal(g.endMonth(),false);
});
test('legacy three-action saves migrate once and retain pending choices, assets and comic frames',()=>{
 const g=game();g.work();g.s.ap=3;delete g.s.life.extraEventMonth;delete g.s.life.monthStart;const restored=LifeGame.restore(g.s);assert(restored);assert.equal(restored.s.ap,2);assert.deepEqual(restored.s.pending,g.s.pending);assert.deepEqual(restored.s.assets,g.s.assets);assert.deepEqual(restored.s.panels,g.s.panels);assert(restored.resolve(0));assert.equal(restored.s.ap,2);assert(LifeGame.restore(restored.s));
});
test('one automatic extra story per month is shared across life, work, era and delayed followups, including reload',()=>{
 let g=game();assert(g.triggerLifeEvent('phone-scam'));g.resolve(0);g=LifeGame.restore(g.s);assert(g);const raw=JSON.stringify(g.s);assert.equal(g.triggerLifeEvent('online-scam'),false);assert.equal(g.triggerOccupationEvent(),false);assert.equal(JSON.stringify(g.s),raw);
 queueFollowup(g,'referral',0);assert.equal(dueFollowup(g),false);assert.equal(g.s.life.queue.length,1);g.s.era.auto=true;g.s.era.nextEvent=0;assert.equal(g.triggerEraEvent(),false);
 g.s.era.auto=false;g.roll=()=>.95;assert(g.endMonth());assert.equal(g.s.pending.id,'follow-referral');assert.equal(g.s.life.queue.length,0);g.resolve(1);assert.equal(g.triggerOccupationEvent(),false);assert.equal(g.triggerLifeEvent('phone-scam'),false);
});
test('a core professional case remains available alongside a monthly extra story',()=>{
 const g=game();assert(g.triggerLifeEvent('phone-scam'));g.resolve(0);assert(g.work());assert.equal(g.s.pending.id,'work-case');g.resolve(0);assert.equal(g.s.ap,1);assert(g.rest());assert(g.endMonth());
});
test('all investment presets preview before confirmation, reserve cash and preserve fee/action rules',()=>{
 for(const preset of Object.values(INVESTMENT_PRESETS)){const g=game(),raw=JSON.stringify(g.s),sum=Object.values(preset.weights).reduce((a,b)=>a+b,0);assert(sum<=80);const preview=g.allocationPreview(preset.weights,'weights');assert(preview.ok,preset.name);assert.equal(JSON.stringify(g.s),raw);assert(preview.cashAfter>=g.s.cash*.19);assert(g.allocate(preset.weights,'weights'));assert.equal(g.s.ap,1);assert.equal(g.s.cash,preview.cashAfter);assert(LifeGame.restore(g.s));}
});
test('featured professions are a small valid selection; the complete405-career catalog remains intact',()=>{
 const featured=featuredJobs();assert.equal(featured.length,8);assert.equal(new Set(featured.map(j=>j.id)).size,8);assert(featured.every(j=>JOBS.includes(j)));assert.equal(JOBS.length,405);
 assert.equal(choiceSummary({effects:{cash:-180,energy:-8,jq:.2,contacts:1}}),'支出 $180・精力↓・職場判斷↑');
});
test('zero target weights fully liquidate fractional-price positions rather than leaving rounding dust',()=>{
 const g=game();g.s.assets.property=97;g.s.prices.property=101.123456;g.s.assets.cards=13;g.s.prices.cards=92.54321;
 const plan=g.allocationPreview({bank:40,etf:20},'weights');assert(plan.ok);assert.equal(plan.holdings.property,0);assert.equal(plan.holdings.cards,0);assert(g.allocate({bank:40,etf:20},'weights'));assert.equal(g.s.assets.property,0);assert.equal(g.s.assets.cards,0);
});
test('the habits plan keeps all three routines running automatically with two monthly arrangements',()=>{
 const g=game();g.s.status='employed';g.s.level=1;const sleep=g.s.habits.sleep;assert.equal(g.plan(1,'habits'),1);assert.deepEqual(g.s.life.routine,{exercise:true,diet:true,sleep:true});assert.equal(g.s.lastLedger.routineCost,600);assert(g.s.habits.sleep>sleep);assert(LifeGame.restore(g.s));
});
