import test from 'node:test';
import assert from 'node:assert/strict';
import {RoachGame,SPRAY_DELAY} from '../src/game.js';
import {readRecords,addRecord,topThree} from '../src/records.js';
function setup(){let now=0;const game=new RoachGame({random:()=>.2,now:()=>now});game.start();game.entities.clear();return {game,set:t=>{now=t;}};}
const area={x:.5,y:.5,radiusX:.2,radiusY:.15};
function place(game,type='roach',x=.5,y=.5){const e=type==='ant'?game.spawnAnt():type==='mouse'?game.spawnMouse():game.spawnRoach(0);Object.assign(e,{x,y,turnAt:Infinity,transitionAt:Infinity});return e;}
test('spray blooms first, awards one per roach and deducts three per ant in the same area',()=>{
  const {game,set}=setup(),small=place(game),big=place(game),flyer=place(game),outside=place(game,'roach',.9,.9),ant=place(game,'ant'),mouse=place(game,'mouse');
  big.size=flyer.size='big';flyer.mode='flying';const frozen=new Set(game.entities.keys());
  assert.ok(game.useSpray(area));assert.equal(game.spraysLeft,2);assert.equal(game.score,0);
  set(SPRAY_DELAY-1);assert.equal(game.advance(frozen).sprayed.length,0);assert.equal(game.entities.has(big.id),true);
  set(SPRAY_DELAY);const events=game.advance(frozen);assert.equal(events.sprayReleased,true);assert.equal(events.sprayed.length,4);
  assert.equal(events.sprayed.filter(r=>r.kind==='sprayed'&&r.points===1).length,3);assert.equal(events.sprayed.find(r=>r.id===ant.id).points,-3);
  assert.equal(game.score,0);assert.equal(game.stats.sprayed,3);assert.equal(game.stats.antsSprayed,1);for(const e of [small,big,flyer,ant])assert.equal(game.entities.has(e.id),false);
  for(const e of [outside,mouse])assert.equal(game.entities.has(e.id),true);assert.equal(game.stats.antsHit,0);assert.equal(game.tap(ant.id),null);assert.equal(game.flickAnt(ant.id,80,1),null);
  set(SPRAY_DELAY+50);assert.equal(game.advance(frozen).sprayed.length,0);assert.equal(game.score,0);
});
test('an ant-only spray deducts three each, without harming outside ants or penalizing a removed ant again',()=>{
  const {game,set}=setup(),first=place(game,'ant'),second=place(game,'ant',.6,.5),outside=place(game,'ant',.9,.9),removed=place(game,'ant');
  game.flickAnt(removed.id,80,1);game.useSpray(area);set(SPRAY_DELAY);const events=game.advance(new Set(game.entities.keys()));
  assert.equal(events.sprayed.length,2);assert.equal(game.score,-6);assert.equal(game.stats.antsSprayed,2);assert.equal(game.stats.antsHit,0);
  for(const ant of [first,second,removed])assert.equal(game.entities.has(ant.id),false);assert.equal(game.entities.has(outside.id),true);
  set(SPRAY_DELAY+100);assert.equal(game.advance(new Set([outside.id])).sprayed.length,0);assert.equal(game.score,-6);
});
test('spray uses an inclusive circular projection and invalid drops never consume the can',()=>{
  const {game,set}=setup(),edge=place(game,'roach',.7,.5),outside=place(game,'roach',.7001,.5),diagonal=place(game,'roach',.68,.63);
  for(const value of [null,{...area,x:-.1},{...area,y:1.1},{...area,radiusX:0},{...area,radiusY:NaN},{...area,radiusY:Infinity}]){assert.equal(game.useSpray(value),null);assert.equal(game.sprayUsed,false);}
  game.useSpray(area);set(SPRAY_DELAY);const events=game.advance(new Set(game.entities.keys()));assert.equal(events.sprayed.length,1);assert.equal(events.sprayed[0].id,edge.id);
  assert.equal(game.entities.has(outside.id),true);assert.equal(game.entities.has(diagonal.id),true);
});
test('an empty valid spray is consumed; replay clears the cloud and restores three cans',()=>{
  const {game,set}=setup();game.useSpray(area);set(SPRAY_DELAY);const events=game.advance();assert.equal(events.sprayReleased,true);assert.equal(events.sprayed.length,0);assert.equal(game.spraysLeft,2);
  game.start();assert.equal(game.sprayUsed,false);assert.equal(game.sprayCloud,null);assert.equal(game.stats.sprayed,0);for(let i=0;i<3;i++)assert.ok(game.useSpray(area));assert.equal(game.useSpray(area),null);assert.equal(game.spraysLeft,0);
});
test('the absolute deadline precedes gas damage, and late attempts cannot consume a new can or add points',()=>{
  const {game,set}=setup();place(game);set(120000-100);place(game,'ant');game.useSpray(area);set(120000);
  const events=game.advance();assert.equal(events.finished,true);assert.equal(events.sprayed.length,0);assert.equal(game.score,0);assert.equal(game.stats.sprayed,0);
  game.start();set(240000);assert.equal(game.useSpray(area),null);assert.equal(game.sprayUsed,false);assert.equal(game.score,0);
});
test('top-three records keep separate two- and three-minute rounds, including negative and tied scores',()=>{
  let records={60:[],120:[],180:[]};for(const [i,score] of [-3,8,4,12,12,2].entries())records=addRecord(records,120,score,i+1);
  records=addRecord(records,180,-3,10);assert.deepEqual(records[120].map(r=>r.score),[12,12,8]);assert.deepEqual(records[180],[{score:-3,at:10}]);
  assert.deepEqual(readRecords(JSON.stringify({version:3,modes:records})),records);assert.equal(topThree([{score:-3,at:1}])[0].score,-3);
});
test('earlier two-minute records migrate without mixing one-minute history into the new modes',()=>{
  const records=readRecords(null,JSON.stringify({60:18,120:-1}));assert.deepEqual(records,{60:[{score:18,at:0}],120:[{score:-1,at:0}],180:[]});
  const old={version:2,modes:{60:[{score:18,at:0}],120:[{score:10,at:2}]}};
  assert.deepEqual(readRecords(null,null,JSON.stringify(old)),{60:[{score:18,at:0}],120:[{score:10,at:2}],180:[]});
  const updated=addRecord(records,180,8,100);assert.deepEqual(readRecords(JSON.stringify({version:3,modes:updated}),null,JSON.stringify(old)),updated);
});
test('corrupt records and invalid scores are ignored while valid entries remain usable',()=>{
  assert.deepEqual(readRecords('broken','broken'),{60:[],120:[],180:[]});
  const rows=[null,{}, {score:Infinity,at:1},{score:4.5,at:1},{score:5,at:-1},{score:7,at:2}];
  assert.deepEqual(topThree(rows),[{score:7,at:2}]);assert.throws(()=>addRecord({120:[],180:[]},60,3,1));assert.throws(()=>addRecord({120:[],180:[]},120,NaN,1));
});
