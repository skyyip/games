import {readProgress} from './progress.js';
export const BACKUP_LIMIT=256*1024;
export function createBackup(state,now=Date.now()){
 return JSON.stringify({game:'beat-bad-luck',format:1,exportedAt:now,progress:readProgress(JSON.stringify(state),now)},null,2);
}
export function parseBackup(raw,now=Date.now()){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>BACKUP_LIMIT)throw new Error('backup-size');
 let backup;try{backup=JSON.parse(raw);}catch{throw new Error('backup-format');}
 const p=backup?.progress;if(backup?.game!=='beat-bad-luck'||backup.format!==1||!p||p.version!==1||!Number.isFinite(p.coins)||!Number.isFinite(p.merit)||!Array.isArray(p.owned)||!p.decor||typeof p.decor!=='object'||Array.isArray(p.decor)||!Number.isFinite(p.lastSeen))throw new Error('backup-format');
 return readProgress(JSON.stringify(p),now);
}
