export const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
export const DECELERATION=14,MAX_SPEED=108,MAX_DISTANCE=MAX_SPEED**2/(2*DECELERATION);

// Distances are game metres. Screens do not report physical finger force:
// sustained acceleration estimates effort; useful pressure readings refine it.
export function measureFlick(input,{extent=800,source='touch'}={}) {
  if(!Array.isArray(input)||!Number.isFinite(extent)||extent<=0||!['touch','mouse','pen'].includes(source))return null;
  const samples=[];
  for(const point of input){
    if(!point||![point.x,point.y,point.t].every(Number.isFinite))continue;
    const previous=samples.at(-1);
    if(previous&&point.t-previous.t<2)continue;
    samples.push(point);
  }
  if(samples.length<2)return null;
  const first=samples[0],last=samples.at(-1),duration=(last.t-first.t)/1000;
  const dy=last.y-first.y,dx=last.x-first.x,span=Math.abs(dy);
  if(duration<.025||duration>1.5||span<24||span<Math.abs(dx)*1.4)return null;
  let path=0,peak=0,acceleration=0,previousSpeed=0,previousTime=first.t;
  for(let i=1;i<samples.length;i++){
    path+=Math.abs(samples[i].y-samples[i-1].y);
    // Use a moving ~60 ms window, rather than a noisy single event delta.
    let j=i-1;
    while(j>0&&samples[i].t-samples[j].t<60)j--;
    const dt=(samples[i].t-samples[j].t)/1000;
    if(dt<.024)continue;
    const speed=Math.abs(samples[i].y-samples[j].y)/extent/dt;
    peak=Math.max(peak,speed);
    const since=(samples[i].t-previousTime)/1000;
    if(since>=.024){acceleration=Math.max(acceleration,(speed-previousSpeed)/since);previousSpeed=speed;previousTime=samples[i].t;}
  }
  if(span/path<.72)return null; // Repeated rubbing cannot add extra power.
  const average=span/extent/duration;
  // A long stop before release is a drag, not a fast finishing flick.
  let tail=samples.length-2;
  while(tail>0&&last.t-samples[tail].t<80)tail--;
  const releaseSpeed=Math.abs(last.y-samples[tail].y)/extent/((last.t-samples[tail].t)/1000);
  if(releaseSpeed<.12)return null;
  const speed=Math.min(12,.65*releaseSpeed+.2*peak+.15*average);
  const speedQuality=clamp(speed/4),spanQuality=clamp(span/extent/.75);
  const pressure=samples.filter(p=>Number.isFinite(p.pressure)&&p.pressure>0&&(source==='pen'?p.pressure<=1:p.pressure<1)&&Math.abs(p.pressure-.5)>.03).map(p=>p.pressure);
  const pressureUsed=['touch','pen'].includes(source)&&pressure.length>=3;
  const accelerationQuality=clamp(Math.max(acceleration,average/duration)/32);
  const forceQuality=pressureUsed ? .75*accelerationQuality+.25*(pressure.reduce((a,b)=>a+b,0)/pressure.length) : accelerationQuality;
  // Multiplicative contributions: improving any component improves the result.
  const strength=speedQuality**.45*forceQuality**.3*spanQuality**.25;
  return Object.freeze({direction:dy<0?'up':'down',speedQuality,forceQuality,spanQuality,strength,pressureUsed,source,
    speed,span:span/extent,duration,initialSpeed:12+96*strength});
}

export class FlickGame {
  constructor(){this.reset();}
  reset(){this.state='ready';this.metrics=null;this.distance=0;this.speed=0;this.elapsed=0;}
  begin(){if(this.state!=='ready')return false;this.state='dragging';return true;}
  release(samples,options){
    if(this.state!=='dragging')return false;
    const metrics=measureFlick(samples,options);
    if(!metrics){this.reset();return false;}
    this.metrics=metrics;this.speed=metrics.initialSpeed;this.state='coasting';return true;
  }
  advance(seconds){
    if(this.state!=='coasting'||!Number.isFinite(seconds)||seconds<=0)return false;
    const v=this.metrics.initialSpeed,duration=v/DECELERATION;
    this.elapsed=Math.min(duration,this.elapsed+seconds);
    this.speed=Math.max(0,v-DECELERATION*this.elapsed);
    this.distance=v*this.elapsed-.5*DECELERATION*this.elapsed**2;
    if(this.elapsed>=duration){this.state='complete';this.speed=0;}
    return this.state==='complete';
  }
}
