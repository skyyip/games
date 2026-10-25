import {clamp} from './game.js';
const vector=v=>v&&['x','y','z'].every(k=>Number.isFinite(v[k]))?[v.x,v.y,v.z]:null;
export function projectAxes(x,y,angle=0){const a=angle*Math.PI/180;return {x:x*Math.cos(a)+y*Math.sin(a),y:-x*Math.sin(a)+y*Math.cos(a)};}
export function tiltAxes({beta,gamma},angle=0){
  if(!Number.isFinite(beta)||!Number.isFinite(gamma))return null;
  const b=beta*Math.PI/180,g=gamma*Math.PI/180,p=projectAxes(Math.sin(g)*Math.cos(b),Math.sin(b),angle);
  return {x:Math.asin(clamp(p.x))*180/Math.PI,y:Math.asin(clamp(p.y))*180/Math.PI};
}
export class TiltSensor {
  constructor(){this.samples=[];this.baseline=null;this.value={x:0,y:0};this.lastAt=null;}
  sample(event,angle,now){
    const value=tiltAxes(event,angle);if(!value)return false;this.lastAt=now;
    if(!this.baseline){this.samples.push(value);if(this.samples.length>=8){const median=k=>{const a=this.samples.map(s=>s[k]).sort((a,b)=>a-b);return (a[3]+a[4])/2;};this.baseline={x:median('x'),y:median('y')};}return true;}
    for(const key of ['x','y']){const delta=value[key]-this.baseline[key];this.value[key]=clamp(Math.sign(delta)*Math.max(0,Math.abs(delta)-.8)/15);}return true;
  }
  get ready(){return this.baseline!==null;}
  fresh(now){return this.ready&&now-this.lastAt<650;}
}
