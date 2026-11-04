import {LifeGame} from './game.js';
import {accountSaveKey} from './account-store.js';
export const LIFE_DB='career-365.lives.v2';
const request=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
const complete=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error??Error('storage'));});
export class LifeRepository{
 constructor(store,{indexedDB=globalThis.indexedDB,locks=globalThis.navigator?.locks}={}){this.store=store;this.indexedDB=indexedDB;this.locks=locks;this.tokens=new Map();this.recoveries=new Map();this.persistent=!!indexedDB;this.unsaved=false;}
 async db(){if(!this.indexedDB)return null;if(!this.opening)this.opening=new Promise((resolve,reject)=>{const r=this.indexedDB.open(LIFE_DB,1);r.onupgradeneeded=()=>{r.result.createObjectStore('lives');r.result.createObjectStore('panels');};r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('blocked'));});try{return await this.opening;}catch{this.persistent=false;return null;}}
 async load(uid){const key=accountSaveKey(uid),db=await this.db();if(db){const tx=db.transaction(['lives','panels'],'readonly'),done=complete(tx),meta=await request(tx.objectStore('lives').get(key));if(meta){const panels=await request(tx.objectStore('panels').getAll(IDBKeyRange.bound([key,meta.run,0],[key,meta.run,8000])));await done;const g=LifeGame.restore({...meta.state,panels},{copy:false});if(!g||panels.length!==meta.count)throw Error('invalid-save');this.tokens.set(key,{revision:meta.revision,run:meta.run});try{await this.recoverLegacy(db,key);}catch{this.persistent=false;this.unsaved=true;}return g;}await done;}
  const raw=this.store.read(key);let legacy;try{legacy=raw?JSON.parse(raw):null;}catch{}if(legacy?.format==='idb-v1')throw Error('storage-unavailable');const g=legacy?LifeGame.restore(legacy,{copy:false}):null;this.tokens.set(key,{revision:0,run:null,legacy:raw});if(g&&db)try{await this.save(uid,g.s,{replace:true});}catch(e){if(e.message==='local-conflict')throw e;this.persistent=false;this.unsaved=true;}return g;
 }
 async recoverLegacy(db,key){const raw=this.store.read(key);let old;try{old=raw?JSON.parse(raw):null;}catch{}if(Array.isArray(old?.panels)&&LifeGame.restore(old,{copy:false})){this.recoveries.set(key,raw);const tx=db.transaction('panels','readwrite'),done=complete(tx);tx.objectStore('panels').put({snapshot:raw},[key,'legacy-recovery',0]);await done;this.recoveries.set(key,raw);}else{const tx=db.transaction('panels','readonly'),done=complete(tx),r=await request(tx.objectStore('panels').get([key,'legacy-recovery',0]));await done;if(r?.snapshot)this.recoveries.set(key,r.snapshot);}}
 async check(uid){const key=accountSaveKey(uid),token=this.tokens.get(key)??{revision:0,run:null},db=await this.db();if(db){const tx=db.transaction('lives','readonly'),done=complete(tx),meta=await request(tx.objectStore('lives').get(key));await done;if((meta?.revision??0)!==token.revision||(meta?.run??null)!==token.run)throw Error('local-conflict');}else if(this.store.read(key)!==token.legacy)throw Error('local-conflict');return token;}
 async save(uid,state,{replace=false}={}){const key=accountSaveKey(uid),token=this.tokens.get(key)??{revision:0,run:null},db=await this.db();
  if(!db){if(this.store.read(key)!==token.legacy)throw Error('local-conflict');const raw=JSON.stringify(state);this.store.write(key,raw);this.tokens.set(key,{revision:0,run:null,legacy:raw});this.persistent=this.store.persistent;return this.persistent;}
  const tx=db.transaction(['lives','panels'],'readwrite'),done=complete(tx);try{const lives=tx.objectStore('lives'),frames=tx.objectStore('panels'),old=await request(lives.get(key));if((old?.revision??0)!==token.revision||(old?.run??null)!==token.run){tx.abort();await done.catch(()=>{});throw Error('local-conflict');}
   const newRun=replace||!old,run=newRun?(globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`):old.run;if(!newRun&&state.panels.length<old.count){tx.abort();await done.catch(()=>{});throw Error('invalid-save');}
   if(newRun&&old)frames.delete(IDBKeyRange.bound([key,old.run,0],[key,old.run,8000]));
   for(let i=newRun?0:old.count;i<state.panels.length;i++)frames.put(state.panels[i],[key,run,i]);
   const {panels,...rest}=state,revision=(old?.revision??0)+1;lives.put({state:rest,run,revision,count:panels.length},key);await done;this.tokens.set(key,{revision,run});this.unsaved=false;this.persistent=true;
   // A small notification/summary only; the complete life stays in IndexedDB.
   this.store.write(key,JSON.stringify({format:'idb-v1',revision,run,name:state.profile.name,month:state.month,count:panels.length}));return true;
  }catch(e){if(e.message==='local-conflict'||e.message==='invalid-save')throw e;this.unsaved=true;this.persistent=false;throw Error('storage-write');}
 }
 async exclusive(uid,fn){const execute=async()=>{await this.check(uid);return fn();};return this.locks?this.locks.request('career-365.life.'+accountSaveKey(uid),execute):execute();}
}
