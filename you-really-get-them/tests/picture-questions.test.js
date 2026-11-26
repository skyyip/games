import test from 'node:test';
import assert from 'node:assert/strict';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {FACTIONS} from '../src/questions.js';

test('picture questions provide complete choices, explanations and descriptions for each faction',()=>{
 assert.deepEqual(Object.keys(PICTURE_BANK).sort(),Object.keys(FACTIONS).sort());
 const scenes=new Set();
 for(const [faction,questions]of Object.entries(PICTURE_BANK)){
  assert.equal(questions.length,faction==='duo'?3:4,faction);
  for(const q of questions){
   assert.equal(q.opts.length,4);assert.equal(new Set(q.opts).size,4);
   assert(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
   assert(q.text.length>15&&q.why.length>25);
   assert(q.picture.alt.length>20&&q.picture.title.length>2);
   assert(Number.isInteger(q.picture.art)&&q.picture.art>=0&&q.picture.art<19);
   assert(!scenes.has(q.picture.art));scenes.add(q.picture.art);
  }
 }
 assert.equal(scenes.size,19);
});

test('the requested smile, branch and belly scenarios retain uncertainty and consent in their answers',()=>{
 const smile=PICTURE_BANK.women.find(q=>q.picture.title==='女人的微笑');
 const branch=PICTURE_BANK.men.find(q=>q.picture.title==='男人的快樂');
 const belly=PICTURE_BANK.cat.find(q=>q.picture.title==='貓咪的陷阱');
 assert(smile&&branch&&belly);
 assert.match(smile.opts[smile.correct],/承認遲到/);assert.match(smile.why,/不能換算真正的存活率/);
 assert.match(branch.why,/這個具體情境/);
 assert.match(belly.opts[belly.correct],/未必想摸肚/);
 assert.match(PICTURE_BANK.duo[0].why,/沒有標準答案/);
});
