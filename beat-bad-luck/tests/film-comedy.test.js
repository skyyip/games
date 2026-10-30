import test from 'node:test';
import assert from 'node:assert/strict';
import {FILM_WEAPONS,FILM_DECOR,FILM_SKINS,FILM_FINISHERS,filmCostume} from '../src/film-comedy.js';
import {WEAPONS,DECOR,weaponDurability,weaponScoreMultiplier,decorHourlyRate} from '../src/catalog.js';
import {SKINS,skinArt} from '../src/skins.js';
import {weaponArt,decorArt,dollArt} from '../src/art.js';
import {finisherScene,finisherKeyframes} from '../src/finisher-scenes.js';
import {finisherPropArt} from '../src/finisher-art.js';
import {ultimateShow,ULTIMATE_DURATION} from '../src/comedy-content.js';
import {fresh,buyWeapon,weaponUses,consumeWeapon,buySkin,skinUses,consumeSkin,upgrade,readProgress,collectIdle,DECOR_LIFETIME} from '../src/progress.js';
import {OIL_GAIN_FACTOR} from '../src/economy.js';
import {RitualGame} from '../src/game.js';
import {createBackup,parseBackup} from '../src/backup.js';
import {setAltarDecor,altarSelection} from '../src/altar-layout.js';

test('eight new kits, eight props and eight papers have unique persistent IDs, bilingual comedy and distinct local vector art',()=>{
 const ids=new Set();
 for(const [added,catalog,draw]of [[FILM_WEAPONS,WEAPONS,weaponArt],[FILM_DECOR,DECOR,decorArt],[FILM_SKINS,SKINS,skinArt]]){
  assert.equal(added.length,8);const drawings=new Set();
  for(const item of added){assert.ok(!ids.has(item.id));ids.add(item.id);assert.ok(catalog.some(i=>i.id===item.id));for(const field of ['name','nameZh','description','descriptionEn'])assert.ok(item[field]?.length>0,item.id+field);const svg=draw(item.id);assert.match(svg,/<svg/);assert.ok(!/undefined|NaN|<(?:script|image|foreignObject)\b/.test(svg));drawings.add(svg);}
  assert.equal(drawings.size,8);
 }
 for(const item of FILM_SKINS){assert.ok(filmCostume(item.id).length>100);assert.match(dollArt('work',0,item.id),/paper-edge-loss/);assert.match(skinArt(item.id),/paper-cry-face/);}
 assert.equal(new Set(WEAPONS.map(i=>i.id)).size,WEAPONS.length);assert.equal(new Set(DECOR.map(i=>i.id)).size,DECOR.length);assert.equal(new Set(SKINS.map(i=>i.id)).size,SKINS.length);
});

test('new kit values fit the existing price and bonus ladder, with merit gates, chosen coupons and exact restock counts',()=>{
 const sorted=WEAPONS.filter(w=>!w.starter&&!w.hidden).sort((a,b)=>a.cost-b.cost);
 for(let i=1;i<sorted.length;i++)assert.ok(weaponScoreMultiplier(sorted[i].id)>=weaponScoreMultiplier(sorted[i-1].id));
 for(const kit of FILM_WEAPONS){
  const before={...fresh(0),coins:kit.cost,merit:kit.merit};assert.equal(buyWeapon({...before,coins:kit.cost-1},kit.id),null);assert.equal(buyWeapon({...before,merit:kit.merit-1},kit.id),null);
  let s=buyWeapon(before,kit.id);const capacity=weaponDurability(kit.id);assert.ok(capacity>=3&&capacity<=8);assert.equal(s.coins,0);assert.equal(weaponUses(s,kit.id),capacity);
  s=consumeWeapon(s,kit.id);const discounted=buyWeapon({...s,coins:kit.cost,coupons:[{patron:'star-master',discount:.15,uses:1}]},kit.id,{restock:true,coupon:{index:0,patron:'star-master',discount:.15}});
  assert.equal(weaponUses(discounted,kit.id),capacity*2-1);assert.equal(discounted.coins,kit.cost-Math.ceil(kit.cost*.85));assert.equal(discounted.coupons.length,0);assert.deepEqual(readProgress(JSON.stringify(discounted),0).weaponUses,discounted.weaponUses);
  for(let left=capacity-2;left>=0;left--){s=consumeWeapon(s,kit.id);assert.equal(weaponUses(s,kit.id),left);}assert.equal(s.equipped,'bare-hand');assert.ok(buyWeapon({...s,coins:kit.cost},kit.id));
 }
});

test('new paper bonuses work immediately and ten rituals exhaust only the selected paper',()=>{
 for(const paper of FILM_SKINS){assert.equal(buySkin({...fresh(0),coins:paper.cost-1},paper.id),null);let s=buySkin({...fresh(0),coins:100000},paper.id);assert.equal(s.coins,100000-paper.cost);let now=0;const g=new RitualGame({now:()=>now,random:()=>.4});g.start({skin:paper.id});g.next();g.next();now+=100;assert.equal(g.hit().points,Math.round(30*paper.multiplier));assert.equal(g.wear,.01);
  for(let remaining=9;remaining>=0;remaining--){s=readProgress(JSON.stringify(consumeSkin(s,paper.id)),0);assert.equal(skinUses(s,paper.id),remaining);}assert.equal(s.selectedSkin,'plain');assert.equal(skinUses(s,'plain'),Infinity);
 }
});

test('each new kit has its own comic burst name, scene art and bounded motion without automatic score',()=>{
 for(const kit of FILM_WEAPONS){assert.equal(finisherScene(kit.id),FILM_FINISHERS[kit.id]);assert.equal(ultimateShow(kit.id).family,kit.family);assert.match(finisherPropArt(kit.id),/film-finisher-motif/);for(const frame of finisherKeyframes(kit.id))assert.ok(!/NaN|undefined|Infinity/.test(frame.transform));let now=0;const g=new RitualGame({now:()=>now,random:()=>.4});g.start({weapon:kit.id});g.next();g.next();for(let i=0;i<88;i++){now+=60;g.hit();}assert.ok(g.startFinisher());const score=g.score;now+=ULTIMATE_DURATION;g.advance();assert.equal(g.score,score);assert.equal(g.finisherBusy,false);}
});

test('new decorations follow existing purchase, eight-level upgrade, income, ageing, altar and backup rules',()=>{
 let state={...fresh(0),coins:1e7,merit:1e6};
 for(const item of FILM_DECOR){const actual=DECOR.find(d=>d.id===item.id);assert.equal(actual.cost,item.cost-300);assert.equal(actual.rate,Math.round(item.rate*OIL_GAIN_FACTOR*1e6)/1e6);assert.equal(upgrade({...fresh(0),coins:actual.cost-1},item.id,0),null);state=upgrade(state,item.id,0);assert.equal(state.decorExpires[item.id],DECOR_LIFETIME);assert.ok(decorHourlyRate(actual,1)>0);for(let level=2;level<=8;level++)state=upgrade(state,item.id,0);assert.equal(upgrade(state,item.id,0),null);}
 state=setAltarDecor(state,FILM_DECOR.slice(0,5).map(d=>d.id),0);assert.equal(altarSelection(state,0).length,5);const ids=FILM_DECOR.slice(0,5).map(d=>d.id).reverse();state=setAltarDecor(state,ids,0);
 for(const copy of [readProgress(JSON.stringify(state),0),parseBackup(createBackup(state,0),0)]){assert.deepEqual(copy.decor,state.decor);assert.deepEqual(copy.altarDecor,ids);}
 const earned=collectIdle(state,3600000);assert.ok(earned.earned>0);assert.equal(collectIdle(earned.state,3600000).earned,0);const aged=collectIdle(readProgress(JSON.stringify(state),DECOR_LIFETIME+1),DECOR_LIFETIME+1).state;for(const item of FILM_DECOR)assert.equal(aged.decor[item.id],0);assert.deepEqual(aged.altarDecor,[]);
});
