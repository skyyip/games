import test from 'node:test';
import assert from 'node:assert/strict';
import {createShape,scoreDrawing} from '../src/shapes.js';
import {MemoryGame} from '../src/game.js';
const shape=createShape(()=>.3),copy=()=>structuredClone(shape.points);
test('all random shape families remain closed and inside the board',()=>{
  const fingerprints=new Set();for(let kind=0;kind<8;kind++)for(const r of [0,.5,.999]){let first=true;const s=createShape(()=>{if(first){first=false;return (kind+.1)/8;}return r;});assert.deepEqual(s.points[0],s.points.at(-1));assert.ok(s.points.every(p=>p.x>.02&&p.x<.98&&p.y>.02&&p.y<.98));fingerprints.add(JSON.stringify(s.points));}assert.equal(fingerprints.size,24);
});
test('an exact outline gets 100%, reverse drawing order and sampling density do not matter',()=>{
  assert.equal(scoreDrawing(shape.points,[copy()]).percent,100);assert.equal(scoreDrawing(shape.points,[copy().reverse()]).percent,100);
  const dense=copy().flatMap((p,i,a)=>i<a.length-1?[p,{x:(p.x+a[i+1].x)/2,y:(p.y+a[i+1].y)/2}]:[p]);assert.equal(scoreDrawing(shape.points,[dense]).percent,100);
});
test('small finger wobble has tolerance but position and size errors reduce overlap',()=>{
  const close=copy().map(p=>({x:p.x+.003,y:p.y-.003})),shift=copy().map(p=>({x:p.x+.16,y:p.y})),small=copy().map(p=>({x:.5+(p.x-.5)*.6,y:.5+(p.y-.5)*.6}));
  assert.ok(scoreDrawing(shape.points,[close]).percent>98);assert.ok(scoreDrawing(shape.points,[shift]).percent<40);assert.ok(scoreDrawing(shape.points,[small]).percent<40);
});
test('partial outlines and extra scribbles are penalised; duplicating a correct stroke does not inflate points',()=>{
  const full=scoreDrawing(shape.points,[copy()]),partial=scoreDrawing(shape.points,[copy().slice(0,40)]),scribble=Array.from({length:45},(_,i)=>({x:i%2?.95:.05,y:.05+i/50}));
  assert.ok(partial.percent>0&&partial.percent<60);assert.ok(scoreDrawing(shape.points,[copy(),scribble]).percent<full.percent-20);assert.equal(scoreDrawing(shape.points,[copy(),copy()]).percent,100);
});
test('empty, malformed or out-of-bounds ink cannot earn overlap',()=>{
  for(const strokes of [[],null,[[{x:NaN,y:.5}]],[[{x:2,y:.5}]],Array(65).fill([{x:.5,y:.5}])])assert.equal(scoreDrawing(shape.points,strokes).percent,0);
});
test('a turn displays exactly three seconds and cannot submit before the drawing phase',()=>{
  let now=100;const game=new MemoryGame({now:()=>now,random:()=>.3});game.start(['A','B']);const original=JSON.stringify(game.shape);
  assert.equal(game.state,'handoff');assert.equal(game.submit([copy()]),false);assert.equal(game.view(),true);assert.equal(game.view(),false);
  now=3099;assert.equal(game.remaining,1);assert.equal(game.advance(),false);now=3100;assert.equal(game.advance(),true);assert.equal(game.state,'drawing');assert.equal(game.advance(),false);
  assert.equal(JSON.stringify(game.shape),original);assert.deepEqual(game.results,[]);
});
test('players see the same shape, answers stay hidden until all turns finish, ties share a win',()=>{
  let now=0;const game=new MemoryGame({now:()=>now,random:()=>.3});game.start(['A','B']);const points=structuredClone(game.shape.points);
  for(let i=0;i<2;i++){game.view();now+=3000;game.advance();assert.equal(game.submit([points]),true);assert.equal(game.submit([points]),false);assert.deepEqual(game.results,[]);assert.equal(game.next(),true);}
  assert.equal(game.state,'results');assert.equal(game.winners.length,2);assert.ok(game.results.every(r=>r.percent===100));assert.equal(game.view(),false);assert.equal(game.next(),false);
});
test('interruption hides a preview permanently for that turn; answer snapshots cannot be changed after submission',()=>{
  const game=new MemoryGame({random:()=>.3});game.start(['A','B']);game.view();assert.equal(game.hide(),true);assert.equal(game.hide(),false);assert.equal(game.view(),false);
  const drawing=[structuredClone(game.shape.points)];game.submit(drawing);drawing[0][0].x=0;assert.notEqual(game.answers[0].drawing[0][0].x,0);
});
test('blank drawings cannot submit and invalid player counts are rejected',()=>{
  const game=new MemoryGame();for(const players of [[],['A'],Array(7).fill('A'),['A',2]])assert.throws(()=>game.start(players),TypeError);
  game.start(['  ','<script>']);game.view();game.hide();for(const ink of [[],[[{x:.5,y:.5}]],[[{x:Infinity,y:.5}]]])assert.equal(game.submit(ink),false);assert.equal(game.players[1],'<script>');
});
