const point=value=>Array.isArray(value)?{x:value[0],y:value[1]}:value;
const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-.15&&p.x<=1.15&&p.y>=-.15&&p.y<=1.15;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Downsample the whole path instead of freezing its first 95 points.
export function appendKitSample(samples,sample){
 const next=samples.length<96?samples:samples.filter((_,i)=>i%2===0||i===samples.length-1);
 next.push(sample);return next;
}
export function currentKitStep(spec,state){const step=spec.steps?.[state.progress];return step?.random?{...step,target:(state.extra.seed+state.progress)%3}:step;}
export function kitAimTarget(state,elapsed){const t=elapsed-state.extra.stepAt;return {x:.5+.13*Math.sin(t/550),y:.42+.07*Math.cos(t/750)};}
export function kitBeatCue(step,state,elapsed){const t=elapsed-state.extra.stepAt,period=step.period||700,index=Math.max(1,Math.round(t/period));return Math.abs(t-index*period)<=220;}
export function beginExpanded(state,elapsed,attempt){state.extra={stepAt:elapsed,checked:elapsed,seed:(Math.floor(elapsed)*17+attempt*7)%3,pointerAt:null,origin:null,held:false,aimMs:0,aimX:.5,aimY:.45,assist:false,lastTap:-Infinity,pinchStart:null};}
export function cancelExpanded(state){if(!state?.extra)return;Object.assign(state.extra,{pointerAt:null,origin:null,held:false,aimMs:0,assist:false,pinchStart:null});}
export function advanceExpanded(spec,state,elapsed){
 const e=state.extra,step=currentKitStep(spec,state);if(!e||!step)return;
 if(step.type==='aim'&&e.held){for(let t=e.checked;t<elapsed;){const next=Math.min(elapsed,t+40),target=kitAimTarget(state,(t+next)/2),inside=e.assist||distance({x:e.aimX,y:e.aimY},target)<=.17;e.aimMs=inside?Math.min(step.ms,e.aimMs+next-t):0;t=next;}}
 e.checked=elapsed;
}
function strokeMatches(step,points){
 if(!Array.isArray(points)||points.length<2||points.length>128)return false;
 const p=points.map(point);if(!p.every(valid))return false;const start=p[0],end=p[p.length-1],dx=end.x-start.x,dy=end.y-start.y;
 if(step.type==='swipe')return step.direction==='left'?dx<=-.28&&Math.abs(dy)<.35:step.direction==='right'?dx>=.28&&Math.abs(dy)<.35:step.direction==='up'?dy<=-.28&&Math.abs(dx)<.35:dy>=.28&&Math.abs(dx)<.35;
 if(step.type==='drag')return distance(start,point(step.from))<=.17&&distance(end,point(step.to))<=.17&&distance(start,end)>.18;
 if(step.type==='trace'){let next=0;for(const sample of p)if(next<step.path.length&&distance(sample,point(step.path[next]))<=.17)next++;return next===step.path.length;}
 if(step.type==='circle'){const center={x:.5,y:.45};if(p.some(sample=>distance(sample,center)<.12))return false;let total=0;for(let i=1;i<p.length;i++){let angle=Math.atan2(p[i].y-center.y,p[i].x-center.x)-Math.atan2(p[i-1].y-center.y,p[i-1].x-center.x);while(angle>Math.PI)angle-=Math.PI*2;while(angle< -Math.PI)angle+=Math.PI*2;total+=angle;}return step.direction==='ccw'?total<=-5.2:total>=5.2;}
 if(step.type==='rub'){let dir=0,extreme=p[0].x,reversals=0,min=extreme,max=extreme;for(const sample of p.slice(1)){min=Math.min(min,sample.x);max=Math.max(max,sample.x);const delta=sample.x-extreme;if(!dir&&Math.abs(delta)>=.08){dir=Math.sign(delta);extreme=sample.x;}else if(dir&&dir*delta>=0)extreme=sample.x;else if(Math.abs(delta)>=.12){reversals++;dir=-dir;extreme=sample.x;}}return reversals>=step.need&&max-min>=.3;}
 return false;
}
export function actExpanded(spec,state,type,input,elapsed){
 const e=state.extra,step=currentKitStep(spec,state);if(!e||!step)return {ok:false,won:false};let ok=false;
 if(type==='gesture-begin'&&valid(input)&&!['tap','beat','pinch'].includes(step.type)){
  Object.assign(e,{pointerAt:elapsed,origin:{x:input.x,y:input.y},held:true,aimMs:0,aimX:input.x,aimY:input.y,assist:step.type==='aim'&&input.assist===true});return {ok:true,won:false};
 }
 if(type==='gesture-move'&&e.held&&valid(input)){e.aimX=input.x;e.aimY=input.y;return {ok:true,won:false};}
 if(type==='pinch-start'&&step.type==='pinch'&&Number.isFinite(input.distance)&&input.distance>=.35&&input.distance<=1.2){e.pinchStart=input.distance;e.pointerAt=elapsed;return {ok:true,won:false};}
 if(type==='pinch'&&step.type==='pinch'&&e.pinchStart!==null&&Number.isFinite(input.distance)){ok=e.pinchStart-input.distance>=.18&&input.distance>=.12&&input.distance<=.42;e.pinchStart=null;e.pointerAt=null;}
 if(type==='gesture-stroke'&&e.pointerAt!==null&&Array.isArray(input.points)){const origin=point(input.points[0]);ok=valid(origin)&&e.origin&&distance(origin,e.origin)<=.08&&strokeMatches(step,input.points);e.pointerAt=null;e.held=false;}
 if(type==='gesture-release'&&e.held){ok=step.type==='hold'?elapsed-e.pointerAt>=step.ms:step.type==='aim'&&e.aimMs>=step.ms;e.held=false;e.pointerAt=null;e.aimMs=0;}
 if(type==='choice'&&['tap','beat'].includes(step.type)&&Number.isInteger(input.index)&&elapsed-e.lastTap>=100){e.lastTap=elapsed;ok=input.index===step.target&&(step.type!=='beat'||kitBeatCue(step,state,elapsed));}
 if(ok){state.progress++;e.stepAt=e.checked=elapsed;cancelExpanded(state);}
 return {ok,won:ok&&state.progress===spec.steps.length};
}
// Equivalent single-pointer controls submit the same validated gesture shape.
export function assistedKitStroke(step){
 if(step.type==='drag')return step.from&&step.to?[step.from,step.to]:[];
 if(step.type==='trace')return step.path;
 if(step.type==='circle')return Array.from({length:25},(_,i)=>{const angle=(step.direction==='ccw'?-1:1)*i/24*Math.PI*2;return [.5+Math.cos(angle)*.28,.45+Math.sin(angle)*.28];});
 if(step.type==='rub')return Array.from({length:step.need+2},(_,i)=>[i%2?.78:.22,.45]);
 return step.direction==='left'?[[.8,.45],[.2,.45]]:step.direction==='right'?[[.2,.45],[.8,.45]]:step.direction==='up'?[[.5,.8],[.5,.2]]:[[.5,.2],[.5,.8]];
}
