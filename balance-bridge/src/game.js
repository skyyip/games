export const clamp=(n,min=-1,max=1)=>Math.max(min,Math.min(max,n));
export const EVENTS=Object.freeze([
  Object.freeze({id:'wind',level:1,duration:3,name:'A passing gust',warning:'A breeze is on its way.',description:'A passing gust · 3 seconds'}),
  Object.freeze({id:'bird',level:2,duration:3,name:'A little bird surprise',warning:'Look out for that bird!',description:'Bird droppings · 3 seconds'}),
  Object.freeze({id:'thorns',level:3,duration:4,name:'Prickly footsteps',warning:'Thorns ahead. Tiny careful steps!',description:'Thorns underfoot · 4 seconds'}),
  Object.freeze({id:'bridge',level:4,duration:4,name:'A wobbly bridge',warning:'The bridge is about to wobble!',description:'A shaking bridge · 4 seconds'}),
  Object.freeze({id:'roach',level:5,duration:5,name:'An unexpected passenger',warning:'A flying roach is coming!',description:'A roach on your head · 5 seconds'}),
]);
export const FALL_ANGLE=.94,WARNING_TIME=1.6,FALL_DURATION=1.25;

// A fixed-step inverted pendulum: tilting left applies leftward correction.
// Time advances only through active simulation. Paused/background time never scores.
export class BalanceGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(){this.state='idle';this.elapsed=0;this.angle=.006;this.velocity=0;this.input=0;this.target=0;this.accumulator=0;this.phase=0;this.drift=.012;this.nextDrift=.8;this.nextEvent=7;this.pending=null;this.event=null;this.eventCount=0;this.lastEvent=null;this.fallElapsed=0;this.fallSide=1;this.fallReason='Lost your balance.';}
  start(){this.reset();this.state='playing';return true;}
  pause(){if(this.state!=='playing')return false;this.state='paused';this.target=0;this.input=0;this.accumulator=0;return true;}
  resume(){if(this.state!=='paused')return false;this.state='playing';return true;}
  abandon(){this.state='idle';this.pending=null;this.event=null;this.input=0;this.target=0;this.accumulator=0;}
  setInput(value){this.target=Number.isFinite(value)?clamp(value):0;}
  schedule(){
    const pool=EVENTS.filter(e=>e.id!==this.lastEvent);
    const definition=this.eventCount===0?EVENTS[0]:pool[Math.floor(clamp(this.random(),0,.999999)*pool.length)];
    this.pending={...definition,direction:this.random()<.5?-1:1,startsAt:this.elapsed+WARNING_TIME};
  }
  advance(seconds){
    const notices=[];
    if(!Number.isFinite(seconds)||seconds<=0||!['playing','falling'].includes(this.state))return notices;
    this.accumulator+=Math.min(seconds,.25);
    const dt=1/120;
    while(this.accumulator+1e-9>=dt&&['playing','falling'].includes(this.state)){
      this.accumulator-=dt;
      if(this.state==='falling'){
        this.fallElapsed+=dt;
        if(this.fallElapsed+1e-9>=FALL_DURATION){this.state='finished';notices.push('finished');}
        continue;
      }
      this.elapsed+=dt;this.phase+=dt*7.6;
      if(this.elapsed>=this.nextDrift){this.drift=(this.random()-.5)*.15;this.nextDrift=this.elapsed+.7+this.random()*.7;}
      if(!this.event&&!this.pending&&this.elapsed>=this.nextEvent){this.schedule();notices.push('warning');}
      if(this.pending&&this.elapsed>=this.pending.startsAt){
        this.event={...this.pending,startedAt:this.elapsed};this.pending=null;this.lastEvent=this.event.id;this.eventCount++;
        this.velocity+=this.event.direction*this.event.level*.045;notices.push('event');
      }
      if(this.event&&this.elapsed-this.event.startedAt+1e-9>=this.event.duration){
        this.event=null;this.nextEvent=this.elapsed+4+this.random()*5;notices.push('clear');
      }
      const difficulty=1+Math.min(this.elapsed/150,.6);
      let disturbance=0;
      if(this.event){
        const t=this.elapsed-this.event.startedAt,l=this.event.level;
        const envelope=Math.min(1,t*4+.2,this.event.duration-t+.15);
        disturbance=envelope*(this.event.direction*l*.095+Math.sin(t*(7+l*1.7))*l*l*.018);
      }
      this.input+=(this.target-this.input)*(1-Math.exp(-dt*11));
      const acceleration=Math.sin(this.angle)*1.9*difficulty-this.velocity*1.65+this.input*3.15
        +Math.sin(this.phase*.62)*.055+this.drift+disturbance;
      this.velocity+=acceleration*dt;this.angle+=this.velocity*dt;
      if(Math.abs(this.angle)>=FALL_ANGLE){
        this.angle=clamp(this.angle,-FALL_ANGLE,FALL_ANGLE);this.state='falling';this.fallSide=Math.sign(this.angle)||1;
        this.fallReason=this.event?.name||'Lost your balance.';this.target=0;this.pending=null;notices.push('fall');
      }
    }
    return notices;
  }
}

// Tilt is projected onto the screen's horizontal axis, including landscape.
// Calibration subtracts the comfortable holding angle; samples never move the baseline.
export function screenTilt({beta,gamma},screenAngle=0){
  if(!Number.isFinite(beta)||!Number.isFinite(gamma))return null;
  const a=screenAngle*Math.PI/180,b=beta*Math.PI/180,g=gamma*Math.PI/180;
  const horizontal=Math.sin(g)*Math.cos(b)*Math.cos(a)+Math.sin(b)*Math.sin(a);
  return Math.asin(clamp(horizontal))*180/Math.PI;
}
export class TiltInput {
  constructor(){this.samples=[];this.baseline=null;this.value=0;this.lastAt=null;}
  sample(event,angle,now){
    const tilt=screenTilt(event,angle);if(tilt===null)return false;
    this.lastAt=now;
    if(this.baseline===null){this.samples.push(tilt);if(this.samples.length>=8){const sorted=[...this.samples].sort((a,b)=>a-b);this.baseline=(sorted[3]+sorted[4])/2;}return true;}
    const delta=tilt-this.baseline;this.value=clamp(Math.sign(delta)*Math.max(0,Math.abs(delta)-.7)/17);return true;
  }
  get ready(){return this.baseline!==null;}
  get degrees(){return this.value*17;}
  fresh(now){return this.ready&&now-this.lastAt<1800;}
}
export function formatTime(seconds){
  const hundredths=Math.floor(Math.max(0,Number.isFinite(seconds)?seconds:0)*100+1e-7);
  return `${String(Math.floor(hundredths/6000)).padStart(2,'0')}:${String(Math.floor(hundredths/100)%60).padStart(2,'0')}.${String(hundredths%100).padStart(2,'0')}`;
}
export function readRecords(raw){
  try{const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.records))return [];return rankRecords(data.records);}catch{return [];}
}
export function rankRecords(records){return records.filter(r=>r&&Number.isFinite(r.seconds)&&r.seconds>0&&Number.isFinite(r.at)&&r.at>=0&&['motion','touch'].includes(r.mode)).map(r=>({seconds:r.seconds,at:r.at,mode:r.mode})).sort((a,b)=>b.seconds-a.seconds||a.at-b.at).slice(0,3);}
