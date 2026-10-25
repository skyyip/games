export const LIMITS=Object.freeze({angle:[5,100]});
export const WEIGHTS=Object.freeze({angle:20,power:80});
export const DEFAULTS=Object.freeze(Object.fromEntries(Object.entries(LIMITS).map(([key,[min]])=>[key,min])));
export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export function motionQualities(metrics){
  if(!metrics||[['force',60],['speed',12],['amplitude',3]].some(([key,max])=>!Number.isFinite(metrics[key])||metrics[key]<0||metrics[key]>max))throw new RangeError('Invalid motion readings.');
  return {force:clamp((metrics.force-3)/22),speed:clamp(metrics.speed/3.5),amplitude:clamp(metrics.amplitude/.45)};
}
export function motionPower(metrics){const q=motionQualities(metrics);return (q.force+q.speed+q.amplitude)/3;}
export function settings(values){
  if(!values||Object.entries(LIMITS).some(([key,[min,max]])=>!Number.isFinite(values[key])||values[key]<min||values[key]>max))throw new RangeError('Choose settings within the displayed ranges.');
  return Object.fromEntries(Object.keys(LIMITS).map(key=>[key,values[key]]));
}
export function qualities(values){
  const s=settings(values);
  return {angle:Math.exp(-(((s.angle-20)/26)**2))};
}
export function throwStone(values,power){
  const config=settings(values);if(!Number.isFinite(power)||power<0||power>1)throw new RangeError('Power must be between zero and one.');
  const q=qualities(config),parts={angle:q.angle*WEIGHTS.angle,power:power*WEIGHTS.power};
  const total=Object.values(parts).reduce((a,b)=>a+b,0),score=Math.round(total*100)/100;
  return {settings:config,power,parts,score,distance:Math.round((3+117*(total/100)**1.75)*10)/10,bounces:Math.floor(1+27*(total/100)**2.2)};
}
export function flightPlan(result,{reduced=false}={}){
  const speed=reduced?.48:1,segments=[],contacts=[];
  const weights=Array.from({length:result.bounces},(_,i)=>1.6*.91**i),sum=weights.reduce((a,b)=>a+b,0);
  let time=0,progress=0;
  for(let i=0;i<result.bounces;i++){
    const duration=(i===0?700:Math.max(170,350-i*7))*speed,next=progress+weights[i]/sum*.96;
    segments.push({start:time,end:time+duration,from:progress,to:next,height:(i===0?.1+.14*Math.sin(result.settings.angle*Math.PI/180):.075*.9**(i-1))*(reduced?.3:1)});
    time+=duration;progress=next;contacts.push({time,progress,index:i+1});
  }
  segments.push({start:time,end:time+600*speed,from:progress,to:1,height:0});
  return {segments,contacts,duration:time+600*speed,reduced};
}
export function flightAt(plan,elapsed){
  const time=clamp(elapsed,0,plan.duration),segment=plan.segments.find(s=>time<s.end)||plan.segments.at(-1),t=clamp((time-segment.start)/(segment.end-segment.start));
  return {progress:segment.from+(segment.to-segment.from)*t,lift:Math.sin(t*Math.PI)*segment.height,
    contacts:plan.contacts.filter(c=>time>=c.time).length,sink:time>=plan.contacts.at(-1).time?t:0,done:elapsed>=plan.duration};
}
export function gesturePower(points,end){
  if(points.length<2)return null;
  const last=points.at(-1);if(end.t-last.t>140)return null;
  const from=points.find(p=>end.t-p.t<=140)||last,up=from.y-end.y,distance=Math.hypot(end.x-from.x,up),speed=distance/Math.max(16,end.t-from.t);
  if(up<25||distance<35||speed<.12)return null;
  return clamp((speed-.1)/2.3);
}
export const keyboardPower=elapsed=>{const phase=(Math.max(0,elapsed)%2400)/1200;return phase<=1?phase:2-phase;};

export class StoneGame {
  constructor(){this.reset();}
  reset(){this.state='setup';this.result=null;this.config=null;this.source=null;}
  arm(values){if(!['setup','results'].includes(this.state))return false;this.config=settings(values);this.result=null;this.state='armed';return true;}
  launch(power,source,motion=null){
    if(this.state!=='armed'||!['gesture','motion','keyboard'].includes(source))return false;
    if(source==='motion'){try{if(Math.abs(motionPower(motion)-power)>1e-8)return false;}catch{return false;}}
    this.result={...throwStone(this.config,power),source,motion:source==='motion'?{...motion}:null};this.state='animating';return true;
  }
  complete(){if(this.state!=='animating')return null;this.state='results';return this.result;}
}

function validRecord(r){
  if(!r||typeof r.id!=='string'||r.id.length>100||!Number.isSafeInteger(r.createdAt)||r.createdAt<0||!['gesture','motion','keyboard'].includes(r.source))return false;
  try{const expected=throwStone(r.settings,r.power);return (r.source!=='motion'||Math.abs(motionPower(r.motion)-r.power)<1e-8)&&['score','distance','bounces'].every(key=>r[key]===expected[key]);}catch{return false;}
}
export function rankRecords(records){
  const unique=[...new Map(records.filter(validRecord).map(r=>[r.id,r])).values()];
  const sort=key=>[...unique].sort((a,b)=>b[key]-a[key]||b.score-a.score||a.createdAt-b.createdAt||a.id.localeCompare(b.id)).slice(0,3);
  return {distance:sort('distance'),bounces:sort('bounces')};
}
export function keepRecords(records){const top=rankRecords(records);return [...new Map([...top.distance,...top.bounces].map(r=>[r.id,r])).values()];}
export function readRecords(text){try{const data=JSON.parse(text);return data?.version===2&&Array.isArray(data.records)?keepRecords(data.records.slice(0,100)):[];}catch{return [];}}
