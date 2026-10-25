import {MAX_DISTANCE} from './game.js';
export const STORAGE_KEY='flick-force.records.v1';
const valid=r=>r&&typeof r.distance==='number'&&Number.isFinite(r.distance)&&r.distance>0&&r.distance<=MAX_DISTANCE+.001&&
  ['up','down'].includes(r.direction)&&typeof r.date==='string'&&Number.isFinite(Date.parse(r.date));
export function readRecords(storage){
  let raw;
  try{raw=storage?.getItem(STORAGE_KEY);}catch{return {records:[],available:false};}
  try{
    const saved=JSON.parse(raw??'null');
    return {records:saved?.version===1&&Array.isArray(saved.records)?saved.records.filter(valid).sort((a,b)=>b.distance-a.distance).slice(0,3):[],available:Boolean(storage)};
  }catch{return {records:[],available:Boolean(storage)};}
}
export function addRecord(records,result,date=new Date().toISOString()){
  const entry={distance:result.distance,direction:result.direction,date};
  if(!valid(entry))throw new RangeError('Invalid flick result');
  const next=[...records.filter(valid),entry].sort((a,b)=>b.distance-a.distance).slice(0,3);
  return {records:next,rank:next.includes(entry)?next.indexOf(entry)+1:null};
}
export function saveRecords(storage,records){
  try{storage.setItem(STORAGE_KEY,JSON.stringify({version:1,records:records.filter(valid).slice(0,3)}));return true;}catch{return false;}
}
