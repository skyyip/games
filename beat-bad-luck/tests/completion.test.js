import test from 'node:test';import assert from 'node:assert/strict';
import {RitualGame,DURATIONS} from '../src/game.js';
import {fresh,reward} from '../src/progress.js';
function setup(roll=.4){
 let now=0;const g=new RitualGame({now:()=>now,random:()=>roll});g.start({weapon:'flipflop',skin:'duck'});g.next();g.next();g.hit();
 return {g,step(ms){now+=ms;g.advance();},tiger(){this.step(DURATIONS.beat);}};
}
test('completion choices unlock after whacking and wait without automatically feeding or awarding rewards',()=>{
 const s=setup();assert.equal(s.g.chooseCompletion('quick'),false);assert.equal(s.g.completionMode,null);s.tiger();s.step(60000);
 assert.equal(s.g.phase,'tiger');assert.equal(s.g.completionMode,null);assert.equal(s.g.fed,false);assert.equal(s.g.result,null);
 assert.equal(s.g.chooseCompletion('unknown'),false);assert.equal(s.g.completionMode,null);
});
test('one-click completion performs every remaining phase and gives the same standard rewards as manual completion',()=>{
 for(const roll of [.2,.4,.8]){
  const auto=setup(roll),manual=setup(roll);auto.tiger();manual.tiger();const score=auto.g.score,hits=auto.g.hits;
  assert.equal(auto.g.chooseCompletion('quick'),true);assert.equal(auto.g.phase,'results');assert.equal(auto.g.score,score);assert.equal(auto.g.hits,hits);
  assert.deepEqual(auto.g.transitions,['worry','beat','tiger','blessing','divination','results']);assert.equal(auto.g.fed,true);assert.equal(auto.g.blessed,true);assert.equal(auto.g.blocks.sacred,true);assert.equal(auto.g.blocks.rolling,false);assert.equal(auto.g.result.auspicious,true);assert.equal(auto.g.rolls,roll<.5?1:2);
  assert.equal(manual.g.chooseCompletion('step'),true);assert.equal(manual.g.phase,'tiger');manual.g.feed();manual.step(1500);manual.g.completeBlessing();manual.step(900);manual.g.throwBlocks();manual.step(1400);if(manual.g.blocks.rolling)manual.step(1200);manual.step(650);assert.equal(manual.g.phase,'results');
  const a=reward(fresh(0),auto.g.result,{id:'auto',now:1,random:()=>.99}),b=reward(fresh(0),manual.g.result,{id:'manual',now:1,random:()=>.99});assert.equal(a.earned,b.earned);assert.equal(a.merit,b.merit);assert.equal(a.state.rituals,1);assert.equal(a.state.records.length,1);
 }
});
test('step-by-step choice retains optional smearing points, pause protection and the original manual controls',()=>{
 const s=setup(.2);s.tiger();s.g.pause();assert.equal(s.g.chooseCompletion('step'),false);assert.equal(s.g.chooseCompletion('quick'),false);assert.equal(s.g.completionMode,null);s.g.resume();assert.equal(s.g.chooseCompletion('step'),true);assert.equal(s.g.chooseCompletion('quick'),false);assert.equal(s.g.phase,'tiger');
 assert.equal(s.g.dip(),true);s.g.smearTiger(60);const score=s.g.score;assert.equal(s.g.feed(),true);assert.equal(s.g.score-score,Math.round(20*s.g.scoreMultiplier));s.step(1500);assert.equal(s.g.phase,'blessing');assert.equal(s.g.completeBlessing(),true);s.step(900);assert.equal(s.g.phase,'divination');
});
test('completed/abandoned rituals cannot be completed twice, and a new ritual resets the choice',()=>{
 const s=setup();s.tiger();s.g.chooseCompletion('quick');const result=s.g.result;for(const mode of ['quick','step'])assert.equal(s.g.chooseCompletion(mode),false);assert.equal(s.g.result,result);assert.equal(s.g.advance(),false);s.g.reset();assert.equal(s.g.completionMode,null);assert.equal(s.g.chooseCompletion('quick'),false);s.g.start();assert.equal(s.g.completionMode,null);
});
