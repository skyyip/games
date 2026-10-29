import {AMBIENT_LIMITS} from '../src/ambient-comics.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS,weaponDurability,DECOR,decorHourlyRate} from '../src/catalog.js';
import {finisherPropArt} from '../src/finisher-art.js';
import {finisherScene,finisherKeyframes} from '../src/finisher-scenes.js';
import {COMIC_MOODS,spiritPaperArt,comicGhostArt,peekingZombieArt} from '../src/combat-art.js';
import {fresh,reward,collectIdle,MAX_IDLE_HOURS,dailyReward} from '../src/progress.js';
import {OIL_GAIN_FACTOR,MERIT_GAIN_FACTOR} from '../src/economy.js';
test('all sixty helper finishers have unique bilingual names, comic endings and finite distinct motion recipes',()=>{
 assert.equal(WEAPONS.length,60);const names=new Set(),motions=new Set();
 for(const kit of WEAPONS){const scene=finisherScene(kit.id);for(const field of ['name','payoff','tag'])assert.ok(scene[field].length===2&&scene[field].every(text=>typeof text==='string'&&text.length>0),kit.id+field);assert.ok(scene.steps.length>=2);assert.ok(scene.pose);assert.match(finisherPropArt(kit.id),/<(?:g|path|rect|circle|ellipse)/,kit.id+' prop');names.add(scene.name[0]);const frames=finisherKeyframes(kit.id);assert.ok(frames.length>=4);for(const frame of frames){assert.equal(/NaN|undefined|Infinity|--\d/.test(frame.transform),false,kit.id);assert.ok(frame.opacity>=0&&frame.opacity<=1);}motions.add(JSON.stringify(frames));}
 assert.equal(names.size,60);assert.equal(motions.size,60);
});
test('all paid helpers including fifteen secret drops last at least two uses and free hands remain unlimited',()=>{for(const kit of WEAPONS)assert.ok(kit.starter?weaponDurability(kit.id)===Infinity:weaponDurability(kit.id)>=2,kit.id);});
test('all four moods have distinct joss-paper, ghost and edge-peeking zombie art',()=>{assert.deepEqual(AMBIENT_LIMITS,{paper:3,ghost:2,zombie:1});assert.deepEqual(COMIC_MOODS,['happy','angry','sad','tired']);for(const art of [spiritPaperArt,comicGhostArt,peekingZombieArt]){const drawings=COMIC_MOODS.map(mood=>art(mood));assert.equal(new Set(drawings).size,4);for(const drawing of drawings)assert.match(drawing,/<svg/);}});
test('new reward factors apply once while keeping old balances, saved levels and a twelve-hour offline cap',()=>{assert.equal(OIL_GAIN_FACTOR,.32);assert.equal(MERIT_GAIN_FACTOR,.36);assert.equal(MAX_IDLE_HOURS,12);const old={...fresh(0),coins:10000,merit:2000,decor:{neon:8}};const gift=dailyReward(old,Date.parse('2026-10-29T00:00:00Z'));assert.equal(gift.coins-old.coins,6);assert.equal(gift.merit-old.merit,11);const r=reward(old,{score:600,hits:40,papers:2,qte:1,weapon:'flipflop',fed:true,blessed:true},{id:'receipt',now:1,random:()=>.9});assert.equal(r.earned,13);assert.equal(r.merit,10);assert.equal(r.state.coins-old.coins,13);assert.equal(r.state.merit-old.merit,10);const collected=collectIdle(old,48*3600000);assert.equal(collected.earned,Math.floor(decorHourlyRate(DECOR.find(d=>d.id==='neon'),8)*12));assert.equal(collected.state.decor.neon,8);assert.equal(collectIdle(collected.state,48*3600000).earned,0);});
