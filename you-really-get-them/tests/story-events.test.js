import test from 'node:test';
import assert from 'node:assert/strict';
import {STORY_ARCS,MESSAGE_SCENES,addStoryEvents,resolveStoryQuestion,editedMessage} from '../src/story-events.js';
import {PRIVATE_LINES,companionBanter} from '../src/banter.js';
import {BANK,AIR_BANK,MIXED_BANK} from '../src/questions.js';
import {PICTURE_BANK} from '../src/picture-questions.js';
import {CARDS} from '../src/gacha.js';
import {answerRecord,comicReveal,buildIncidentReport} from '../src/comedy.js';
const factions=['women','men','dog','cat'];
const pool=f=>[...BANK[f].slice(0,3).map((q,i)=>({...q,kind:'classic',legacyIndex:i})),...PICTURE_BANK[f].map(q=>({...q,kind:'classic'})),...AIR_BANK[f].slice(0,4).map(q=>({...q,kind:'air'})),...MIXED_BANK[f].slice(0,3).map(q=>({...q,kind:'hybrid'}))];
test('special scenes keep exactly 12 questions, five classic and seven profile scores, including two pictures',()=>{
 for(const faction of factions){
  const original=pool(faction),before=JSON.stringify(original),round=addStoryEvents(original,faction);
  assert.equal(round.length,12);assert.equal(round.filter(q=>q.kind==='classic').length,5);assert.equal(round.filter(q=>q.profiles).length,7);assert.equal(round.filter(q=>q.picture).length,2);
  assert.equal(round[1].story.type,'setup');assert.equal(round[8].story.type,'callback');assert.equal(round.filter(q=>q.message).length,1);
  assert.equal(round.filter(q=>q.message||q.story?.type==='callback').length,2);assert.equal(JSON.stringify(original),before);assert.equal(round[0],original[0]);
  assert.deepEqual(addStoryEvents(original,faction,{enabled:false}),original);
 }
 assert.deepEqual(addStoryEvents(pool('women'),'duo'),pool('women'));
});
test('all four real commitments and the timeout branch resolve from this run, without inventing a promise',()=>{
 for(const faction of factions){
  const arc=STORY_ARCS[faction],round=addStoryEvents(pool(faction),faction),setup=round[1],callback=round[8];
  for(const choice of [0,1,2,3,null]){
   const record=answerRecord(setup,{round:2,choice,success:choice===setup.correct});
   const q=resolveStoryQuestion(callback,[record]);assert.equal(q.text,arc.followUps[choice??4].text);assert.equal(q.evidence.choice,choice===null?'時間到，尚未作答':setup.opts[choice]);assert.equal(q.evidence.round,2);
   assert.equal(q.evidence.timedOut,choice===null);assert.equal(q.story.id,setup.story.id);assert(q.text.includes(q.clue));
  }
  assert.equal(resolveStoryQuestion(callback,[]).evidence,null);assert.equal(resolveStoryQuestion(callback,[]).text,arc.followUps[4].text);
 }
});
test('every authored branch and message has four plausible choices and a verbatim text clue',()=>{
 let count=0;
 for(const faction of factions){
  const arc=STORY_ARCS[faction];
  for(const q of [arc.setup,...arc.followUps,MESSAGE_SCENES[faction]]){
   assert(q.text.length<=85,q.text);assert(q.text.includes(q.clue));assert.equal(q.opts.length,4);assert.equal(new Set(q.opts).size,4);assert(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);assert(q.why.length>20);count++;
  }
 }
 assert.equal(count,28);
});
test('each edit changes exactly one sentence; switching choices never accumulates edits or mutates the original',()=>{
 for(const q of Object.values(MESSAGE_SCENES)){
  const before=JSON.stringify(q),draft=q.message.draft;assert.deepEqual(editedMessage(q),draft);
  for(let i=0;i<4;i++){
   const result=editedMessage(q,i);assert.equal(result.length,3);assert.equal(result.filter((line,j)=>line!==draft[j]).length,1);
   assert.equal(result[q.message.edits[i][0]],q.message.edits[i][1]);assert.equal(JSON.stringify(q),before);
  }
 }
});
test('message reveal, incident evidence and poster summary cite the actual full sent text; timeout never claims a send',()=>{
 for(const [faction,q]of Object.entries(MESSAGE_SCENES))for(const choice of [0,1,2,3,null]){
  const record=answerRecord(q,{round:4,choice,success:choice===q.correct,hpLost:choice===q.correct?0:16});
  assert.equal(record.choice,choice===null?'時間到，尚未作答':editedMessage(q,choice).join(' '));
  const reveal=comicReveal(q,{faction,choice,success:choice===q.correct});assert.equal(reveal.selected,record.choice);
  if(choice!==null)assert.equal(reveal.said,q.message.replies[choice]);
  const report=buildIncidentReport([record]);assert.equal((record.success?report.best:report.incident).choice,record.choice);
 }
});
test('all 180 teammates have individual situational lines that do not mutate questions or skills',()=>{
 assert.deepEqual(Object.keys(PRIVATE_LINES).sort(),CARDS.map(c=>c.id).sort());assert.equal(new Set(Object.values(PRIVATE_LINES).map(([,line])=>line)).size,180);
 for(const card of CARDS){const [topic,line]=PRIVATE_LINES[card.id],q={topic,text:'測試情境'},before=JSON.stringify(card);assert.equal(companionBanter(card,q),line);assert.equal(companionBanter(card,{topic:'unrelated',text:''}),null);assert.equal(JSON.stringify(card),before)}
 assert.equal(companionBanter(null,{text:'遊戲'}),null);assert.match(companionBanter(CARDS.find(c=>c.id==='d_2'),{text:'你剛收拾好梳化。'}),/唔係我屋企/);
});
