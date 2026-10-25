import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,countRoutes,levelById} from '../src/levels.js';
import {MazeGame,BALL_RADIUS,BOMB_RADIUS,routeAt,formatTime,readRecords,addRecord,topThree} from '../src/game.js';
import {TiltSensor,ShakeSensor,tiltAxes,projectAxes} from '../src/sensors.js';
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} ≈ ${b}`);
function advance(g,seconds){const events=[];for(let i=0;i<Math.round(seconds*120);i++)events.push(...g.advance(1/120));return events;}
function quiet(id=1){const g=new MazeGame({random:()=>.99});g.start(id);g.nextBomb=Infinity;g.nextFog=Infinity;return g;}
test('five distinct mazes each have exactly three start-to-finish paths, closed boundaries and valid bomb routes',()=>{
  assert.equal(LEVELS.length,5);assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.grid))).size,5);
  for(const l of LEVELS){assert.equal(countRoutes(l),3);assert.equal(l.routes.length,3);assert.ok(l.grid[15][8]&&l.grid[1][8]);
    for(let i=0;i<17;i++)assert.equal(l.grid[0][i]+l.grid[16][i]+l.grid[i][0]+l.grid[i][16],0);
    for(const path of l.routes){assert.deepEqual(path[0],{x:8,y:15});assert.deepEqual(path.at(-1),{x:8,y:1});assert.equal(new Set(path.map(p=>`${p.x},${p.y}`)).size,path.length);path.forEach((p,i)=>{assert.equal(l.grid[p.y][p.x],1);if(i)assert.equal(Math.abs(p.x-path[i-1].x)+Math.abs(p.y-path[i-1].y),1);});}
  }assert.throws(()=>levelById(6));
});
test('all fifteen routes can physically be completed with the actual rolling and wall model',()=>{
  for(const level of LEVELS)for(const path of level.routes){const g=quiet(level.id);let i=1;
    for(let frame=0;frame<120*70&&g.state==='playing';frame++){const target=path[i],dx=target.x+.5-g.ball.x,dy=target.y+.5-g.ball.y;if(Math.hypot(dx,dy)<.14&&i<path.length-1)i++;g.setInput(dx*2.8-g.ball.vx*.9,dy*2.8-g.ball.vy*.9);g.advance(1/120);}
    assert.equal(g.outcome,'won',`level ${level.id}`);assert.ok(g.elapsed>0);}
});
test('tilting accelerates, level input slows naturally, and diagonal input has no speed advantage',()=>{
  const a=quiet(),b=quiet();a.setInput(0,-1);b.setInput(1,-1);close(Math.hypot(b.input.x,b.input.y),1);advance(a,.3);assert.ok(a.ball.vy<0);const v=Math.abs(a.ball.vy);a.setInput(0,0);advance(a,.3);assert.ok(Math.abs(a.ball.vy)<v);a.setInput(NaN,1);assert.deepEqual(a.input,{x:0,y:0});
});
test('strong impulses cannot tunnel through a wall or escape the board',()=>{
  const g=quiet();g.ball.y=14.5;g.setInput(1,0);for(let i=0;i<600;i++){if(i%60===0)g.shake({x:1,y:0});g.advance(1/120);assert.ok(g.ball.x<=9-BALL_RADIUS+.0001);assert.ok(g.ball.x>=8+BALL_RADIUS-.0001);}assert.ok(g.wallHits>0);
});
test('fixed simulation steps match across display frame rates',()=>{
  const a=quiet(),b=quiet();a.setInput(0,-.5);b.setInput(0,-.5);for(let i=0;i<120;i++)a.advance(1/120);for(let i=0;i<30;i++)b.advance(1/30);close(a.elapsed,b.elapsed);close(a.ball.y,b.ball.y);close(a.ball.vy,b.ball.vy);
});
test('fog grows gradually after the level delay and only two separated shakes clear it',()=>{
  const g=new MazeGame({random:()=>.5});g.start();g.nextBomb=Infinity;advance(g,7.9);assert.equal(g.fog,0);advance(g,2);assert.ok(g.fog>0&&g.fog<.5);const before={...g.ball};assert.equal(g.shake({x:1,y:.3}),'shake');assert.ok(g.ball.vx>before.vx);assert.equal(g.shake({x:-1,y:0}),null);advance(g,.3);assert.equal(g.shake({x:-1,y:0}),'cleared');assert.equal(g.fog,0);assert.equal(g.fogStarted,null);assert.equal(g.shakes,0);assert.ok(g.nextFog>g.elapsed+7);assert.notEqual(g.ball.x,before.x);
});
test('an expired shake pair must restart and preemptive shaking cannot postpone fog',()=>{
  const g=quiet();g.nextFog=8;g.shake({x:1,y:0});advance(g,1.6);assert.equal(g.shakes,0);g.shake({x:-1,y:0});assert.equal(g.shakes,1);assert.equal(g.nextFog,8);advance(g,.3);g.shake({x:1,y:0});assert.equal(g.fog,0);assert.equal(g.nextFog,8);advance(g,6.2);assert.ok(g.fogStarted!==null);
});
test('bomb warning precedes spawn, the chosen route runs from finish to start, and population stays bounded',()=>{
  const g=new MazeGame({random:()=>.99});g.start(5);advance(g,8.05);assert.ok(g.pending);assert.equal(g.bombs.length,0);advance(g,1.6);assert.equal(g.bombs.length,1);const b=g.bombs[0];assert.deepEqual(b.route[0],{x:8,y:1});assert.deepEqual(b.route.at(-1),{x:8,y:15});const old={x:b.x,y:b.y};advance(g,2);assert.ok(Math.hypot(b.x-old.x,b.y-old.y)>0);assert.ok(b.progress<3);
  for(let i=0;i<100&&g.state==='playing';i++){advance(g,.5);assert.ok(g.bombs.length<=g.level.maxBombs);}
});
test('rolling bombs stay on legal cells through every turn',()=>{
  for(const l of LEVELS)for(const path of l.routes){const reversed=[...path].reverse();for(let p=0;p<path.length-1;p+=.07){const point=routeAt(reversed,p);assert.ok(l.grid[Math.floor(point.y)][Math.floor(point.x)]);}}
});
test('bomb contact causes one loss and freezes time; a nearby non-contact bomb is safe',()=>{
  const g=quiet(),route=[{x:8,y:15},{x:8,y:14}];g.bombs=[{id:1,index:0,route,progress:0,x:8.5,y:15.5,phase:0}];const events=g.advance(1/60);assert.ok(events.includes('lost'));const at=g.elapsed;assert.equal(g.outcome,'lost');advance(g,2);close(g.elapsed,at);assert.equal(g.state,'finished');assert.deepEqual(advance(g,1),[]);
  const safe=quiet();safe.bombs=[{id:1,index:0,route:[{x:8,y:14},{x:8,y:13}],progress:0,x:8.5,y:14.5,phase:0}];safe.advance(1/120);assert.equal(safe.state,'playing');assert.ok(BALL_RADIUS+BOMB_RADIUS<1);
});
test('a fast relative crossing is detected and a bomb at the finish wins the collision priority',()=>{
  const g=quiet();g.ball={x:8.5,y:1.65,vx:0,vy:-3};g.bombs=[{id:1,index:0,route:[{x:8,y:1},{x:8,y:2}],progress:0,x:8.5,y:1.5,phase:0}];g.advance(1/120);assert.equal(g.outcome,'lost');
});
test('successful arrival freezes the completion time before the celebration finishes',()=>{
  const g=quiet();g.setInput(0,-1);const events=advance(g,5);assert.ok(events.includes('won'));assert.equal(g.outcome,'won');const time=g.elapsed;advance(g,1);assert.equal(g.state,'finished');close(g.elapsed,time);assert.equal(g.shake({x:1,y:0}),null);
});
test('pause freezes marble, bombs, fog and elapsed time, and long suspended frames pause safely',()=>{
  const g=quiet();advance(g,9);g.pause();const snapshot=JSON.stringify(g);advance(g,100);assert.equal(JSON.stringify(g),snapshot);assert.equal(g.resume(),true);advance(g,.5);close(g.elapsed,9.5);assert.deepEqual(g.advance(20),['suspended']);assert.equal(g.state,'paused');close(g.elapsed,9.5);assert.equal(g.pause(),false);
});
test('replay and level changes clear previous hazards, impulses and outcomes',()=>{
  const g=quiet();g.shake({x:1,y:0});advance(g,10);g.end('lost');g.start(3);assert.equal(g.level.id,3);assert.equal(g.elapsed,0);assert.equal(g.bombs.length,0);assert.equal(g.pending,null);assert.equal(g.fog,0);assert.equal(g.shakes,0);assert.equal(g.shakeImpacts,0);assert.equal(g.outcome,null);g.abandon();assert.equal(g.state,'setup');assert.deepEqual(advance(g,10),[]);
});
test('both tilt axes calibrate on eight valid samples and rotate correctly in landscape',()=>{
  close(tiltAxes({beta:0,gamma:10},0).x,10);close(tiltAxes({beta:10,gamma:0},0).y,10);close(tiltAxes({beta:10,gamma:0},90).x,10);close(tiltAxes({beta:0,gamma:10},90).y,-10);assert.equal(tiltAxes({beta:null,gamma:0}),null);
  const t=new TiltSensor();[0,0,0,40,0,0,0,0].forEach((gamma,i)=>t.sample({beta:5,gamma},0,i*20));assert.equal(t.ready,true);close(t.baseline.x,0);t.sample({beta:5,gamma:12},0,200);assert.ok(t.value.x>.7);close(t.value.y,0);assert.equal(t.fresh(2000),true);assert.equal(t.fresh(2300),false);const p=projectAxes(2,3,90);close(p.x,3);close(p.y,-2);
});
function sensor(){const s=new ShakeSensor(0);for(let t=0;t<600;t+=50)s.sample({acceleration:{x:0,y:0,z:0}},0,t);return s;}
test('shake sensing rejects noise and a single spike, and requires two separate bursts with quiet rearming',()=>{
  const s=sensor(),event=(x,y=0,z=0)=>({acceleration:{x,y,z}});
  assert.equal(s.sample(event(4),0,610),null);assert.equal(s.sample(event(18),0,650),null);assert.equal(s.sample(event(0),0,700),null);
  assert.equal(s.sample(event(18),0,1000),null);const first=s.sample(event(18),0,1030);assert.ok(first.x<0);assert.equal(s.sample(event(20),0,1400),null);s.sample(event(0),0,1450);s.sample(event(0),0,1480);assert.equal(s.sample(event(-18),0,1600),null);assert.ok(s.sample(event(-18),0,1630).x>0);
});
test('gravity-inclusive readings ignore stationary gravity and support strong vertical shakes',()=>{
  const s=new ShakeSensor(0);for(let t=0;t<=600;t+=50)assert.equal(s.sample({acceleration:null,accelerationIncludingGravity:{x:0,y:0,z:9.81}},0,t),null);assert.equal(s.sample({acceleration:null,accelerationIncludingGravity:{x:0,y:0,z:27}},0,650),null);const pulse=s.sample({acceleration:null,accelerationIncludingGravity:{x:0,y:0,z:27}},0,680);assert.ok(pulse&&pulse.z>13);assert.equal(s.sample({acceleration:null,accelerationIncludingGravity:{x:null,y:0,z:9.81}},0,700),null);
});
test('each level keeps its fastest three positive times, stable ties and valid dates',()=>{
  let records=readRecords(null);for(const [seconds,at] of [[12,1],[8,2],[10,3],[8,4],[22,5]])records=addRecord(records,1,seconds,at);records=addRecord(records,2,30,6);assert.deepEqual(records[1].map(r=>[r.seconds,r.at]),[[8,2],[8,4],[10,3]]);assert.equal(records[2][0].seconds,30);assert.deepEqual(readRecords(JSON.stringify({version:1,levels:records})),records);assert.deepEqual(records[5],[]);
  assert.deepEqual(topThree([{seconds:0,at:0},{seconds:2,at:Number.MAX_SAFE_INTEGER},{seconds:4,at:0},null]),[{seconds:4,at:0}]);assert.throws(()=>addRecord(records,6,2,0));assert.throws(()=>addRecord(records,1,NaN,0));for(const raw of ['bad','null','{}'])assert.deepEqual(readRecords(raw),readRecords(null));assert.equal(formatTime(64.12),'01:04.12');
});
