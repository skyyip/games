export const DURATIONS=Object.freeze([120,180]);
export const GRAVITY=9.81,LAUNCH_HEIGHT=.7,RIM_HEIGHT=.85,POT_DEPTH=5.5,MOUTH_RADIUS=.43,STILL_TIME=12,VERTICAL_START=24;
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const smooth=t=>t*t*(3-2*t);
export function makePath(duration,random=Math.random){
  const path=[{at:0,x:0},{at:STILL_TIME,x:0}];let at=STILL_TIME,x=0;
  while(at<duration+4){let next=(clamp(random())*2-1)*1.65;if(Math.abs(next-x)<.35)next=clamp(x+(x>0?-.65:.65),-1.65,1.65);
    at+=Math.max(4.5+clamp(random())*3,Math.abs(next-x)*3.4);path.push({at,x:next});x=next;
  }return path;
}
export function potAt(path,seconds){
  if(!path?.length)return 0;
  for(let i=1;i<path.length;i++)if(seconds<=path[i].at){const a=path[i-1],b=path[i];return a.x+(b.x-a.x)*smooth(clamp((seconds-a.at)/(b.at-a.at)));}
  return path.at(-1).x;
}
export function potDepthAt(path,seconds){
  if(path.length<3||seconds<=VERTICAL_START)return POT_DEPTH;
  const t=seconds-VERTICAL_START;return POT_DEPTH+.65*smooth(clamp(t/4))*Math.sin(t*.27);
}
export function throwVelocity({power,heading=0}){
  if(!Number.isFinite(power)||!Number.isFinite(heading))throw new RangeError('Invalid throw.');
  const speed=5.6+clamp(power)*4.1,elevation=50*Math.PI/180,angle=clamp(heading,-.45,.45);
  return {vx:Math.sin(angle)*speed*Math.cos(elevation),vz:Math.cos(angle)*speed*Math.cos(elevation),vy:speed*Math.sin(elevation)};
}
export function flightAt(flight,seconds){const t=Math.max(0,seconds);return {x:flight.vx*t,z:flight.vz*t,h:LAUNCH_HEIGHT+flight.vy*t-GRAVITY*t*t/2,vh:flight.vy-GRAVITY*t};}
export function descendingTime(vy,height=RIM_HEIGHT){const d=vy*vy-2*GRAVITY*(height-LAUNCH_HEIGHT);return d>=0?(vy+Math.sqrt(d))/GRAVITY:null;}
export function gestureThrow(samples,now,scale=1){
  if(!Array.isArray(samples)||samples.length<2||!Number.isFinite(now)||!Number.isFinite(scale)||scale<=0||samples.some(p=>!p||![p.x,p.y,p.t].every(Number.isFinite)))return null;
  const start=samples[0],end=samples.at(-1),up=(start.y-end.y)/scale,dx=(end.x-start.x)/scale;
  if(up<28||now-end.t>100||now<end.t)return null;
  const tail=samples.filter(p=>now-p.t<=150),first=tail[0];if(tail.length<2||end.t-first.t<16)return null;
  const tailUp=(first.y-end.y)/scale;if(tailUp<18)return null;
  const speed=Math.hypot(end.x-first.x,end.y-first.y)/scale/(end.t-first.t);
  if(speed<.2)return null;
  return {power:clamp((speed-.15)/1.55),heading:clamp(Math.atan2(dx,up)*.8,-.45,.45)};
}
export function keyboardPower(milliseconds){const t=clamp(milliseconds/1250,0,2);return t<=1?t:2-t;}

export class PotGame {
  constructor({random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.reset();}
  reset(duration=120){
    if(!DURATIONS.includes(duration))throw new RangeError('Invalid duration.');
    this.duration=duration;this.state='idle';this.startedAt=0;this.elapsed=0;this.score=0;this.stats={shots:0,normal:0,color:0,misses:0};this.flight=null;this.impact=null;this.landed=[];this.availableAt=0;this.path=[{at:0,x:0}];this.bag=[];this.nextType='normal';
  }
  nextArrow(){
    if(!this.bag.length){this.bag=['normal','normal','color','color'];for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(clamp(this.random(),0,.999999)*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}
    this.nextType=this.bag.pop();
  }
  start(duration=this.duration){this.reset(duration);this.path=makePath(duration,this.random);this.startedAt=this.now();this.state='playing';this.nextArrow();}
  get remaining(){return this.state==='idle'?this.duration:Math.max(0,this.duration-(this.now()-this.startedAt)/1000);}
  get potX(){return potAt(this.path,this.elapsed);}
  get potDepth(){return potDepthAt(this.path,this.elapsed);}
  get ready(){return this.state==='playing'&&this.remaining>0&&!this.flight&&this.elapsed>=this.availableAt;}
  launch(options){
    if(!this.ready)return null;
    let velocity;try{velocity=throwVelocity(options);}catch{return null;}
    const elapsed=(this.now()-this.startedAt)/1000;if(elapsed<0||elapsed>=this.duration)return null;
    this.elapsed=elapsed;this.stats.shots++;
    const flight={...velocity,type:this.nextType,id:this.stats.shots,started:elapsed,lastT:0};this.flight=flight;return flight;
  }
  resolve(flight,kind,t,position,events){
    const at=flight.started+t;if(at>=this.duration)return;
    const points=kind==='hit'?(flight.type==='color'?2:1):0;
    if(points){this.score+=points;this.stats[flight.type]++;this.landed.push({type:flight.type,x:position.x-potAt(this.path,at),z:position.z-potDepthAt(this.path,at)});this.landed=this.landed.slice(-5);}else this.stats.misses++;
    this.impact={...position,at,kind,points,type:flight.type,potX:potAt(this.path,at),potDepth:potDepthAt(this.path,at),flight:{...flight},t};
    events.push(this.impact);this.flight=null;this.availableAt=at+(kind==='hit'?.36:.5);this.nextArrow();
  }
  advance(){
    const events=[];if(this.state!=='playing')return events;
    this.elapsed=clamp((this.now()-this.startedAt)/1000,0,this.duration);
    const f=this.flight;
    if(f){
      const limit=Math.min(this.elapsed-f.started,descendingTime(f.vy,0)),mouth=descendingTime(f.vy);
      while(this.flight&&f.lastT<limit-1e-9){
        const from=f.lastT,t=Math.min(limit,from+1/120),p=flightAt(f,t);
        if(mouth!==null&&from<mouth&&t>=mouth){
          const hit=flightAt(f,mouth),dx=hit.x-potAt(this.path,f.started+mouth),distance=Math.hypot(dx,hit.z-potDepthAt(this.path,f.started+mouth));
          if(distance<=MOUTH_RADIUS-.02){this.resolve(f,'hit',mouth,hit,events);break;}
          if(distance<=MOUTH_RADIUS+.13){this.resolve(f,'rim',mouth,hit,events);break;}
        }
        const radius=.60-.08*(p.h/RIM_HEIGHT),distance=Math.hypot(p.x-potAt(this.path,f.started+t),p.z-potDepthAt(this.path,f.started+t));
        if(p.h>.1&&p.h<RIM_HEIGHT-.02&&distance<radius){this.resolve(f,'rim',t,p,events);break;}
        if(p.h<=.000001){const dx=p.x-potAt(this.path,f.started+t),dz=p.z-potDepthAt(this.path,f.started+t);
          const kind=Math.abs(dz)>.65?(dz<0?'short':'far'):(dx<0?'left':'right');this.resolve(f,kind,t,p,events);break;
        }
        f.lastT=t;
      }
    }
    if(this.elapsed>=this.duration){this.state='finished';this.flight=null;events.push({kind:'finished'});}
    return events;
  }
  abandon(){this.state='idle';this.flight=null;this.impact=null;}
}
const blank=()=>({120:[],180:[]});
export function topThree(rows){return Array.isArray(rows)?rows.filter(r=>r&&Number.isSafeInteger(r.score)&&r.score>=0&&Number.isSafeInteger(r.at)&&r.at>=0&&r.at<=8.64e15).map(r=>({score:r.score,at:r.at})).sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,3):[];}
export function readRecords(raw){try{const data=JSON.parse(raw);if(data?.version===1)return {120:topThree(data.modes?.[120]),180:topThree(data.modes?.[180])};}catch{}return blank();}
export function addRecord(records,mode,score,at){if(!DURATIONS.includes(mode)||!Number.isSafeInteger(score)||score<0||!Number.isSafeInteger(at)||at<0||at>8.64e15)throw new RangeError('Invalid record.');return {...records,[mode]:topThree([...(records[mode]||[]),{score,at}])};}
