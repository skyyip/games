import {DURATIONS} from './game.js';
const empty=()=>({60:[],120:[],180:[]});
export function topThree(rows){
  return Array.isArray(rows)?rows.filter(r=>r&&Number.isSafeInteger(r.score)&&Number.isSafeInteger(r.at)&&r.at>=0).map(r=>({score:r.score,at:r.at})).sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,3):[];
}
export function readRecords(raw,legacyRaw,previousRaw){
  for(const text of [raw,previousRaw])try{const data=JSON.parse(text);if([2,3].includes(data?.version))return {60:topThree(data.modes?.[60]),120:topThree(data.modes?.[120]),180:topThree(data.modes?.[180])};}catch{}
  const records=empty();
  try{const legacy=JSON.parse(legacyRaw);for(const mode of [60,120])if(Number.isSafeInteger(legacy?.[mode]))records[mode]=[{score:legacy[mode],at:0}];}catch{}
  return records;
}
export function addRecord(records,mode,score,at){
  if(!DURATIONS.includes(mode)||!Number.isSafeInteger(score)||!Number.isSafeInteger(at)||at<0)throw new RangeError('Invalid round record.');
  return {...records,[mode]:topThree([...records[mode],{score,at}])};
}
