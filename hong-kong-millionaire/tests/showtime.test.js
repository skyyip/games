import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRIENDS,friendHint,hostPrompt,resultBadges,stageFor} from '../src/showtime-model.js';
import {AUDIO_QUESTIONS,SCRATCH_IDS,scratchPool,brushCells,scratchStars,newPractice,validPractice,practiceAnswer} from '../src/sensory-model.js';
import {SPOTLIGHT_IDS} from '../src/visual-catalog.js';
import {questionById,questionId,newRun,hkDay} from '../src/game.js';
import {visualModes} from '../src/question-view.js';
test('all four free friends preserve exactly the same factual hint',()=>{
 assert.equal(FRIENDS.length,4);const text='留意路軌。';for(const f of FRIENDS)assert.equal(friendHint(f.id,text).hint,text);assert.equal(friendHint('bad',text).name,FRIENDS[0].name);
});
test('host prompts are stable across retries and never invent population statistics',()=>{
 const r={...newRun(),index:14};assert.equal(hostPrompt(r),hostPrompt({...r}));assert(!/\d+%|全港/.test(hostPrompt(r)));assert.equal(hostPrompt({...r,phase:'reveal'}),'');
 for(let day=0;day<30;day++){assert(!hostPrompt({...r,day,halfFor:0,phoneFor:1,audienceFor:2}).includes('仲用唔用'));assert(!/保險線|百萬/.test(hostPrompt({...r,day,kind:'room',index:9})));}
 assert.equal(stageFor(4),'warm');assert.equal(stageFor(5),'tense');assert.equal(stageFor(10),'final');assert.equal(stageFor(7,10),'final');
});
test('44萬 rollercoaster badge requires failing after fourteen correct answers',()=>{
 const base={phase:'finished',reason:'wrong',index:13,correct:13,halfFor:-1,phoneFor:-1,audienceFor:-1};assert(!resultBadges(base).some(b=>b.id==='rollercoaster'));assert(resultBadges({...base,index:14,correct:14}).some(b=>b.id==='rollercoaster'));
 assert(resultBadges({...base,index:0,correct:0}).some(b=>b.id==='visitor'));assert(!resultBadges({...base,index:0,correct:0,reason:'walk'}).some(b=>b.id==='visitor'));assert.equal(resultBadges({...base,phase:'playing'}).length,0);
});
test('scratch rewards count the union of revealed source cells and stop beyond 50 percent',()=>{
 const first=brushCells([],20,12);assert(first.length>0);assert.deepEqual(brushCells(first,20,12),first);assert.equal(new Set(brushCells(first,0,0)).size,brushCells(first,0,0).length);
 assert.equal(scratchStars(true,Array.from({length:200},(_,i)=>i)),3);assert.equal(scratchStars(true,Array.from({length:350},(_,i)=>i)),2);assert.equal(scratchStars(true,Array.from({length:500},(_,i)=>i)),1);assert.equal(scratchStars(true,Array.from({length:501},(_,i)=>i)),0);assert.equal(scratchStars(false,[]),0);
});
test('practice has five distinct questions, no ranked prize fields, and a persistent 25-second deadline',()=>{
 const time=Date.now(),ids=AUDIO_QUESTIONS.map(q=>q.id),run=newPractice('audio',ids,time,()=>.3);assert.equal(new Set(run.qids).size,5);assert.equal(validPractice(run,ids,time),run);assert(!('payout'in run));const playing={...run,phase:'playing',questionAt:time};const answer=AUDIO_QUESTIONS.find(q=>q.id===run.qids[0]).answer;
 assert(practiceAnswer(playing,answer,answer,time+24999).answers[0].correct);assert(!practiceAnswer(playing,answer,answer,time+25000).answers[0].correct);assert.equal(validPractice({...run,qids:Array(5).fill(ids[0])},ids),null);assert.equal(validPractice({...run,cells:[1000]},ids),null);assert.equal(validPractice({...run,startedAt:time-86400001},ids,time),null);
});
test('all spotlight and scratch scenes are curated; sound sketches are playable original PCM assets',()=>{
 for(const id of SCRATCH_IDS){const q=questionById(id);assert(q.observation?.clue);assert(!q.observation.overview,'Reading small print is not an interactive picture puzzle: '+id);}
 for(const id of SPOTLIGHT_IDS)assert(visualModes(questionById(id)).includes('spotlight'));
 for(const q of AUDIO_QUESTIONS){assert.equal(new Set(q.options).size,4);assert(q.answer>=0&&q.answer<=3);assert(q.caption&&q.explanation);const wav=readFileSync(new URL('../assets/'+q.audio+'.wav',import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt32LE(24),22050);assert.equal((wav.length-44)/44100,4);}
});
test('new scratch practice never discloses the current daily questions, across a full year',()=>{
 const today=hkDay();for(let day=today;day<today+365;day++){const daily=new Set(Array.from({length:15},(_,i)=>questionId(day,i))),pool=scratchPool(day);assert(pool.length>=5);const r=newPractice('scratch',pool);assert(r.qids.every(id=>!daily.has(id)));}
});
