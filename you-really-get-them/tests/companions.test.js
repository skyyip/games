import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,RARITIES} from '../src/gacha.js';
import {SKILLS,equippedCompanion,createCompanionRun,useCompanion,companionBonus} from '../src/companions.js';
import {settleRun} from '../src/settlement.js';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {loadSave,save,setSaveScope} from '../src/storage.js';
const data=id=>({cards:[id],equippedCard:id});
test('all 180 cards have individual names and lines; every rarity offers all three fixed abilities',()=>{
 assert.equal(CARDS.length,180);assert.deepEqual(Object.keys(SKILLS).sort(),CARDS.map(c=>c.id).sort());
 assert.equal(new Set(Object.values(SKILLS).map(s=>s.name)).size,180);assert.equal(new Set(Object.values(SKILLS).map(s=>s.quip)).size,180);
 for(const r of RARITIES){const skills=CARDS.filter(c=>c.rarity===r.id).map(c=>SKILLS[c.id]);assert.deepEqual([...new Set(skills.map(s=>s.kind))].sort(),['bonus','clue','time'])}
 assert.equal(SKILLS.w_2.name,'重讀案情');assert.equal(SKILLS.m_2.name,'真・最後五秒');assert.equal(SKILLS.w_22.name,'收工津貼');
});
test('equipping requires owned cards, accepts legacy ownership, and snapshots exactly one teammate',()=>{
 assert.equal(equippedCompanion({cards:[],equippedCard:'w_2'}),null);assert.equal(equippedCompanion(data('bad')),null);
 assert.equal(equippedCompanion({cards:['名偵探女友'],equippedCard:'w_2'}).id,'w_2');
 const save=data('w_2'),run=createCompanionRun(save);save.equippedCard='m_2';assert.equal(run.card.id,'w_2');
 assert.equal(createCompanionRun(data('w_2'),{enabled:false}),null);assert.equal(createCompanionRun({cards:['w_2']}),null);
});
test('active assistance is once per run, cannot be used after an answer, settlement or scope switch',()=>{
 for(const id of ['w_2','m_2']){
  const run=createCompanionRun(data(id),{scope:'a'}),options={scope:'a',now:100,clue:'原文'};
  for(const changed of [{scope:'b'},{answered:true},{settled:true}])assert.equal(useCompanion(run,{...options,...changed}),false);
  assert.equal(run.used,false);assert.equal(useCompanion(run,options),true);assert.equal(useCompanion(run,options),false);
  if(id==='m_2')assert.equal(run.pauseUntil,5100);else assert.equal(run.pauseUntil,0);
  assert.equal(createCompanionRun(data(id)).used,false);
 }
 const clue=createCompanionRun(data('w_2'));assert.equal(useCompanion(clue,{clue:''}),false);assert.equal(clue.used,false);
 assert.equal(useCompanion(createCompanionRun(data('w_22'))),false);
});
test('all 652 normal questions have a verbatim scenario clue, with grading unchanged',()=>{
 let count=0;
 for(const bank of [BANK,AIR_BANK,MIXED_BANK,PICTURE_BANK])for(const faction of ['women','men','dog','cat'])for(const q of bank[faction]){
  assert(q.clue?.length>=3);assert(q.text.includes(q.clue),q.text);assert.notEqual(q.clue,q.text);assert.equal(q.opts.length,4);count++;
 }
 assert.equal(count,652);assert.equal(BANK.women[10].clue,'你打機遲到半小時，她笑住話「玩得開心就好」');
});
test('stipend is exactly 20 only on survival, never stacks with active skills or carries to another account',()=>{
 const run=createCompanionRun(data('w_22'),{scope:'owner'});
 for(const hp of [1,29,30,80,100]){
  assert.equal(companionBonus(run,hp,'owner'),20);const r=settleRun(hp,'women',run.card);assert.equal(r.coins,120+2*hp);assert.equal(r.companionReward,20);
 }
 assert.equal(companionBonus(run,100,'other'),0);assert.equal(companionBonus(run,0,'owner'),0);
 assert.equal(settleRun(0,'women',run.card).coins,10);assert.equal(settleRun(100,'women').coins,300);
 for(const id of ['w_2','m_2']){assert.equal(companionBonus(createCompanionRun(data(id)),100),0);assert.equal(settleRun(100,'women',SKILLS[id]).coins,300)}
});
test('equipment survives refresh per account without leaking into another account or guest save',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 try{setSaveScope('a');save({...loadSave(),...data('w_2')});assert.equal(equippedCompanion(loadSave()).id,'w_2');setSaveScope('b');assert.equal(equippedCompanion(loadSave()),null);save({...loadSave(),...data('m_2')});setSaveScope(null);assert.equal(equippedCompanion(loadSave()),null);setSaveScope('a');assert.equal(equippedCompanion(loadSave()).id,'w_2')}
 finally{setSaveScope(null);delete globalThis.localStorage}
});
