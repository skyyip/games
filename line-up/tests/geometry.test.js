import test from 'node:test';
import assert from 'node:assert/strict';
import { measureLine, pointAt, projectPoint, createLine, SHAPES } from '../src/geometry.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('projection and sampling measure actual arc length, including vertical bends', () => {
  const straight=measureLine([{x:0,y:0},{x:100,y:0}]);
  near(straight.total,100);near(projectPoint(straight,{x:25,y:20}),.25);
  assert.deepEqual(pointAt(straight,.4),{x:40,y:0});
  near(projectPoint(straight,{x:-50,y:0}),0);near(projectPoint(straight,{x:180,y:0}),1);
  const bend=measureLine([{x:0,y:0},{x:100,y:0},{x:100,y:100}]);
  near(bend.total,200);near(projectPoint(bend,{x:100,y:50}),.75);
  assert.deepEqual(pointAt(bend,.5),{x:100,y:0});
  near(projectPoint(bend,{x:50,y:0}),.25);
  // The segment runs 50 units horizontally and 50 vertically: half of the path.
  near(projectPoint(bend,{x:100,y:50})-projectPoint(bend,{x:50,y:0}),.5);
});

test('all four generated shapes stay in bounds and project consistently at any screen scale', () => {
  for(const kind of SHAPES)for(const random of [0,.2,.5,.999999]){
    const line=createLine(kind,()=>random);
    assert.equal(line.kind,kind);assert.ok(line.total>0);assert.ok(line.d.startsWith('M'));
    assert.ok(line.points.every(p=>p.x>=80&&p.x<=920&&p.y>=70&&p.y<=350));
    for(const fraction of [0,.1,.25,.5,.75,.9,1])near(projectPoint(line,pointAt(line,fraction)),fraction);
    const scaled=measureLine(line.points.map(p=>({x:p.x*3,y:p.y*3})));
    near(projectPoint(scaled,{x:pointAt(line,.37).x*3,y:pointAt(line,.37).y*3}),.37);
  }
  assert.throws(()=>createLine('circle'));assert.throws(()=>measureLine([{x:0,y:0},{x:0,y:0}]));
});

test('a highlighted section follows the original path between the two endpoints', async () => {
  const { segmentPath }=await import('../src/geometry.js');
  const bend=measureLine([{x:0,y:0},{x:100,y:0},{x:100,y:100}]);
  assert.equal(segmentPath(bend,.25,.75),'M50,0 L100,0 L100,50');
  assert.equal(segmentPath(bend,.75,.25),'M50,0 L100,0 L100,50');
  assert.equal(segmentPath(bend,.5,.5),'');
});
