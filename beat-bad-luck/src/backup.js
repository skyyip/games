import {readProgress} from './progress.js';
export const BACKUP_LIMIT=256*1024;
const encoder=new TextEncoder(),AAD=encoder.encode('beat-bad-luck:portable-backup:2'),ALGORITHM='AES-256-GCM';
// Shared client key keeps exports opaque, not server-authoritative or cheat-proof.
// Keep this key stable so exported files remain portable across future releases.
const KEY_HEX='d0695c9512ff0559d136fda638c180d9b91b2dabc38cf72f34e2bf12b3754b3f';let keyPromise;
function cryptoKey(){
 if(!globalThis.crypto?.subtle)throw new Error('backup-crypto');
 return keyPromise??=crypto.subtle.importKey('raw',Uint8Array.from(KEY_HEX.match(/../g),b=>parseInt(b,16)),'AES-GCM',false,['encrypt','decrypt']);
}
function base64(bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
function unbase64(raw){
 if(typeof raw!=='string'||!raw.length||raw.length>BACKUP_LIMIT||raw.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(raw))throw new Error('backup-format');
 let bytes;try{bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));}catch{throw new Error('backup-format');}
 if(base64(bytes)!==raw)throw new Error('backup-format');return bytes;
}
function checkedProgress(backup,now){
 const p=backup?.progress;
 if(backup?.game!=='beat-bad-luck'||backup.format!==1||!p||p.version!==1||!Number.isFinite(p.coins)||!Number.isFinite(p.merit)||!Array.isArray(p.owned)||!p.decor||typeof p.decor!=='object'||Array.isArray(p.decor)||!Number.isFinite(p.lastSeen))throw new Error('backup-format');
 return readProgress(JSON.stringify(p),now);
}
export async function createBackup(state,now=Date.now()){
 const plain=encoder.encode(JSON.stringify({game:'beat-bad-luck',format:1,exportedAt:now,progress:readProgress(JSON.stringify(state),now)}));
 if(plain.length>BACKUP_LIMIT)throw new Error('backup-size');
 const key=await cryptoKey(),iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:AAD,tagLength:128},key,plain);
 const raw=JSON.stringify({game:'beat-bad-luck',format:2,algorithm:ALGORITHM,iv:base64(iv),data:base64(new Uint8Array(encrypted))});
 if(encoder.encode(raw).length>BACKUP_LIMIT)throw new Error('backup-size');return raw;
}
export async function parseBackup(raw,now=Date.now()){
 if(typeof raw!=='string'||encoder.encode(raw).length>BACKUP_LIMIT)throw new Error('backup-size');
 let backup;try{backup=JSON.parse(raw);}catch{throw new Error('backup-format');}
 if(backup?.game!=='beat-bad-luck'||backup.format!==2||backup.algorithm!==ALGORITHM||'progress' in backup)throw new Error('backup-format');
 const iv=unbase64(backup.iv),encrypted=unbase64(backup.data);if(iv.length!==12||encrypted.length<17)throw new Error('backup-format');
 const key=await cryptoKey();let plain;
 try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:AAD,tagLength:128},key,encrypted);}catch{throw new Error('backup-integrity');}
 let decoded;try{decoded=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plain));}catch{throw new Error('backup-format');}
 return checkedProgress(decoded,now);
}
