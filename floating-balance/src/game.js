export const SHAPES=Object.freeze([
  Object.freeze({id:'circle',name:'Circle',description:'A soft edge. A steady hand.'}),
  Object.freeze({id:'square',name:'Square',description:'Four corners. A little room to breathe.'}),
  Object.freeze({id:'triangle',name:'Triangle',description:'Three corners. One lovely challenge.'}),
]);
export const HAZARDS=Object.freeze([
  Object.freeze({id:'wind',name:'A passing breeze',warning:'A little wind is on its way.',duration:3.2}),
  Object.freeze({id:'quake',name:'A tiny earthquake',warning:'A little rumble is coming.',duration:3.6}),
  Object.freeze({id:'parcel',name:'A surprise from above',warning:'Look up! A little parcel is falling.',duration:3.8}),
]);
export const RADIUS=.055,clamp=(n,min=-1,max=1)=>Math.max(min,Math.min(max,n));
export function shapeById(id){const shape=SHAPES.find(s=>s.id===id);if(!shape)throw new RangeError('Unknown board.');return shape;}
export function vertices(shape){if(shape==='triangle')return [{x:0,y:-1},{x:.97,y:.82},{x:-.97,y:.82}];if(shape==='square')return [{x:-.86,y:-.86},{x:.86,y:-.86},{x:.86,y:.86},{x:-.86,y:.86}];return Array.from({length:64},(_,i)=>({x:Math.cos(i/64*Math.PI*2),y:Math.sin(i/64*Math.PI*2)}));}
export function contains(shape,p,radius=RADIUS){
  if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  if(shape==='circle')return Math.hypot(p.x,p.y)<=1-radius;
  if(shape==='square')return Math.abs(p.x)<=.86-radius&&Math.abs(p.y)<=.86-radius;
  if(shape!=='triangle')return false;
  const points=vertices(shape);return points.every((a,i)=>{const b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y;return (dx*(p.y-a.y)-dy*(p.x-a.x))/Math.hypot(dx,dy)>=radius;});
}
export class FloatingGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(shape='circle'){this.shape=shapeById(shape);this.state='setup';this.elapsed=0;this.accumulator=0;this.ball={x:.02,y:.01,vx:0,vy:0};this.input={x:0,y:0};this.tilt={x:0,y:0};this.events=[];this.pending=null;this.nextEvent=4;this.lastHazard=null;this.eventCount=0;this.fallElapsed=0;this.fallPoint=null;}
  start(shape=this.shape.id){this.reset(shape);this.state='playing';}
  setInput(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)){this.input={x:0,y:0};return;}const n=Math.max(1,Math.hypot(x,y));this.input={x:clamp(x/n),y:clamp(y/n)};}
  pause(){if(this.state!=='playing')return false;this.state='paused';this.input={x:0,y:0};this.accumulator=0;return true;}
  resume(){if(this.state!=='paused')return false;this.state='playing';return true;}
  abandon(){this.state='setup';this.events=[];this.pending=null;this.input={x:0,y:0};}
  schedule(){const pool=HAZARDS.filter(e=>e.id!==this.lastHazard),definition=this.eventCount===0?HAZARDS[0]:pool[Math.floor(clamp(this.random(),0,.999999)*pool.length)],angle=this.random()*Math.PI*2;this.pending={...definition,x:Math.cos(angle),y:Math.sin(angle),at:this.elapsed+1.3};}
  advance(seconds){
    const notices=[];if(!['playing','ending'].includes(this.state)||!Number.isFinite(seconds)||seconds<=0)return notices;
    if(seconds>.5&&this.state==='playing'){this.pause();return ['suspended'];}
    this.accumulator+=Math.min(seconds,.5);const dt=1/120;
    while(this.accumulator+1e-9>=dt&&['playing','ending'].includes(this.state)){
      this.accumulator-=dt;if(this.state==='ending'){this.fallElapsed+=dt;if(this.fallElapsed>=1){this.state='finished';notices.push('finished');}continue;}
      this.elapsed+=dt;
      if(!this.pending&&this.events.length<2&&this.elapsed>=this.nextEvent){this.schedule();notices.push('warning');}
      if(this.pending&&this.elapsed>=this.pending.at){const e={...this.pending,started:this.elapsed};this.pending=null;this.events.push(e);this.eventCount++;this.lastHazard=e.id;this.nextEvent=this.elapsed+2.4+this.random()*1.7;
        if(e.id==='parcel'){this.ball.vx+=e.x*.38;this.ball.vy+=e.y*.38;}if(e.id==='quake'){this.ball.vx+=e.x*.11;this.ball.vy+=e.y*.11;}notices.push('hazard');}
      this.events=this.events.filter(e=>this.elapsed-e.started<e.duration);
      let fx=0,fy=0;for(const e of this.events){const t=this.elapsed-e.started,envelope=Math.min(1,t*4+.25,(e.duration-t)*3+.1);let force=e.id==='wind'?.11:e.id==='quake'?Math.sin(t*21)*.18:.12*Math.exp(-t*.6);fx+=e.x*force*envelope;fy+=e.y*force*envelope;if(e.id==='quake'){fx+=Math.cos(t*17)*.04;fy+=Math.sin(t*19)*.04;}}
      const difficulty=1+Math.min(.5,this.elapsed/180),target={x:this.input.x*.23+fx,y:this.input.y*.23+fy};
      this.tilt.x+=(target.x-this.tilt.x)*(1-Math.exp(-dt*10));this.tilt.y+=(target.y-this.tilt.y)*(1-Math.exp(-dt*10));
      this.ball.vx+=(this.tilt.x*4.2*difficulty+Math.sin(this.elapsed*.7)*.016-this.ball.vx*.85)*dt;this.ball.vy+=(this.tilt.y*4.2*difficulty+Math.cos(this.elapsed*.6)*.012-this.ball.vy*.85)*dt;
      this.ball.x+=this.ball.vx*dt;this.ball.y+=this.ball.vy*dt;
      if(!contains(this.shape.id,this.ball)){this.state='ending';this.fallPoint={...this.ball};this.input={x:0,y:0};this.pending=null;notices.push('fell');}
    }return notices;
  }
}
export function formatTime(seconds){const h=Math.floor(Math.max(0,Number.isFinite(seconds)?seconds:0)*100+1e-7);return `${String(Math.floor(h/6000)).padStart(2,'0')}:${String(Math.floor(h/100)%60).padStart(2,'0')}.${String(h%100).padStart(2,'0')}`;}
export function topThree(rows){return Array.isArray(rows)?rows.filter(r=>r&&Number.isFinite(r.seconds)&&r.seconds>0&&Number.isSafeInteger(r.at)&&r.at>=0&&r.at<=8.64e15).map(r=>({seconds:r.seconds,at:r.at})).sort((a,b)=>b.seconds-a.seconds||a.at-b.at).slice(0,3):[];}
export function readRecords(raw){try{const data=JSON.parse(raw);if(data?.version===1)return Object.fromEntries(SHAPES.map(s=>[s.id,topThree(data.shapes?.[s.id])]));}catch{}return Object.fromEntries(SHAPES.map(s=>[s.id,[]]));}
export function addRecord(records,shape,seconds,at){shapeById(shape);const valid=topThree([{seconds,at}]);if(!valid.length)throw new RangeError('Invalid record.');return {...records,[shape]:topThree([...(records[shape]||[]),valid[0]])};}
