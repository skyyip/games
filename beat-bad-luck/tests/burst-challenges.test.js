import test from 'node:test';import assert from 'node:assert/strict';
import {RitualGame} from '../src/game.js';
import {ULTIMATE_DURATION} from '../src/comedy-content.js';
import {BODY_PARTS,RING_ROUND_MS,RING_IDEAL_MS,pullDirection,createBurstChallenge,resolveBurstAction,syncBurstChallenge} from '../src/burst-challenges.js';
function triple(){let first=true;return ()=>{if(first){first=false;return .999;}return 0;};}
function setup(random=()=>.4){let now=0;const g=new RitualGame({now:()=>now,random});g.start();g.next();g.next();return {g,step(ms){now+=ms;g.advance();},charge(){for(let i=0;i<88;i++){this.step(60);assert.ok(g.hit());}},second(random){this.charge();g.startFinisher();this.step(ULTIMATE_DURATION);this.charge();if(random)g.random=random;g.startFinisher();}};}
test('first finisher randomly chooses the next valid body part after each hit, without immediate repeats',()=>{const s=setup();s.charge();s.g.startFinisher();assert.equal(s.g.finisher.challenge.mode,'targets');const seen=[];for(let i=0;i<15;i++){const part=s.g.finisher.challenge.target;seen.push(part);s.step(60);const hit=s.g.finisherAction(part);assert.equal(hit.challengePart,part);assert.equal(hit.points,225);assert.equal(s.g.finisherCharge,0);}assert.ok(seen.every(id=>BODY_PARTS.some(p=>p.id===id)));assert.equal(s.g.finisher.challenge.bag.length,0);for(let i=1;i<seen.length;i++)assert.notEqual(seen[i],seen[i-1]);});
test('correct parts are mandatory; arbitrary gestures and wrong parts award no points or wear',()=>{const s=setup();s.charge();s.g.startFinisher();s.step(100);const score=s.g.score,hits=s.g.hits,part=s.g.finisher.challenge.target;assert.equal(s.g.hit(),null);assert.equal(s.g.finisherAction('timing'),null);assert.equal(s.g.finisherAction(BODY_PARTS.find(p=>p.id!==part).id),null);assert.equal(s.g.score,score);assert.equal(s.g.hits,hits);assert.equal(s.g.finisher.challenge.target,part);assert.ok(s.g.finisherAction(part));});
test('three finisher challenges cycle in order while every use needs its own 88-hit chain',()=>{const s=setup();for(let use=1;use<=6;use++){s.g.phaseStarted=s.g.clock;s.charge();assert.ok(s.g.startFinisher());assert.equal(s.g.finisher.challenge.mode,['targets','timing','pull'][(use-1)%3]);assert.equal(s.g.startFinisher(),false);s.step(ULTIMATE_DURATION);assert.equal(s.g.finisherCharge,0);assert.equal(s.g.startFinisher(),false);}s.g.start();assert.equal(s.g.finisherUses,0);});
test('ring windows award Excellence 675, Great 450, Nice 225 and zero outside the windows',()=>{for(const [phase,grade,points]of [[0,'Miss',0],[389,'Miss',0],[390,'Nice',225],[709,'Nice',225],[710,'Great',450],[879,'Great',450],[880,'Excellence',675],[1040,'Excellence',675],[1200,'Excellence',675],[1201,'Great',450],[1299,'Great',450]]){const s=setup();s.second();const ringId=s.g.finisher.challenge.rings[0].id;s.step(phase);const before=s.g.score,hits=s.g.hits,result=s.g.finisherAction('timing:'+ringId);assert.equal(result.challengeGrade,grade,phase);assert.equal(result.points,points);assert.equal(s.g.score-before,points);assert.equal(s.g.hits-hits,points?1:0);assert.equal(s.g.finisherAction('timing:'+ringId,{pointer:'second-finger'}),null);assert.equal(s.g.score-before,points);}});
test('one attempt per individual ring prevents spam farming while other rings keep their own clocks',()=>{
 const s=setup();s.second();const before=s.g.score,first=s.g.finisher.challenge.rings[0];assert.equal(s.g.finisherAction('timing:'+first.id).points,0);s.step(RING_IDEAL_MS);assert.equal(s.g.finisherAction('timing:'+first.id),null);assert.equal(s.g.score,before);const next=s.g.finisher.challenge.rings.find(r=>r.id!==first.id);s.step(next.at+RING_IDEAL_MS-s.g.finisherTime);assert.equal(s.g.finisherAction('timing:'+next.id).challengeGrade,'Excellence');assert.equal(s.g.score-before,675);
});
test('pause freezes ring timing and inputs; resuming preserves precision and round deadlines',()=>{const s=setup();s.second();s.step(680);s.g.pause();const time=s.g.finisherTime,score=s.g.score;s.step(60000);assert.equal(s.g.finisherTime,time);assert.equal(s.g.finisherAction('timing'),null);assert.equal(s.g.score,score);s.g.resume();s.step(RING_IDEAL_MS-680);assert.equal(s.g.finisherAction('timing').challengeGrade,'Excellence');s.step(ULTIMATE_DURATION-RING_IDEAL_MS);assert.equal(s.g.finisherBusy,false);assert.equal(s.g.finisherAction('timing'),null);assert.equal(s.g.score-score,675);});

test('vertical pulls require a meaningful vertical distance and reject taps, short and horizontal drags',()=>{
 for(const [dx,dy,action]of [[0,0,null],[0,39,null],[0,-39,null],[40,40,null],[100,10,null],[0,40,'pull-down'],[0,-40,'pull-up'],[20,60,'pull-down'],[-20,-60,'pull-up'],[Infinity,60,null],[0,NaN,null]])assert.equal(pullDirection(dx,dy),action,`${dx},${dy}`);
});
test('third finisher only scores upward/downward pulls, applies bonuses, freezes on pause and ends cleanly',()=>{
 const s=setup();s.g.weapon='beauty-fist';s.g.skin='retriever';s.second();s.step(ULTIMATE_DURATION);s.charge();assert.ok(s.g.startFinisher());assert.equal(s.g.finisher.challenge.mode,'pull');const before=s.g.score,hits=s.g.hits;
 for(const action of ['tap','timing','head','pull-left','pull-right'])assert.equal(s.g.finisherAction(action),null);assert.equal(s.g.hit({gesture:'heavy'}),null);assert.equal(s.g.score,before);assert.equal(s.g.hits,hits);
 for(const action of ['pull-up','pull-down']){s.step(100);const hit=s.g.finisherAction(action);assert.equal(hit.points,Math.round(225*s.g.scoreMultiplier));assert.equal(hit.challengeGrade,'Pull');assert.equal(hit.power,6);assert.equal(s.g.finisherAction(action),null);}assert.equal(s.g.finisherCharge,0);assert.equal(s.g.finisher.hits,2);
 s.g.pause();s.step(5000);assert.equal(s.g.finisherAction('pull-up'),null);s.g.resume();s.step(ULTIMATE_DURATION-200);assert.equal(s.g.finisherBusy,false);assert.equal(s.g.finisherAction('pull-down'),null);assert.equal(s.g.score-before,2*Math.round(225*s.g.scoreMultiplier));
});

test('faster target tapping accepts a new valid hit at 35ms but still rejects duplicate events',()=>{
 const s=setup();s.charge();s.g.startFinisher();assert.ok(s.g.finisherAction(s.g.finisher.challenge.target));s.step(34);assert.equal(s.g.finisherAction(s.g.finisher.challenge.target),null);s.step(1);assert.ok(s.g.finisherAction(s.g.finisher.challenge.target));assert.equal(s.g.finisher.hits,2);
});
test('rings start at staggered times, have unique live parts and expire individually within the three-ring cap',()=>{
 for(const roll of [0,.4,.9999]){const s=setup(()=>roll);s.second();const seen=new Map(),score=s.g.score;assert.equal(s.g.finisher.challenge.rings.length,1);
 for(let i=0;i<999;i++){const active=s.g.finisher.challenge.rings;assert(active.length>=1&&active.length<=3);assert.equal(new Set(active.map(r=>r.part)).size,active.length);assert.equal(new Set(active.map(r=>r.at)).size,active.length);for(const ring of active){assert(s.g.finisherTime-ring.at>=0&&s.g.finisherTime-ring.at<RING_ROUND_MS);if(seen.has(ring.id))assert.equal(seen.get(ring.id),ring.at);seen.set(ring.id,ring.at);}s.step(10);}assert(seen.size>=Math.floor(10000/RING_ROUND_MS));assert.equal(s.g.score,score);}
});
test('expired ring IDs and the finisher deadline cannot leak points',()=>{
 const s=setup();s.second();const first=s.g.finisher.challenge.rings[0],before=s.g.score;s.step(RING_IDEAL_MS);assert.equal(s.g.finisherAction('timing:'+first.id).points,675);s.step(RING_ROUND_MS-RING_IDEAL_MS);assert.equal(s.g.finisherAction('timing:'+first.id),null);s.step(ULTIMATE_DURATION-RING_ROUND_MS);assert.equal(s.g.finisherBusy,false);assert.equal(s.g.finisherAction('timing'),null);assert.equal(s.g.score-before,675);
});

test('each first-use target is sampled anew, all five parts are reachable and a part may return before all five appear',()=>{
 const initial=BODY_PARTS.map((_,i)=>createBurstChallenge(1,()=>i/5+.01).target);assert.deepEqual(initial,BODY_PARTS.map(p=>p.id));
 const state=createBurstChallenge(1,()=>0),seen=[state.target];for(let i=0;i<3;i++){assert.ok(resolveBurstAction(state,state.target,100+i*100,()=>0));seen.push(state.target);}assert.deepEqual(seen,['head','left-hand','head','left-hand']);
});

test('each staggered ring can score Excellence at its own ideal time, even as older rings disappear',()=>{
 const s=setup();s.second(triple());s.step(720);const rings=[...s.g.finisher.challenge.rings],before=s.g.score;assert.equal(rings.length,3);assert.deepEqual(rings.map(r=>r.at),[0,320,640]);
 for(const ring of rings){s.step(ring.at+RING_IDEAL_MS-s.g.finisherTime);assert.equal(s.g.finisherAction('timing:'+ring.id).points,675);assert.equal(s.g.finisherAction('timing:'+ring.id,{pointer:'other'}),null);}assert.equal(s.g.score-before,2025);assert.equal(s.g.finisher.hits,3);assert.equal(s.g.finisherCharge,0);
});
test('three existing rings can score separately with the same pointer at one instant, using their own ages',()=>{
 const s=setup();s.second(triple());s.step(1220);const rings=s.g.finisher.challenge.rings,before=s.g.score;assert.equal(rings.length,3);for(const [i,points]of [450,675,225].entries())assert.equal(s.g.finisherAction('timing:'+rings[i].id).points,points);assert.equal(s.g.score-before,1350);assert.equal(s.g.finisher.hits,3);assert.equal(s.g.finisherAction('timing:unknown'),null);
});
test('an early miss locks only its own ring while the other staggered rings remain playable',()=>{
 const s=setup();s.second(triple());const first=s.g.finisher.challenge.rings[0],before=s.g.score;assert.equal(s.g.finisherAction('timing:'+first.id).challengeGrade,'Miss');s.step(1220);assert.equal(s.g.finisherAction('timing:'+first.id),null);const other=s.g.finisher.challenge.rings.filter(r=>r.id!==first.id);assert.equal(s.g.finisherAction('timing:'+other[0].id).points,675);assert.equal(s.g.finisherAction('timing:'+other[1].id).points,225);assert.equal(s.g.score-before,900);
});
test('a delayed render catches up the schedule without resetting surviving rings to the same age',()=>{
 const a=setup(),b=setup();a.second();b.second();for(let i=0;i<500;i++)a.step(10);b.step(5000);assert.deepEqual(a.g.finisher.challenge.rings,b.g.finisher.challenge.rings);assert.equal(a.g.finisher.challenge.nextSpawnAt,b.g.finisher.challenge.nextSpawnAt);
});

 test('random batches contain one, two or three independently placed staggered rings',()=>{
 for(const [roll,count]of [[0,1],[.4,2],[.999,3]]){
  const state=createBurstChallenge(2,()=>roll),seen=new Map();
  for(let t=0;t<10000;t+=10){syncBurstChallenge(state,t,()=>roll);assert(state.rings.length>=1&&state.rings.length<=count);for(const r of state.rings){assert(r.position.x>=0&&r.position.x<=1&&r.position.y>=0&&r.position.y<=1);seen.set(r.id,r);}}
  const rings=[...seen.values()];assert.equal(rings[0].at,0);for(let i=0;i<count;i++)assert(rings[i].at<RING_ROUND_MS);assert.equal(rings[count].at,rings[count-1].at+RING_ROUND_MS);
  const fresh=createBurstChallenge(2,()=>roll);syncBurstChallenge(fresh,1000,()=>roll);assert.equal(fresh.rings.length,count);
 }
});
test('random positions vary independently of body parts and remain stable for each live ring',()=>{
 let seed=9;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32),state=createBurstChallenge(2,random),positions=new Map();
 for(let t=0;t<10000;t+=10){syncBurstChallenge(state,t,random);for(const ring of state.rings){if(positions.has(ring.id))assert.deepEqual(ring.position,positions.get(ring.id));else positions.set(ring.id,{...ring.position});}}
 assert(new Set([...positions.values()].map(p=>p.x)).size>8);assert([...positions.values()].some(p=>p.x<.3));assert([...positions.values()].some(p=>p.x>.7));
});

test('requested durations keep 66-second rounds, twelve-second bursts and 1.3-second rings in sync',async()=>{const {DURATIONS}=await import('../src/game.js');assert.equal(DURATIONS.beat,66000);assert.equal(ULTIMATE_DURATION,12000);assert.equal(RING_ROUND_MS,1300);assert.equal(RING_IDEAL_MS/RING_ROUND_MS,.8);});
