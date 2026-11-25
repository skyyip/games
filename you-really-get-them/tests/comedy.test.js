import test from 'node:test';
import assert from 'node:assert/strict';
import {COMIC_SCENES,comicReveal,answerRecord,buildIncidentReport} from '../src/comedy.js';
import {PICTURE_BANK} from '../src/picture-questions.js';

test('every illustrated scene has authored thoughts and a truthful reveal',()=>{
 for(const [faction,questions]of Object.entries(PICTURE_BANK))for(const q of questions){
  const scene=COMIC_SCENES[q.picture.art];assert(scene.said);assert.equal('clues' in scene,false);
  if(faction!=='duo'){assert.equal(scene.accidents[q.correct],null);for(let i=0;i<4;i++)if(i!==q.correct)assert(scene.accidents[i])}
  const reveal=comicReveal(q,{faction,choice:q.correct,success:true,run:1});
  assert.equal(reveal.selected,q.opts[q.correct]);assert.equal(reveal.explanation,q.why);
  assert.notEqual(reveal.thought,comicReveal(q,{faction,choice:q.correct,success:true,run:2}).thought);
  assert.notEqual(reveal.thought,comicReveal(q,{faction,choice:q.correct,success:false,run:1}).thought);
 }
});
test('reports cite actual choices, rank the worst incident, and keep the best observed action',()=>{
 const a=PICTURE_BANK.women[0],b=PICTURE_BANK.women[1];
 const records=[answerRecord(a,{round:1,choice:0,hpLost:25}),answerRecord(b,{round:2,choice:1,hpLost:35}),answerRecord(a,{round:3,choice:a.correct,success:true})];
 const before=JSON.stringify(records),r=buildIncidentReport(records);
 assert.equal(r.incident.round,2);assert.equal(r.incident.choice,b.opts[1]);assert.equal(r.incident.question,b.text);
 assert.equal(r.best.round,3);assert.equal(r.best.choice,a.opts[a.correct]);assert.equal('clues' in r,false);assert.doesNotMatch(r.summary,/發現.*線索/);assert.equal(r.completed,3);
 assert.equal(JSON.stringify(records),before);assert.match(r.summary,/3\/12/);
});
test('timeout is an actual incident and never invents a selected answer or a best action',()=>{
 const r=buildIncidentReport([answerRecord(PICTURE_BANK.cat[0],{round:1,hpLost:40})],{faction:'cat'});
 assert.equal(r.title,'腦內排練超時王');assert.equal(r.incident.choice,'時間到，尚未作答');assert.equal(r.best,null);
});
test('a clean run does not manufacture an accident and titles depend on observed actions',()=>{
 const q=PICTURE_BANK.cat[0],record=answerRecord(q,{round:1,choice:q.correct,success:true});
 const r=buildIncidentReport([record],{faction:'cat'});assert.equal(r.incident,null);assert.equal(r.title,'貓界邊界感專員');
 assert.equal(buildIncidentReport([record]).title,'氣氛消防員');assert.equal(r.best.choice,q.opts[q.correct]);
});

test('the report describes the chosen mistake rather than assigning another option to the player',()=>{
 const q=PICTURE_BANK.cat[0];
 assert.match(answerRecord(q,{round:1,choice:3}).incident,/抱/);
 assert.match(comicReveal(q,{faction:'cat',choice:3}).thought,/抱/);
 assert.match(answerRecord(q,{round:1,choice:0}).incident,/摸肚/);
 assert.match(answerRecord(q,{round:1}).incident,/錯過現場回應/);
});
