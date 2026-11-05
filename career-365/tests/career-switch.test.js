import test from 'node:test';
import assert from 'node:assert/strict';
import {LifeGame} from '../src/game.js';
import {JOBS,EVENT_DECK} from '../src/content.js';
const plumber=JOBS.find(j=>j.name==='水電工'),creator=JOBS.find(j=>j.name==='YouTuber');
function employed(){const g=new LifeGame({seed:123});g.chooseCareer(plumber.id);g.s.cash=100000;g.setEraAuto(false);g.roll=()=>.95;return g;}

test('first entry stays free while switching reports every unmet requirement without spending or changing the save',()=>{
 for(const route of ['mentor','ai']){const g=new LifeGame({seed:1});g.s.cash=0;const before=JSON.stringify(g.s),e=g.careerEligibility(plumber.id,route);assert(e.ok);assert.equal(e.cost,0);assert.equal(e.actions,0);assert.equal(JSON.stringify(g.s),before);assert(g.chooseCareer(plumber.id,route));assert.equal(g.s.cash,0);assert.equal(g.s.ap,2);}
 const g=employed();g.s.cash=2999;g.s.ap=0;g.s.risks.delay=2;const before=JSON.stringify(g.s);assert.deepEqual(g.careerEligibility(creator.id).blockers,['recovery','actions','cash']);assert.equal(g.chooseCareer(creator.id),false);assert.equal(JSON.stringify(g.s),before);assert(LifeGame.restore(g.s));
});

test('a normal month settlement restores the arrangement needed to switch and learning can continue after reload',()=>{
 const g=employed();assert(g.rest());assert(g.rest());assert.deepEqual(g.careerEligibility(creator.id).blockers,['actions']);assert.equal(g.chooseCareer(creator.id),false);assert(g.endMonth());assert(g.careerEligibility(creator.id,'ai').ok);const cash=g.s.cash,craft=g.s.skills.craft;
 assert(g.chooseCareer(creator.id,'ai'));assert.equal(g.s.ap,1);assert.equal(g.s.cash,cash-3000);assert.equal(g.s.skills.craft,craft);assert.equal(g.s.metrics.switches,1);assert.equal(g.s.route,'ai');const restored=LifeGame.restore(g.s);assert(restored);assert(restored.study(true));assert.equal(restored.s.ap,0);assert.equal(restored.s.career,creator.id);
});

test('cash, recovery, captivity, pending stories and retirement remain real restrictions',()=>{
 for(const [prepare,code]of [[g=>g.s.cash=2999,'cash'],[g=>g.s.risks.delay=1,'recovery'],[g=>g.s.risks.captivity=1,'captivity'],[g=>g.s.pending=structuredClone(EVENT_DECK[0]),'story'],[g=>g.s.status='retired','retired']]){const g=employed();prepare(g);const before=JSON.stringify(g.s);assert(g.careerEligibility(creator.id).blockers.includes(code));assert.equal(g.chooseCareer(creator.id),false);assert.equal(JSON.stringify(g.s),before);}
 const g=employed();g.s.cash=3000;assert(g.careerEligibility(creator.id).ok);assert(g.chooseCareer(creator.id));assert.equal(g.s.cash,0);assert.equal(g.s.ap,1);const before=JSON.stringify(g.s);assert.deepEqual(g.careerEligibility('unknown','invalid').blockers,['job','route','cash']);assert.equal(g.chooseCareer('unknown','invalid'),false);assert.equal(JSON.stringify(g.s),before);
});
