const vector=v=>v&&['x','y','z'].every(k=>Number.isFinite(v[k]))?[v.x,v.y,v.z]:null;
export class ShakeDetector {
  constructor(){this.reset();}
  reset(){this.gravity=null;this.last=null;this.peaks=[];}
  sample(event,now){
    const linear=vector(event.acceleration),gravity=vector(event.accelerationIncludingGravity);if(!Number.isFinite(now)||(!linear&&!gravity))return false;
    if(this.last!==null&&(now-this.last<15||now<=this.last))return false;
    if(this.last!==null&&now-this.last>250)this.peaks=[];this.last=now;
    let acceleration=linear;
    if(!linear){if(!this.gravity){this.gravity=[...gravity];return false;}acceleration=gravity.map((v,i)=>v-this.gravity[i]);this.gravity=this.gravity.map((v,i)=>v+(gravity[i]-v)*.12);}
    const magnitude=Math.hypot(...acceleration);this.peaks=this.peaks.filter(t=>now-t<550);
    if(magnitude>=10&&(!this.peaks.length||now-this.peaks.at(-1)>=55))this.peaks.push(now);
    if(this.peaks.length>=2){this.peaks=[];return true;}return false;
  }
}
