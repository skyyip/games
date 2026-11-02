export const RECORD_KEY='frogger-jump.records.v1';
export function readRecords(raw){let data;try{data=JSON.parse(raw);}catch{return [];}return (Array.isArray(data)?data:[]).filter(r=>r&&Number.isInteger(r.score)&&r.score>0&&r.score<=1e6&&Number.isFinite(r.at)&&r.at>=0).map(r=>({score:r.score,at:r.at})).sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,3);}
export function addRecord(records,score,at=Date.now()){return readRecords(JSON.stringify([...records,{score,at}]));}
export function mergeRecords(...groups){const unique=new Map();for(const record of groups.flat())unique.set(`${record.at}:${record.score}`,record);return readRecords(JSON.stringify([...unique.values()]));}
