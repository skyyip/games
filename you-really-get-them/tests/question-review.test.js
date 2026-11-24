import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
const banks={BANK,AIR_BANK,MIXED_BANK,PICTURE_BANK};
const baseline=JSON.parse(readFileSync(new URL('./fixtures/question-mechanics.json',import.meta.url),'utf8'));
const mechanics=q=>Object.fromEntries(['correct','damageByOption','profiles','picture','emoji','tag'].map(key=>[key,q[key]??null]));

test('reviewed copy retains every existing answer index, damage table, profile and illustration in order',()=>{
 for(const [kind,bank]of Object.entries(banks))for(const [faction,rows]of Object.entries(bank)){
  const previous=baseline[kind][faction];
  const actual=createHash('sha256').update(JSON.stringify(rows.slice(0,previous.count).map(mechanics))).digest('hex');
  assert.equal(actual,previous.sha256,`${kind}/${faction}`);
 }
});
test('eighty new playable scenarios expand every faction without duplicate prompts',()=>{
 const all=Object.values(banks).flatMap(bank=>Object.values(bank).flat());
 assert.equal(all.length,337);assert.equal(new Set(all.map(q=>q.text)).size,337);
 for(const faction of ['women','men','dog','cat','duo']){
  assert.equal(BANK[faction].length,faction==='duo'?59:50);
  const added=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='街坊新副本');assert.equal(added.length,16,faction);
 }
 assert.equal(all.filter(q=>q.tag==='街坊新副本').length,80);
});
test('all prompts, choices and explanations stay complete and readable in a mobile round',()=>{
 for(const bank of Object.values(banks))for(const rows of Object.values(bank))for(const q of rows){
  assert(q.text.length>8&&q.text.length<=80,q.text);assert.equal(q.opts.length,4);assert.equal(new Set(q.opts).size,4);
  for(const option of q.opts)assert(option.length>3&&option.length<=55,option);
  assert(q.why.length>15&&q.why.length<=100,q.why);assert(!q.why.startsWith('正解解析：'));assert(!q.text.startsWith('Lv.'));
 }
});
test('the cat hybrid rewards leaving a retreating cat alone instead of continuing to hold it',()=>{
 const q=MIXED_BANK.cat[2],scores=q.profiles.map(p=>p.reduce((a,b)=>a+b,0));
 assert.equal(scores.indexOf(Math.max(...scores)),0);assert.match(q.opts[0],/放牠離開/);assert.match(q.opts[2],/繼續抱/);
});
test('duo expansion asks personal preferences instead of declaring an official correct response',()=>{
 for(const q of BANK.duo.slice(43)){
  assert.match(q.text,/我|我們/);assert(!q.why.includes('正解'));
 }
});
