import {skipDay} from './skip-budget.js';
export const GROWTH_KEY='your-dream-career.daily-growth.v1';
const attributes=['iq','eq','pq','jq','health','contacts','reputation'];
export function growthSnapshot(s){return Object.fromEntries([...attributes.map(k=>[k,Math.round(s.stats[k]*10)/10]),...Object.entries(s.skills).map(([k,v])=>['skill-'+k,Math.round(v*10)/10])]);}
export function growthRun(s){return JSON.stringify([s.profile.name,s.profile.startAge,s.profile.height,s.profile.weight,s.profile.mbti,s.panels[0]?.text,s.panels[0]?.tone]);}
export class DailyGrowth{
 constructor({store,scope=()=>null,now=()=>Date.now()}={}){this.store=store;this.scope=scope;this.now=now;}
 get key(){return GROWTH_KEY+'.'+encodeURIComponent(this.scope()??'local');}
 update(s,claim=false){
  const day=skipDay(this.now()),run=growthRun(s),snapshot=growthSnapshot(s);let old;
  try{old=JSON.parse(this.store.read(this.key));}catch{}
  const validSummary=report=>report===null||report&&typeof report.first==='boolean'&&/^\d{4}-\d{2}-\d{2}$/.test(report.period)&&['gains','declines'].every(k=>Array.isArray(report[k])&&report[k].length<=Object.keys(snapshot).length&&report[k].every(c=>Object.hasOwn(snapshot,c.key)&&Number.isFinite(c.value)&&Math.abs(c.value)<=10000));
  const valid=old?.version===1&&typeof old.run==='string'&&(old.shown===null||typeof old.shown==='string')&&validSummary(old.pending)&&typeof old.day==='string'&&old.baseline&&old.latest&&Object.keys(snapshot).every(k=>Number.isFinite(old.baseline[k])&&Number.isFinite(old.latest[k]));
  let record=valid?old:{version:1,day,run,baseline:snapshot,latest:snapshot,shown:null,pending:{first:true,period:day,gains:[],declines:[]}};
  if(record.run!==run)record={version:1,day,run,baseline:snapshot,latest:snapshot,shown:record.shown,pending:{first:true,period:day,gains:[],declines:[]}};
  else if(record.day!==day){const changes=Object.keys(snapshot).map(key=>({key,value:Math.round((record.latest[key]-record.baseline[key])*10)/10}));record={version:1,day,run,baseline:snapshot,latest:snapshot,shown:record.shown,pending:{first:false,period:record.day,gains:changes.filter(c=>c.value>0),declines:changes.filter(c=>c.value<0)}};}
  else record.latest=snapshot;
  let summary=null;if(claim&&record.shown!==day){summary=record.pending??{first:true,period:day,gains:[],declines:[]};record.shown=day;record.pending=null;}
  const encoded=JSON.stringify(record);if(this.store.read(this.key)!==encoded)this.store.write(this.key,encoded);return summary;
 }
 capture(state){this.update(state);}
 claim(state){return this.update(state,true);}
}
