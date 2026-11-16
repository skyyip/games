import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {QUESTIONS} from '../src/questions.js';
import {STREET_OBSERVATION_QUESTIONS as bank} from '../src/street-observation-questions.js';
import {visualModes,visualSpec,questionView,cropLayout} from '../src/question-view.js';
import {newRun,questionId,presentation,act,hkDay,questionFor} from '../src/game.js';
import {newSession,sessionQuestion,sessionPresentation,sessionAct,ROOM_REVEAL_MS,ROOM_INTERVAL,ROOM_DURATION} from '../src/session-engine.js';
const NOW=Date.UTC(2026,10,16,4),DAY=hkDay(NOW);
test('both supplied drafts map every topic to one new, sourced, reachable question',()=>{
 const source=JSON.parse(readFileSync(new URL('../docs/source-street-60-topics.json',import.meta.url)));
 assert.equal(source.sourceEntries,60);assert.equal(source.topics.filter(q=>q.source===1).length,45);assert.equal(source.topics.filter(q=>q.source===2).length,15);
 assert.equal(bank.length,60);const counts=[0,0,0,0];for(const [i,q]of bank.entries()){
  assert.equal(q.id,source.topics[i].id);assert(QUESTIONS.includes(q));assert(q.review&&q.source.url&&q.explanation&&q.hint);counts[q.answer]++;
  assert.equal(new Set(q.options).size,4);assert(q.question.length<=55,q.id);assert(q.options.every(v=>v.length<=32),q.id);
  const svg=readFileSync(new URL('../assets/'+q.art+'.svg',import.meta.url),'utf8');assert(svg.includes('viewBox="0 0 800 500"'));assert(!/<script|<image|https?:/.test(svg.replace('http://www.w3.org/2000/svg','')));
 }
 assert.deepEqual(counts,[15,15,15,15]);
});
test('effects require an authored visual clue; legacy diagrams remain readable originals or text',()=>{
 for(const q of QUESTIONS){const modes=visualModes(q);assert(modes.length);if(!q.observation)assert(modes.every(m=>m==='original'||m==='text'));else{
  assert(q.observation.clue&&q.textQuestion);if(modes.includes('mirrored')){assert(q.observation.mirroredPrompt?.includes('還原'),q.id);assert.equal(q.observation.mirrorAxis,'horizontal');}
  for(const mode of modes){const view=questionView(q,mode);assert.equal(view.answer,q.answer);assert.strictEqual(view.options,q.options);assert(view.question);}
 }}
});
test('curated partial rectangles expose 5–10% of artwork and keep identical source pixels on every screen',()=>{
 const screens=[[320,75],[390,160],[700,230],[350,45]];
 for(const q of bank.filter(q=>q.modes.includes('partial'))){const crop=q.observation.crop,area=crop.width*crop.height/400000;assert(area>=.05&&area<=.1,q.id);assert(crop.x>=0&&crop.y>=0&&crop.x+crop.width<=800&&crop.y+crop.height<=500);
  assert.equal(visualSpec(q,'partial').partial,area);
  for(const [w,h]of screens){const l=cropLayout(crop,w,h),scale=l.width/800;assert(Math.abs(l.left+crop.x*scale-(w-crop.width*scale)/2)<1e-8);assert(Math.abs(l.top+crop.y*scale-(h-crop.height*scale)/2)<1e-8);assert(crop.width*scale<=w+1e-8);assert(crop.height*scale<=h+1e-8);assert(l.clip.startsWith('inset('));}
 }
});
test('all new questions and every offered visual mode can occur in the daily schedule',()=>{
 const seen=new Set();for(let day=DAY;day<DAY+1500;day++)for(let i=0;i<15;i++){const id=questionId(day,i);seen.add(id+':'+presentation(day,i).mode);}
 for(const q of bank)for(const mode of visualModes(q))assert(seen.has(q.id+':'+mode),q.id+' '+mode+' unreachable');
});
test('room reveal lasts exactly 2.5s; peers never get the full image early by answering first',()=>{
 assert.equal(ROOM_REVEAL_MS,2500);assert.equal(ROOM_INTERVAL,27500);assert.equal(ROOM_DURATION,275000);
 let run;for(let seed=DAY;seed<DAY+1000;seed++){const r=newSession({id:'room',uid:'a',kind:'room',seed},NOW,NOW);if(['partial','blurred','mirrored'].includes(sessionPresentation(r,NOW).mode)){run=r;break;}}
 assert(run);const p=sessionPresentation(run,NOW),revealed=sessionAct(run,{type:'answer',choice:sessionQuestion(run).answer},NOW+1000);
 assert.deepEqual(sessionPresentation(revealed,NOW+24000),p);assert.equal(sessionPresentation(revealed,NOW+25000).mode,'original');
 assert.throws(()=>sessionAct(revealed,{type:'next'},NOW+27499),/room-wait/);assert.equal(sessionAct(revealed,{type:'next'},NOW+27500).questionAt,NOW+27500);
 const peer={...run,uid:'b'};assert.deepEqual(sessionPresentation(peer,NOW+1000),p);
});
test('every transformed puzzle keeps canonical answer validation independent of A–D display order',()=>{
 const seen=new Set();for(let day=DAY;day<DAY+1500;day++)for(let index=0;index<15;index++){
  const r={...newRun(day,day*86400000+4*3600000),index,correct:index},q=questionFor(r),mode=presentation(day,index).mode;
  if(!q.observation||!['partial','blurred','mirrored'].includes(mode)||seen.has(q.id+mode))continue;
  const after=act(r,{type:'answer',choice:questionView(q,mode).answer},r.questionAt+1000,{autoFinish:false});assert.equal(after.outcome,'correct');assert.equal(after.answers[index].qid,q.id);seen.add(q.id+mode);
 }assert.equal(seen.size,bank.reduce((n,q)=>n+visualModes(q).filter(m=>['partial','blurred','mirrored'].includes(m)).length,0));
});

test('mirrored text and number puzzles have a legible authored overview on small screens',()=>{
 const sizes={s16:57,s21:24,s40:50,s43:24};
 for(const q of bank.filter(q=>q.modes.includes('mirrored'))){const r=q.observation.overview;assert(r);assert(r.x>=0&&r.y>=0&&r.x+r.width<=800&&r.y+r.height<=500);if(sizes[q.id]){const l=cropLayout(r,290,80);assert(l.width/800*sizes[q.id]>=12,q.id);}}
});
