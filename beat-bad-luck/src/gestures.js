// Pointer geometry is independent of scoring and supports mouse, pen and touch.
const clamp=value=>Math.max(0,Math.min(1,value));
export const HOLD_MS=700,HOLD_DRIFT=14;
export function beginStroke(x,y,time=0){return {x,y,time,lastX:x,lastY:y,length:0,maxDrift:0,points:[{x,y}],consumed:false};}
export function moveStroke(stroke,x,y){
 stroke.maxDrift=Math.max(stroke.maxDrift,Math.hypot(x-stroke.x,y-stroke.y));
 const travel=Math.hypot(x-stroke.lastX,y-stroke.lastY);if(travel<2)return;
 stroke.length+=travel;stroke.lastX=x;stroke.lastY=y;stroke.points.push({x,y});
 // Keep endpoints and the shape while bounding long pointer sessions.
 if(stroke.points.length>160)stroke.points=stroke.points.filter((_,i)=>i%2===0||i===stroke.points.length-1);
}
export function strokeShape(stroke){
 const points=stroke.points,xs=points.map(p=>p.x),ys=points.map(p=>p.y),width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
 const angular=angularShape(points,width,height);if(angular)return angular;
 const horizontal=width>=height;let direction=0,extreme=horizontal?points[0].x:points[0].y,reversals=0;
 for(const p of points){const value=horizontal?p.x:p.y,delta=value-extreme;if(!direction){if(Math.abs(delta)>=18){direction=Math.sign(delta);extreme=value;}}else if(delta*direction>0)extreme=value;else if(delta*direction<=-18){reversals++;direction=-direction;extreme=value;}}
 const cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2;
 let winding=0,rotation=0;for(let i=1;i<points.length;i++){let delta=Math.atan2(points[i].y-cy,points[i].x-cx)-Math.atan2(points[i-1].y-cy,points[i-1].x-cx);if(delta>Math.PI)delta-=2*Math.PI;if(delta< -Math.PI)delta+=2*Math.PI;winding+=delta;rotation+=Math.abs(delta);}
 const distance=Math.hypot(stroke.lastX-stroke.x,stroke.lastY-stroke.y),round=Math.min(width,height)>=40&&Math.max(width,height)/Math.min(width,height)<=2.2&&points.length>=12&&Math.abs(winding)/Math.max(.01,rotation)>=.85;
 const circle=round?clamp(Math.abs(winding)/(Math.PI*1.7)):0;
 const rub=Math.min(width,height)<=Math.max(width,height)*.75?Math.min(clamp(reversals/3),clamp(stroke.length/120)):0;
 const turn=winding>=0?'cw':'ccw';
 if(circle>=1&&stroke.length>=140&&distance<=Math.max(width,height)*.55)return {gesture:'circle',direction:turn,progress:1};
 if(rub>=1)return {gesture:'rub',progress:1};
 return circle>.25?{gesture:'circle',direction:turn,progress:circle}:{gesture:'rub',progress:rub};
}
export function holdProgress(stroke,time){return !stroke.holdBlocked&&stroke.maxDrift<=HOLD_DRIFT?clamp((time-stroke.time)/HOLD_MS):0;}
export function finishStroke(stroke,time){
 const shape=strokeShape(stroke);if(shape.progress>=1)return {gesture:shape.gesture,...(shape.gesture==='circle'?{direction:shape.direction}:{}),strength:clamp(stroke.length/Math.max(100,time-stroke.time)/2+stroke.length/700)};
 if(holdProgress(stroke,time)>=1)return {gesture:'hold',strength:clamp(.35+(time-stroke.time-HOLD_MS)/900)};
 const distance=Math.hypot(stroke.lastX-stroke.x,stroke.lastY-stroke.y);
 if(distance>=60)return {gesture:'heavy',strength:clamp(distance/230+distance/Math.max(40,time-stroke.time)/3)};
 if(distance<=24&&stroke.length<45&&time-stroke.time<HOLD_MS)return {gesture:'tap'};
 return null;
}
export function pinchProgress(initial,current){return initial>=56?clamp((initial-current)/Math.max(28,initial*.32)):0;}
export function spreadProgress(initial,current){return initial>=40?clamp((current-initial)/Math.max(32,initial*.38)):0;}
// Two crossing diagonals form X; the first slash remains an ordinary swipe.
export function diagonal(stroke){const dx=stroke.lastX-stroke.x,dy=stroke.lastY-stroke.y,d=Math.hypot(dx,dy);return d>=65&&Math.min(Math.abs(dx),Math.abs(dy))/Math.max(Math.abs(dx),Math.abs(dy))>=.4&&stroke.length<=d*1.25?{a:{x:stroke.x,y:stroke.y},b:{x:stroke.lastX,y:stroke.lastY}}:null;}
export function crossingStrokes(a,b){if(!a||!b)return false;const rx=a.b.x-a.a.x,ry=a.b.y-a.a.y,sx=b.b.x-b.a.x,sy=b.b.y-b.a.y,cross=rx*sy-ry*sx;if(Math.abs(cross)<1200)return false;const qx=b.a.x-a.a.x,qy=b.a.y-a.a.y,t=(qx*sy-qy*sx)/cross,u=(qx*ry-qy*rx)/cross;return t>.15&&t<.85&&u>.15&&u<.85;}
function angularShape(points,width,height){if(width<45||height<40||points.length<3)return null;const first=points[0],last=points.at(-1),bottom=points.reduce((a,b)=>b.y>a.y?b:a),sign=Math.sign(last.x-first.x);if(Math.abs(last.x-first.x)<width*.75||Math.abs(first.y-last.y)>height*.4||bottom.y-Math.max(first.y,last.y)<height*.75||sign*(bottom.x-first.x)<width*.2||sign*(last.x-bottom.x)<width*.2)return null;const i=points.indexOf(bottom);if(i<1||i===points.length-1)return null;const path=points.reduce((n,p,j)=>j?n+Math.hypot(p.x-points[j-1].x,p.y-points[j-1].y):0,0),direct=Math.hypot(bottom.x-first.x,bottom.y-first.y)+Math.hypot(last.x-bottom.x,last.y-bottom.y);return path<=direct*1.06?{gesture:'vee',progress:1}:null;}
