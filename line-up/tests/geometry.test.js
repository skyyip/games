import test from 'node:test';
import assert from 'node:assert/strict';
import { measureLine, pointAt, projectPoint, createLine, segmentPath, selectionFraction, SHAPES } from '../src/geometry.js';

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

test('all generated shapes stay in bounds and project consistently at any screen scale', () => {
  for(const kind of SHAPES)for(const random of [0,.2,.5,.999999]){
    const line=createLine(kind,()=>random);
    assert.equal(line.kind,kind);assert.ok(line.total>0);assert.ok(line.d.startsWith('M'));
    assert.ok(line.points.every(p=>p.x>=70&&p.x<=line.width-70&&p.y>=70&&p.y<=line.height-70));
    for(const fraction of [0,.1,.25,.5,.75,.9,1]) {
      const actual=projectPoint(line,pointAt(line,fraction));
      near(line.closed&&fraction===1?Math.min(actual,1-actual):actual,line.closed&&fraction===1?0:fraction);
    }
    const scaled=measureLine(line.points.map(p=>({x:p.x*3,y:p.y*3})));
    near(projectPoint(scaled,{x:pointAt(line,.37).x*3,y:pointAt(line,.37).y*3}),.37);
  }
  assert.throws(()=>createLine('unknown'));assert.throws(()=>measureLine([{x:0,y:0},{x:0,y:0}]));
});

test('a highlighted section follows the original path between the two endpoints', async () => {
  const { segmentPath }=await import('../src/geometry.js');
  const bend=measureLine([{x:0,y:0},{x:100,y:0},{x:100,y:100}]);
  assert.equal(segmentPath(bend,.25,.75),'M50,0 L100,0 L100,50');
  assert.equal(segmentPath(bend,.75,.25),'M50,0 L100,0 L100,50');
  assert.equal(segmentPath(bend,.5,.5),'');
});

test('circle, square, rectangle, triangle, oval and irregular outlines are closed and keep their proportions', () => {
  for(const kind of ['circle','square','rectangle','triangle','oval','irregular']) {
    const shape=createLine(kind,()=>.5);
    assert.equal(shape.closed,true);
    assert.deepEqual(shape.points[0],shape.points.at(-1));
    assert.ok(shape.points.every(p=>p.x>=70&&p.x<=630&&p.y>=70&&p.y<=630));
    const xs=shape.points.map(p=>p.x),ys=shape.points.map(p=>p.y);
    const width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
    if(['circle','square'].includes(kind))near(width,height);
    if(['rectangle','oval'].includes(kind))assert.ok(width>height);
  }
  near(createLine('square',()=>.5).total,1920);
  near(createLine('rectangle',()=>.5).total,1760);
  assert.ok(Math.abs(createLine('circle',()=>.5).total-2*Math.PI*245)<.1);
  assert.notEqual(createLine('irregular',()=>.1).d,createLine('irregular',()=>.8).d);
});

test('either arc of a closed shape can be selected, including across the seam and the full outline', () => {
  const square=createLine('square');
  near(selectionFraction(square,.1,.9),.8);
  near(selectionFraction(square,.1,.9,true),.2);
  assert.equal(segmentPath(square,.25,.75,true),'M110,590 L110,110 L590,110');
  assert.equal(segmentPath(square,.75,.25,true),segmentPath(square,.25,.75,true));
  near(selectionFraction(square,.4,.4,true),1);
  near(selectionFraction(square,0,1),1);
  near(selectionFraction(square,0,1,true),0);
  assert.equal(segmentPath(square,0,1,true),'');
  assert.ok(segmentPath(square,.4,.4,true).length>0);
  const line=createLine('straight');
  near(selectionFraction(line,.1,.9,true),.8);
  assert.equal(segmentPath(line,.1,.9,true),segmentPath(line,.1,.9));
});

test('new polygon and concave outlines preserve measured lengths on both sides of the closing join', () => {
  for(const kind of ['rhombus','trapezoid','parallelogram','pentagon','hexagon','octagon','heart','star','crescent']) {
    assert.ok(SHAPES.includes(kind));
    const line=createLine(kind,()=>.5);
    assert.equal(line.closed,true);
    assert.deepEqual(line.points[0],line.points.at(-1));
    for(const otherSide of [false,true]) {
      const points=[...segmentPath(line,.12,.75,otherSide).matchAll(/[ML]([^, ]+),([^ ]+)/g)]
        .map(([,x,y])=>({x:Number(x),y:Number(y)}));
      near(measureLine(points).total/line.total,otherSide?.37:.63);
    }
    near(selectionFraction(line,.4,.4,true),1);
    near(selectionFraction(line,0,1,true),0);
  }
});
