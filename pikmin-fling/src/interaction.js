import {FLOWER_HOLD,CHAIN_HOLD,ROUND_COUNT} from './game.js';
import { BASE_TYPES } from './characters.js';
export { TYPES, TYPE_NAMES } from './characters.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function createRoster(width,height,random=Math.random,unitHeight=58) {
  // Compact fields may use the full target size without the preferred 2px gap.
  const availableRows=Math.max(1,Math.floor(height/unitHeight));
  const columns=Math.max(1,Math.min(Math.floor(width/44),Math.max(width>=500?6:5,Math.ceil(ROUND_COUNT/availableRows))));
  const rows=Math.ceil(ROUND_COUNT/columns);
  return Array.from({length:ROUND_COUNT},(_,id)=>{
    const angle=random()*Math.PI*2,speed=18+random()*6;
    return {id,type:BASE_TYPES[Math.floor(random()*BASE_TYPES.length)],x:(id%columns+.5)*width/columns,
      y:(Math.floor(id/columns)+.5)*height/rows,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      targetVx:Math.cos(angle)*speed,targetVy:Math.sin(angle)*speed,turn:4+random()*4,gait:random()*Math.PI*2};
  });
}

export function walkRoster(roster,dt,width,height,frozen=new Set(),random=Math.random,unitHeight=58) {
  dt=Math.min(.04,Math.max(0,dt));
  if(dt===0)return;
  const halfHeight=unitHeight/2;
  for(const p of roster) {
    if(frozen.has(p.id))continue;
    const previousX=p.x,previousY=p.y;
    p.targetVx??=p.vx;p.targetVy??=p.vy;
    p.turn-=dt;
    if(p.turn<=0){const angle=random()*Math.PI*2,speed=18+random()*6;p.targetVx=Math.cos(angle)*speed;p.targetVy=Math.sin(angle)*speed;p.turn=4+random()*4;}
    // Turn away before reaching a fence; inertia softens changes in direction.
    if(p.x<36&&p.targetVx<0)p.targetVx=Math.abs(p.targetVx);
    if(p.x>width-36&&p.targetVx>0)p.targetVx=-Math.abs(p.targetVx);
    if(p.y<halfHeight+14&&p.targetVy<0)p.targetVy=Math.abs(p.targetVy);
    if(p.y>height-halfHeight-14&&p.targetVy>0)p.targetVy=-Math.abs(p.targetVy);
    const steering=1-Math.exp(-dt/.32);
    p.vx+=(p.targetVx-p.vx)*steering;p.vy+=(p.targetVy-p.vy)*steering;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.x<22||p.x>width-22){const direction=p.x<22?1:-1;p.vx=direction*Math.abs(p.vx)*.3;p.targetVx=direction*Math.abs(p.targetVx);}
    if(p.y<halfHeight||p.y>height-halfHeight){const direction=p.y<halfHeight?1:-1;p.vy=direction*Math.abs(p.vy)*.3;p.targetVy=direction*Math.abs(p.targetVy);}
    p.x=clamp(p.x,22,width-22);p.y=clamp(p.y,halfHeight,height-halfHeight);
    p.gait=(p.gait??0)+Math.hypot(p.x-previousX,p.y-previousY)*Math.PI*2/(unitHeight*.28);
  }
  // Soft separation keeps the full touch targets reachable in the small garden.
  for(let i=0;i<roster.length;i++)for(let j=i+1;j<roster.length;j++) {
    const a=roster[i],b=roster[j],dx=b.x-a.x,dy=b.y-a.y;
    const overlapX=46-Math.abs(dx),overlapY=unitHeight+2-Math.abs(dy);
    if(overlapX<=0||overlapY<=0)continue;
    const axis=overlapX<overlapY?'x':'y',delta=axis==='x'?dx:dy,amount=Math.min(overlapX,overlapY)*(1-Math.exp(-dt*14));
    const am=frozen.has(a.id)?0:frozen.has(b.id)?1:.5,bm=frozen.has(b.id)?0:frozen.has(a.id)?1:.5;
    const sign=delta<0?-1:1;
    a[axis]-=sign*amount*am;b[axis]+=sign*amount*bm;
    for(const p of [a,b])if(!frozen.has(p.id)){p.x=clamp(p.x,22,width-22);p.y=clamp(p.y,halfHeight,height-halfHeight);p.turn=Math.min(p.turn,.5);}
  }
}

// A foot supports the body for half a cycle, then lifts and returns forward.
// Compensate leg rotation so supporting feet stay level instead of bobbing.
export function walkingPose(phase,vx,vy,moving=true,threeLegs=false){
  const speed=Math.hypot(vx,vy),strength=moving?Math.min(1,speed/18):0;
  const directionX=speed?vx/speed:0,directionY=speed?vy/speed:0;
  const offsets=threeLegs?[0,4*Math.PI/3,2*Math.PI/3]:[0,Math.PI];
  const feet=offsets.map((offset,index)=>{
    const t=((phase+offset)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    const supporting=t<Math.PI,progress=supporting?t/Math.PI:(t-Math.PI)/Math.PI;
    const forward=supporting?1-2*progress:-Math.cos(progress*Math.PI);
    const lift=supporting?0:Math.sin(progress*Math.PI)*3.2*strength;
    const angle=forward*14*strength,radians=angle*Math.PI/180;
    const footX=index===0?-2:index===1?2:0,footY=index===2?12:9;
    const dx=forward*5*directionX*strength,dy=forward*2*directionY*strength-lift;
    return {angle,lift,supporting,dx,dy,
      x:dx-(footX*Math.cos(radians)-footY*Math.sin(radians)-footX),
      y:dy-(footX*Math.sin(radians)+footY*Math.cos(radians)-footY)};
  });
  return {feet,bob:-Math.abs(Math.sin(phase*(threeLegs?1.5:1)))*.65*strength,sway:Math.sin(phase)*.35*strength};
}

export function isUpwardSwipe(from,to) {
  const up=from.y-to.y,side=Math.abs(to.x-from.x),duration=Math.max(1,to.t-from.t);
  return up>=14 && up>=side*.65 && (up>=24 || up/duration>=.18);
}

export class PointerGesture {
  constructor(id,growth,from,type='red') {
    this.ids=[id];this.growth=growth;this.type=type;this.from=from;this.last=from;this.samples=[from];
    this.held=0;this.moved=false;this.chaining=false;
  }
  get charged(){return this.held>=FLOWER_HOLD;}
  // The flower ring tracks its solo charge; every chain arms after a short press.
  get holdTarget(){return this.growth==='flower'?FLOWER_HOLD:CHAIN_HOLD;}
  update(now) {
    if(!this.moved){
      this.held=Math.max(this.held,now-this.from.t);
      if(this.held>=CHAIN_HOLD)this.chaining=true;
      // Keep a recent stationary anchor so the first move after a long hold is recognised.
      this.samples=[{...this.last,t:now}];
    }
  }
  move(point) {
    this.update(point.t);
    if(Math.hypot(point.x-this.from.x,point.y-this.from.y)>10)this.moved=true;
    // A fresh flick after a pause starts at the last stationary finger position.
    if(point.t-this.last.t>180)this.samples=[{...this.last,t:point.t}];
    this.last=point;this.samples.push(point);
    this.samples=this.samples.filter(p=>point.t-p.t<=180);
  }
  add(id,growth,type='red') {
    if(!this.chaining||growth!==this.growth||type!==this.type||this.ids.includes(id))return false;
    this.ids.push(id);return true;
  }
  isTap(point){return !this.moved && point.t-this.from.t<=280 && Math.hypot(point.x-this.from.x,point.y-this.from.y)<=10;}
  action(point) {
    this.update(point.t);
    let from=this.from;
    if(this.chaining) {
      from=point;
      // Ignore the earlier tracing direction; only the uninterrupted upward tail is a fling.
      for(const sample of [...this.samples].reverse()) {
        if(point.t-sample.t>180)break;
        const up=sample.y-from.y,side=Math.abs(sample.x-from.x);
        if(Math.hypot(up,side)<2)continue;
        if(up<=0||up<side*.65)break;
        from=sample;
      }
    }
    if(!isUpwardSwipe(from,point))return null;
    if(this.growth==='flower'&&this.ids.length===1&&!this.charged)return null;
    if(this.chaining)return {kind:'chain',held:this.held};
    if(this.growth==='bud'||(this.growth==='flower'&&!this.charged))return null;
    return {kind:'fling',held:this.held};
  }
}

export class DoubleTap {
  constructor(){this.pending=null;}
  tap(id,now) {
    if(this.pending?.id===id && now-this.pending.at<=350){this.clear();return true;}
    this.pending={id,at:now};return false;
  }
  expire(now){if(this.pending && now-this.pending.at>350)this.clear();}
  clear(){this.pending=null;}
}

export function distanceToSegment(point,a,b) {
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=length?clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/length,0,1):0;
  return Math.hypot(point.x-a.x-dx*t,point.y-a.y-dy*t);
}

export function flightPoint(from,to,t) {
  const arc=Math.abs(to.y-from.y)*.28+90;
  return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t-4*arc*t*(1-t)};
}
