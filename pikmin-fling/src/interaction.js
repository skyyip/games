import {FLOWER_HOLD,CHAIN_HOLD} from './game.js';

export const TYPES=Object.freeze(['red','yellow','blue']);
export const TYPE_NAMES={red:'Red',yellow:'Yellow',blue:'Blue'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function createRoster(width,height,random=Math.random) {
  const columns=width>=500?6:5,rows=Math.ceil(30/columns);
  return Array.from({length:30},(_,id)=>{
    const angle=random()*Math.PI*2,speed=18+random()*6;
    return {id,type:TYPES[Math.floor(random()*TYPES.length)],x:(id%columns+.5)*width/columns,
      y:(Math.floor(id/columns)+.5)*height/rows,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,turn:4+random()*4};
  });
}

export function walkRoster(roster,dt,width,height,frozen=new Set(),random=Math.random) {
  dt=Math.min(.04,Math.max(0,dt));
  for(const p of roster) {
    if(frozen.has(p.id))continue;
    p.turn-=dt;
    if(p.turn<=0){const angle=random()*Math.PI*2,speed=18+random()*6;p.vx=Math.cos(angle)*speed;p.vy=Math.sin(angle)*speed;p.turn=4+random()*4;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.x<22||p.x>width-22)p.vx*=-1;
    if(p.y<29||p.y>height-29)p.vy*=-1;
    p.x=clamp(p.x,22,width-22);p.y=clamp(p.y,29,height-29);
  }
  // Soft separation keeps the full touch targets reachable in the small garden.
  for(let i=0;i<roster.length;i++)for(let j=i+1;j<roster.length;j++) {
    const a=roster[i],b=roster[j],dx=b.x-a.x,dy=b.y-a.y;
    const overlapX=46-Math.abs(dx),overlapY=60-Math.abs(dy);
    if(overlapX<=0||overlapY<=0)continue;
    const axis=overlapX<overlapY?'x':'y',delta=axis==='x'?dx:dy,amount=Math.min(overlapX,overlapY);
    const am=frozen.has(a.id)?0:frozen.has(b.id)?1:.5,bm=frozen.has(b.id)?0:frozen.has(a.id)?1:.5;
    const sign=delta<0?-1:1;
    a[axis]-=sign*amount*am;b[axis]+=sign*amount*bm;
    for(const p of [a,b])if(!frozen.has(p.id)){p.x=clamp(p.x,22,width-22);p.y=clamp(p.y,29,height-29);p.turn=Math.min(p.turn,.5);}
  }
}

export function isUpwardSwipe(from,to) {
  const up=from.y-to.y,side=Math.abs(to.x-from.x),duration=Math.max(1,to.t-from.t);
  return up>=14 && up>=side*.65 && (up>=24 || up/duration>=.18);
}

export class PointerGesture {
  constructor(id,growth,from) {
    this.ids=[id];this.growth=growth;this.from=from;this.last=from;this.samples=[from];
    this.held=0;this.moved=false;this.chaining=false;
  }
  get charged(){return this.held>=FLOWER_HOLD;}
  get holdTarget(){return this.growth==='flower'?FLOWER_HOLD:CHAIN_HOLD;}
  update(now) {
    if(!this.moved){
      this.held=Math.max(this.held,now-this.from.t);
      if(this.held>=this.holdTarget)this.chaining=true;
      // Keep a recent stationary anchor so the first move after a long hold is recognised.
      this.samples=[{...this.last,t:now}];
    }
  }
  move(point) {
    this.update(point.t);
    if(Math.hypot(point.x-this.from.x,point.y-this.from.y)>10)this.moved=true;
    this.last=point;this.samples.push(point);
    this.samples=this.samples.filter(p=>point.t-p.t<=180);
  }
  add(id,growth) {
    if(!this.chaining||growth!==this.growth||this.ids.includes(id))return false;
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
