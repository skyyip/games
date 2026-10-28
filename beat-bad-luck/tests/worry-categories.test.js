import test from 'node:test';
import assert from 'node:assert/strict';
import {WORRIES,WORRY_GROUPS} from '../src/catalog.js';
import {RitualGame} from '../src/game.js';
import {fresh,reward,readProgress} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';
const added={'emotional-dumping':['情緒垃圾桶','emotions'],'draining-socialising':['難以拒絕嘅無效社交','relationships'],'rest-guilt':['躺平嘅罪惡感','emotions'],'boss-urgent-call':['老闆急Call','work'],'boss-chasing-calls':['老闆奪命追魂Call','work']};
test('forty worries each belong to exactly one of eleven nonempty bilingual categories',()=>{
 assert.equal(WORRIES.length,40);assert.equal(WORRY_GROUPS.length,11);assert.equal(new Set(WORRIES.map(w=>w.id)).size,40);assert.equal(new Set(WORRY_GROUPS.map(g=>g.id)).size,11);
 for(const group of WORRY_GROUPS){assert.ok(group.label&&group.labelZh);assert.ok(WORRIES.some(w=>w.group===group.id));}
 for(const worry of WORRIES)assert.equal(WORRY_GROUPS.filter(g=>g.id===worry.group).length,1,worry.id);
 for(const [id,[label,group]]of Object.entries(added)){const worry=WORRIES.find(w=>w.id===id);assert.equal(worry.labelZh,label);assert.equal(worry.group,group);assert.ok(worry.label);}
 assert.equal(WORRIES.find(w=>w.id==='love').group,'romance');assert.equal(WORRIES.find(w=>w.id==='sleep-deprived').group,'health');
});
test('new worry IDs play, score and survive fortune/save/backup round-trips without storing custom words',()=>{
 for(const id of Object.keys(added)){let now=0;const game=new RitualGame({now:()=>now});game.start({kind:id,worry:'private text never saved'});game.next();game.next();now=100;game.advance();assert.ok(game.hit({gesture:'tap',pointer:1}));while(game.phase!=='results')game.next();assert.equal(game.result.kind,id);
 const received=reward(fresh(1000),game.result,{id:'new-worry-'+id,now:1000,random:()=>.9});for(const state of [received.state,readProgress(JSON.stringify(received.state),1000),parseBackup(createBackup(received.state,1000),1000)]){assert.equal(state.neighbourhood.album[0].kind,id);assert.ok(!JSON.stringify(state).includes('private text never saved'));}
 }
});
