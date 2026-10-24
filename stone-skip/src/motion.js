import {clamp} from './game.js';
const vector=value=>value&&['x','y','z'].every(key=>Number.isFinite(value[key]))?[value.x,value.y,value.z]:null;
// Strength is an arcade proxy for acceleration, never a claimed physical force measurement.
export class MotionPower {
  constructor(now=0){this.started=now;this.baseline=null;this.recent=[];this.samples=0;this.ready=false;this.detectedAt=null;this.peak=0;}
  sample(event,now){
    const linear=vector(event.acceleration),gravity=vector(event.accelerationIncludingGravity);
    if(!linear&&!gravity)return null;
    const input=linear||gravity;this.samples++;
    if(!linear){this.baseline ||= [...gravity];this.baseline=this.baseline.map((v,i)=>v+(gravity[i]-v)*(this.ready?.025:.2));}
    if(now-this.started<400||this.samples<4)return {ready:false,power:0};
    this.ready=true;
    const acceleration=linear?input:input.map((v,i)=>v-this.baseline[i]);
    const magnitude=Math.min(60,Math.hypot(...acceleration));
    this.recent.push({now,magnitude});this.recent=this.recent.filter(p=>now-p.now<=180).slice(-5);
    if(this.recent.length>=3){
      const last=this.recent.slice(-3),median=last.map(p=>p.magnitude).sort((a,b)=>a-b)[1];
      if(median>=5&&last.at(-1).now-last[0].now<=160){this.detectedAt ??= now;this.peak=Math.max(this.peak,median);}
    }
    return {ready:true,power:clamp((this.peak-3)/22)};
  }
  finish(now){return this.detectedAt!==null&&now-this.detectedAt>=350?clamp((this.peak-3)/22):null;}
}
