import {readProgress} from './progress.js';
import {validateBackupProgress} from './backup-sanity.js';
export const BACKUP_LIMIT=256*1024;
const encoder=new TextEncoder(),ALGORITHM='AES-256-GCM',SIGNATURE_ALGORITHM='HMAC-SHA-256';
const aad=version=>encoder.encode('beat-bad-luck:portable-backup:'+version);
const signedBytes=b=>encoder.encode(JSON.stringify([b.game,b.format,b.algorithm,b.signatureAlgorithm,b.iv,b.data]));
// Client-held keys are encoded at rest and imported as non-extractable handles.
// This is a casual-editing barrier, not a server trust boundary. Never rotate the
// AES key without retaining its legacy decoder: existing v2 exports depend on it.
let keyPromise;
async function importSecret(words,mask,algorithm,usages){
 const raw=new Uint8Array(32),view=new DataView(raw.buffer);
 for(let i=0;i<8;i++)view.setUint32(i*4,words[i]^((mask+Math.imul(i,0x9e3779b9))>>>0));
 try{return await crypto.subtle.importKey('raw',raw,algorithm,false,usages);}finally{raw.fill(0);}
}
function cryptoKeys(){
 if(!globalThis.crypto?.subtle)throw new Error('backup-crypto');
 return keyPromise??=Promise.all([
  importSecret([0xb7d18d31,0x170f4e04,0x751138b0,0x7a9ebe16,0x598d9523,0xbd42c56e,0x29e714e8,0x08486e8c],0x67b8d1a4,'AES-GCM',['encrypt','decrypt']),
  importSecret([0x31df9c34,0x1af8b8fd,0x79a7d4f3,0xf13fa0e3,0xd0fe4020,0xfa5317b8,0x656db02d,0x31977ba1],0x9e246f51,{name:'HMAC',hash:'SHA-256'},['sign','verify'])
 ]);
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
 if(backup.exportedAt!==undefined&&(!Number.isFinite(backup.exportedAt)||backup.exportedAt<0||backup.exportedAt>8640000000000000))throw new Error('backup-sanity');
 validateBackupProgress(p);return readProgress(JSON.stringify(p),now);
}
export async function createBackup(state,now=Date.now()){
 if(!Number.isFinite(now)||now<0||now>8640000000000000)throw new Error('backup-sanity');
 validateBackupProgress(state);
 const plain=encoder.encode(JSON.stringify({game:'beat-bad-luck',format:1,exportedAt:now,progress:readProgress(JSON.stringify(state),now)}));
 try{
  if(plain.length>BACKUP_LIMIT)throw new Error('backup-size');
  const [key,signatureKey]=await cryptoKeys(),iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(3),tagLength:128},key,plain);plain.fill(0);
  const backup={game:'beat-bad-luck',format:3,algorithm:ALGORITHM,signatureAlgorithm:SIGNATURE_ALGORITHM,iv:base64(iv),data:base64(new Uint8Array(encrypted))};
  backup.signature=base64(new Uint8Array(await crypto.subtle.sign('HMAC',signatureKey,signedBytes(backup))));
  const raw=JSON.stringify(backup);if(encoder.encode(raw).length>BACKUP_LIMIT)throw new Error('backup-size');return raw;
 }finally{plain.fill(0);}
}
export async function parseBackupFile(raw,now=Date.now()){
 if(typeof raw!=='string'||encoder.encode(raw).length>BACKUP_LIMIT)throw new Error('backup-size');
 let backup;try{backup=JSON.parse(raw);}catch{throw new Error('backup-format');}
 if(backup?.game!=='beat-bad-luck'||![2,3].includes(backup.format)||backup.algorithm!==ALGORITHM||'progress' in backup)throw new Error('backup-format');
 const allowed=backup.format===3?['game','format','algorithm','signatureAlgorithm','iv','data','signature']:['game','format','algorithm','iv','data'];
 if(Object.keys(backup).some(key=>!allowed.includes(key)))throw new Error('backup-format');
 const iv=unbase64(backup.iv),encrypted=unbase64(backup.data);if(iv.length!==12||encrypted.length<17)throw new Error('backup-format');
 const [key,signatureKey]=await cryptoKeys();
 if(backup.format===3){
  if(backup.signatureAlgorithm!==SIGNATURE_ALGORITHM)throw new Error('backup-format');
  const signature=unbase64(backup.signature);
  if(signature.length!==32||!await crypto.subtle.verify('HMAC',signatureKey,signature,signedBytes(backup)))throw new Error('backup-integrity');
 }
 let plain;
 try{plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad(backup.format),tagLength:128},key,encrypted));}catch{throw new Error('backup-integrity');}
 try{
  let decoded;try{decoded=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plain));}catch{throw new Error('backup-format');}
  return {state:checkedProgress(decoded,now),exportedAt:decoded.exportedAt??0};
 }finally{plain.fill(0);}
}
export async function parseBackup(raw,now=Date.now()){return (await parseBackupFile(raw,now)).state;}
