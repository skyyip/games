import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
const banks={BANK,AIR_BANK,MIXED_BANK,PICTURE_BANK};
const baseline=JSON.parse(readFileSync(new URL('./fixtures/question-mechanics.json',import.meta.url),'utf8'));
const mechanics=q=>{
 const options=Array.from({length:4},(_,i)=>({correct:q.correct===i,damage:q.damageByOption?.[i]??null,profile:q.profiles?.[i]??null}));
 options.sort((a,b)=>JSON.stringify(a)<JSON.stringify(b)?-1:JSON.stringify(a)>JSON.stringify(b)?1:0);
 return {options,picture:q.picture??null,emoji:q.emoji??null,tag:q.tag??null};
};

test('reviewed copy retains existing option/scoring pairs, question order and illustrations in order',()=>{
 for(const [kind,bank]of Object.entries(banks))for(const [faction,rows]of Object.entries(bank)){
  const previous=baseline[kind][faction];
  const actual=createHash('sha256').update(JSON.stringify(rows.slice(0,previous.count).map(mechanics))).digest('hex');
  assert.equal(actual,previous.sha256,`${kind}/${faction}`);
 }
});
test('sixty additional playable scenarios expand all five factions without duplicates',()=>{
 const all=Object.values(banks).flatMap(bank=>Object.values(bank).flat());
 assert.equal(all.length,817);assert.equal(new Set(all.map(q=>q.text)).size,817);
 for(const faction of ['women','men','dog','cat','duo']){
  assert.equal(BANK[faction].length,faction==='duo'?155:114);
  const added=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='城市加場');assert.equal(added.length,12,faction);
 }
 assert.equal(all.filter(q=>q.tag==='城市加場').length,60);
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
 assert.match(q.opts[scores.indexOf(Math.max(...scores))],/放牠離開/);assert(q.opts.some(o=>o.includes('繼續抱')));
});
test('duo expansion asks personal preferences instead of declaring an official correct response',()=>{
 for(const q of BANK.duo.slice(43)){
  assert.match(q.text,/我|我們/);assert(!q.why.includes('正解'));
 }
});

test('normal question answers balance all four positions without a consistently longest answer',()=>{
 const counts=[0,0,0,0];let longest=0,total=0;
 for(const bank of Object.values(banks))for(const [faction,rows]of Object.entries(bank))if(faction!=='duo')for(const q of rows){
  const best=q.correct??q.profiles.map(p=>p.reduce((a,b)=>a+b,0)).reduce((b,v,i,a)=>v>a[b]?i:b,0);
  counts[best]++;total++;if(q.opts[best].length>Math.max(...q.opts.filter((_,i)=>i!==best).map(o=>o.length)))longest++;
 }
 assert.deepEqual(counts,[163,163,163,163]);assert(longest/total<.35);
});

test('night expansion gives each faction twelve distinctive contextual prompts',()=>{
 for(const faction of ['women','men','dog','cat','duo']){
  const rows=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='深夜求生局');assert.equal(rows.length,12,faction);
  if(faction!=='duo')assert.equal(rows.filter(q=>q.profiles).length,4);
 }
});

test('end-of-day expansion adds twelve contextual prompts to every faction',()=>{
 for(const faction of ['women','men','dog','cat','duo']){
  const rows=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='放工彩蛋');assert.equal(rows.length,12,faction);
  if(faction!=='duo')assert.equal(rows.filter(q=>q.profiles).length,4);
 }
});

test('weekend theater adds twelve new playable scenarios to each faction',()=>{
 for(const faction of ['women','men','dog','cat','duo']){const rows=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='週末小劇場');assert.equal(rows.length,12,faction);if(faction!=='duo')assert.equal(rows.filter(q=>q.profiles).length,4)}
});

test('home-court scenes add twelve playable prompts to each faction',()=>{
 for(const faction of ['women','men','dog','cat','duo']){const rows=Object.values(banks).flatMap(bank=>bank[faction]).filter(q=>q.tag==='屋企小法庭');assert.equal(rows.length,12,faction);if(faction!=='duo')assert.equal(rows.filter(q=>q.profiles).length,4)}
});
