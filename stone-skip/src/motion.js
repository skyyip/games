import {clamp,motionPower} from './game.js';
const vector=value=>value&&['x','y','z'].every(key=>Number.isFinite(value[key]))?[value.x,value.y,value.z]:null;
const median=values=>[...values].sort((a,b)=>a-b)[1];
// Short, rest-calibrated integration gives arcade speed/range estimates, not
// calibrated force or distance measurements. Never extrapolate across data gaps.
export class MotionPower {
  constructor(now=0){
    this.started=now;this.baseline=null;this.linearBias=null;this.recent=[];this.samples=0;this.ready=false;
    this.detectedAt=null;this.peak=0;this.peakSpeed=0;this.amplitude=0;this.velocity=[0,0,0];this.position=[0,0,0];
    this.low=[0,0,0];this.high=[0,0,0];this.previous=null;this.lastSample=null;
  }
  get metrics(){return {force:this.peak,speed:this.peakSpeed,amplitude:this.amplitude};}
  integrate(acceleration,now){
    if(this.previous){
      const dt=(now-this.previous.now)/1000;
      if(dt>0&&dt<=.16){
        for(let i=0;i<3;i++){
          const next=clamp(this.velocity[i]+(this.previous.acceleration[i]+acceleration[i])*.5*dt,-12,12);
          this.position[i]+=(this.velocity[i]+next)*.5*dt;this.velocity[i]=next;
          this.low[i]=Math.min(this.low[i],this.position[i]);this.high[i]=Math.max(this.high[i],this.position[i]);
        }
        this.peakSpeed=Math.max(this.peakSpeed,Math.min(12,Math.hypot(...this.velocity)));
        this.amplitude=Math.min(3,Math.hypot(...this.high.map((v,i)=>v-this.low[i])));
      }else if(dt>.16)this.velocity=[0,0,0];
    }
    this.previous={now,acceleration};
  }
  sample(event,now){
    const linear=vector(event.acceleration),gravity=vector(event.accelerationIncludingGravity);
    if(!Number.isFinite(now)||(!linear&&!gravity)||(this.lastSample!==null&&now-this.lastSample<5))return null;
    this.lastSample=now;this.samples++;
    if(!linear){this.baseline ||= [...gravity];this.baseline=this.baseline.map((v,i)=>v+(gravity[i]-v)*(this.ready?.025:.2));}
    else{this.linearBias ||= [...linear];if(!this.ready)this.linearBias=this.linearBias.map((v,i)=>v+(linear[i]-v)*.2);}
    if(now-this.started<400||this.samples<4)return {ready:false,power:0};
    this.ready=true;
    const raw=linear?linear.map((v,i)=>v-this.linearBias[i]):gravity.map((v,i)=>v-this.baseline[i]);
    const rawMagnitude=Math.hypot(...raw),scale=rawMagnitude>60?60/rawMagnitude:1,acceleration=raw.map(v=>v*scale);
    this.recent.push({now,magnitude:Math.hypot(...acceleration),acceleration});
    this.recent=this.recent.filter(p=>now-p.now<=180).slice(-5);
    if(this.recent.length>=3){
      const last=this.recent.slice(-3),force=median(last.map(p=>p.magnitude));
      if(last.at(-1).now-last[0].now<=160){
        if(this.detectedAt===null&&force>=5){
          this.detectedAt=now;
          for(const reading of last)this.integrate(reading.acceleration,reading.now);
        }else if(this.detectedAt!==null&&now-this.detectedAt<=450){
          this.integrate([0,1,2].map(i=>median(last.map(p=>p.acceleration[i]))),now);
        }
        if(this.detectedAt!==null&&now-this.detectedAt<=450)this.peak=Math.max(this.peak,force);
      }
    }
    return {ready:true,power:motionPower(this.metrics)};
  }
  finish(now){return this.detectedAt!==null&&now-this.detectedAt>=450?motionPower(this.metrics):null;}
}
