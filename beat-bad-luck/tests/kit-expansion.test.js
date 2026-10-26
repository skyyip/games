import test from 'node:test';import assert from 'node:assert/strict';
import {EXTRA_KITS} from '../src/kit-catalog.js';import {KitSkill,KIT_SKILLS,SKILL_CHARGE,SKILL_DURATION} from '../src/kit-skills.js';
import {currentKitStep} from '../src/kit-gestures.js';import {WEAPONS,weaponScoreMultiplier} from '../src/catalog.js';import {RitualGame,DURATIONS} from '../src/game.js';
const charge=s=>{for(let i=0;i<SKILL_CHARGE;i++)s.gain();return s;};
function samples(step){if(step.type==='trace')return step.path;if(step.type==='drag')return [step.from,step.to];if(step.type==='rub')return Array.from({length:step.need+2},(_,i)=>[i%2?.82:.18,.45]);if(step.type==='circle')return Array.from({length:33},(_,i)=>{const a=(step.direction==='ccw'?-1:1)*Math.PI*2*i/32;return [.5+.3*Math.cos(a),.45+.3*Math.sin(a)];});return step.direction==='left'?[[.85,.45],[.15,.45]]:step.direction==='right'?[[.15,.45],[.85,.45]]:step.direction==='up'?[[.5,.85],[.5,.15]]:[[.5,.15],[.5,.85]];}
function completeStep(s,time,dispatch=(type,input,at)=>s.action(type,input,at)){const a=s.active,step=currentKitStep(s.spec,a);let out;
 if(step.type==='tap'||step.type==='beat'){time=step.type==='beat'?a.extra.stepAt+step.period:time+120;out=dispatch('choice',{index:step.target},time);}
 else if(step.type==='pinch'){dispatch('pinch-start',{distance:.72},time);time+=120;out=dispatch('pinch',{distance:.3},time);}
 else if(step.type==='hold'||step.type==='aim'){dispatch('gesture-begin',{x:.5,y:.45,assist:step.type==='aim'},time);time+=step.ms+40;out=dispatch('gesture-release',{},time);}
 else{const path=samples(step);dispatch('gesture-begin',{x:path[0][0],y:path[0][1]},time);time+=120;out=dispatch('gesture-stroke',{points:path},time);}
 return {out,time};
}
test('every catalogue item, including free hands, has a bilingual signature; new recipes differ beyond text and art',()=>{
 assert.deepEqual(Object.keys(KIT_SKILLS).sort(),WEAPONS.map(w=>w.id).sort());assert.equal(Object.keys(EXTRA_KITS).length,39);
 const mechanics=[];for(const [id,spec]of Object.entries(EXTRA_KITS)){for(const pair of [spec.name,spec.hint,spec.win,spec.tag])assert.ok(pair.length===2&&pair.every(t=>typeof t==='string'&&t.length),id);assert.ok(spec.steps.length>=1&&spec.steps.length<=4);mechanics.push(JSON.stringify(spec.steps.map(({label,...rules})=>rules)));}
 assert.equal(new Set(mechanics).size,39);
});
for(const [id,spec]of Object.entries(EXTRA_KITS))test(`${id}: complete its real gesture recipe inside five seconds and award once`,()=>{
 const s=charge(new KitSkill(id));assert.equal(s.start(0,[]),true);let time=0;for(let i=0;i<spec.steps.length;i++){const done=completeStep(s,time);time=done.time;assert.equal(done.out.ok,true,`${id} step ${i}`);assert.equal(done.out.won,i===spec.steps.length-1);assert.equal(done.out.raw,i===spec.steps.length-1?50:0);}
 assert.ok(time<SKILL_DURATION,id);assert.equal(s.wins,1);assert.equal(s.action('choice',{index:0},time+120).ok,false);
});
test('wrong directions, tiny circles, scribbles and stationary drops cannot advance a recipe',()=>{
 for(const [id,points]of [['paper',[[.5,.2],[.5,.8]]],['spanner',[[.51,.45],[.5,.46],[.49,.45],[.5,.44],[.51,.45]]],['sword',[[.2,.25],[.8,.68]]],['bag',[[.2,.25],[.2,.25]]]]){
  const s=charge(new KitSkill(id));s.start(0,[]);const actual=id==='paper'?[[.2,.4],[.8,.4]]:points,first=actual[0];s.action('gesture-begin',{x:first[0],y:first[1]},10);assert.equal(s.action('gesture-stroke',{points:actual},200).ok,false,id);assert.equal(s.active.progress,0);
 }
});
test('strokes must start at their captured origin, be finite, have bounded sample counts and stop after cancellation',()=>{
 const s=charge(new KitSkill('paper'));s.start(0,[]);assert.equal(s.action('gesture-stroke',{points:[[.5,.2],[.5,.8]]},10).ok,false);
 for(const path of [[[.1,.1],[.5,.8]],[[NaN,.2],[.5,.8]],Array.from({length:129},(_,i)=>[.5,i===128?.8:.2])]){s.action('gesture-begin',{x:.5,y:.2},20);assert.equal(s.action('gesture-stroke',{points:path},40).ok,false);}
 s.action('gesture-begin',{x:.5,y:.2},60);s.cancelPointer();assert.equal(s.action('gesture-stroke',{points:[[.5,.2],[.5,.8]]},200).ok,false);
});
test('headband uses two separated fingers closing inward; repeated releases cannot award',()=>{
 const s=charge(new KitSkill('golden-headband'));s.start(0,[]);assert.equal(s.action('pinch',{distance:.3},10).ok,false);assert.equal(s.action('pinch-start',{distance:.1},20).ok,false);s.action('pinch-start',{distance:.7},30);assert.equal(s.action('pinch',{distance:.65},100).ok,false);s.action('pinch-start',{distance:.7},200);assert.equal(s.action('pinch',{distance:.3},300).ok,true);assert.equal(s.active.progress,1);assert.equal(s.action('pinch',{distance:.3},400).ok,false);
});
test('aim needs continuous time on target, resets when outside and cannot use paused or stale holds',()=>{
 const s=charge(new KitSkill('ufo-rifle'));s.start(0,[]);s.action('gesture-begin',{x:0,y:0},0);s.advance(1100);assert.equal(s.active.extra.aimMs,0);assert.equal(s.action('gesture-release',{},1150).ok,false);
 s.action('gesture-begin',{x:.5,y:.45,assist:true},1200);s.advance(1700);assert.equal(s.active.extra.aimMs,500);s.cancelPointer();assert.equal(s.action('gesture-release',{},2400).ok,false);s.action('gesture-begin',{x:.5,y:.45,assist:true},2500);assert.equal(s.action('gesture-release',{},3450).ok,true);
});
test('beat cues reject immediate taps and wrong targets, then allow the next recurring cue',()=>{
 const s=charge(new KitSkill('triple-trio'));s.start(0,[]);assert.equal(s.action('choice',{index:2},10).ok,false);assert.equal(s.action('choice',{index:0},750).ok,false);assert.equal(s.action('choice',{index:2},1500).ok,true);assert.equal(s.active.progress,1);assert.equal(s.action('choice',{index:0},1500).ok,false);
});
test('new recipes keep public-API multiplied bonuses, phase guards and clean replays',()=>{
 for(const id of ['bare-hand','spanner','rebirth-paper']){let now=0;const g=new RitualGame({now:()=>now,random:()=>.1});g.start({weapon:id});assert.equal(g.activateSkill(),false);now+=DURATIONS.incense;g.advance();now+=DURATIONS.worry;g.advance();for(let i=0;i<12;i++){g.hit();now+=80;}g.advance();assert.equal(g.activateSkill(),true);let time=g.elapsed;const before=g.score;
 const phaseAt=now-g.elapsed;while(g.skill.active){const finished=completeStep(g.skill,time,(type,input,at)=>{now=phaseAt+at;return g.skillAction(type,input);});time=finished.time;assert.equal(finished.out.ok,true);}
 assert.equal(g.score-before,Math.round(50*weaponScoreMultiplier(id)));g.start({weapon:id});assert.equal(g.skill.charge,0);assert.equal(g.skill.attempts,0);}
});
