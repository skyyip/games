// Pointer geometry is independent of scoring and supports mouse, pen and touch.
const clamp=value=>Math.max(0,Math.min(1,value));
export function beginStroke(x,y,time=0){return {x,y,time,lastX:x,lastY:y,length:0,points:[{x,y}],consumed:false};}
export function moveStroke(stroke,x,y){
 const travel=Math.hypot(x-stroke.lastX,y-stroke.lastY);if(travel<2)return;
 stroke.length+=travel;stroke.lastX=x;stroke.lastY=y;stroke.points.push({x,y});
 // Keep endpoints and the shape while bounding long pointer sessions.
 if(stroke.points.length>160)stroke.points=stroke.points.filter((_,i)=>i%2===0||i===stroke.points.length-1);
}
export function strokeShape(stroke){
 const points=stroke.points,xs=points.map(p=>p.x),ys=points.map(p=>p.y),width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
 const horizontal=width>=height;let direction=0,extreme=horizontal?points[0].x:points[0].y,reversals=0;
 for(const p of points){const value=horizontal?p.x:p.y,delta=value-extreme;if(!direction){if(Math.abs(delta)>=18){direction=Math.sign(delta);extreme=value;}}else if(delta*direction>0)extreme=value;else if(delta*direction<=-18){reversals++;direction=-direction;extreme=value;}}
 const cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2;
 let winding=0,rotation=0;for(let i=1;i<points.length;i++){let delta=Math.atan2(points[i].y-cy,points[i].x-cx)-Math.atan2(points[i-1].y-cy,points[i-1].x-cx);if(delta>Math.PI)delta-=2*Math.PI;if(delta< -Math.PI)delta+=2*Math.PI;winding+=delta;rotation+=Math.abs(delta);}
 const distance=Math.hypot(stroke.lastX-stroke.x,stroke.lastY-stroke.y),round=Math.min(width,height)>=40&&Math.max(width,height)/Math.min(width,height)<=2.2&&points.length>=12&&Math.abs(winding)/Math.max(.01,rotation)>=.85;
 const circle=round?clamp(Math.abs(winding)/(Math.PI*1.7)):0;
 const rub=Math.min(width,height)<=Math.max(width,height)*.75?Math.min(clamp(reversals/3),clamp(stroke.length/120)):0;
 if(circle>=1&&stroke.length>=140&&distance<=Math.max(width,height)*.55)return {gesture:'circle',progress:1};
 if(rub>=1)return {gesture:'rub',progress:1};
 return circle>.25?{gesture:'circle',progress:circle}:{gesture:'rub',progress:rub};
}
export function finishStroke(stroke,time){
 const shape=strokeShape(stroke);if(shape.progress>=1)return {gesture:shape.gesture,strength:clamp(stroke.length/Math.max(100,time-stroke.time)/2+stroke.length/700)};
 const distance=Math.hypot(stroke.lastX-stroke.x,stroke.lastY-stroke.y);
 if(distance>=60)return {gesture:'heavy',strength:clamp(distance/230+distance/Math.max(40,time-stroke.time)/3)};
 if(distance<=24&&stroke.length<45)return {gesture:'tap'};
 return null;
}
export function pinchProgress(initial,current){return initial>=56?clamp((initial-current)/Math.max(28,initial*.32)):0;}
