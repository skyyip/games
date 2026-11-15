import {hkDay,newRun,act,SUPPORTED_BANK_VERSIONS} from './game.js';
import {DAILY_KEY} from './schema.js';
const KEY=DAILY_KEY;
// A local reservation does not prove that a cloud run was created.
export const pendingAccount=entry=>!!entry&&entry.owner!=='guest'&&entry.run===null&&entry.revision===0&&entry.state==='pending';
const core=({accounts,...entry})=>entry;
function markers(record){const all=new Map(Object.entries(record?.accounts??{}));if(record?.owner&&record.owner!=='guest')all.set(record.owner,core(record));return all;}
function activate(all,entry){const others=new Map(all);others.delete(entry.owner);return {...core(entry),...(others.size?{accounts:Object.fromEntries(others)}:{})};}
export class DailyLedger{
 constructor({storage=localStorage,now=()=>Date.now()}={}){this.storage=storage;this.now=now;this.available=true;try{const key=KEY+'.probe';storage.setItem(key,'1');if(storage.getItem(key)!=='1')throw Error();storage.removeItem(key);}catch{this.available=false;}}
 read(){try{const p=JSON.parse(this.storage.getItem(KEY));return p?.day===hkDay(this.now())?p:null;}catch{return null;}}
 readAccount(uid){const current=this.read();return current?.owner===uid?current:markers(current).get(uid)??null;}
 write(value){if(!this.available)throw Error('storage-required');this.storage.setItem(KEY,JSON.stringify(value));if(this.read()?.token!==value.token)throw Error('other-tab');return value;}
 async start(uid='guest'){
  const begin=()=>{
   const current=this.read();
   if(current?.owner==='guest'){if(uid!=='guest')throw Error('guest-used');return current;}
   if(uid==='guest'){if(current)throw Error('account-used');return this.write({day:hkDay(this.now()),owner:uid,token:crypto.randomUUID(),revision:0,run:newRun(hkDay(this.now()),this.now())});}
   const all=markers(current),entry=all.get(uid)??{day:hkDay(this.now()),owner:uid,token:crypto.randomUUID(),revision:0,state:'pending',run:null};
   return this.write(activate(all,entry));
  };
  return globalThis.window&&globalThis.navigator?.locks?navigator.locks.request('hk-millionaire-daily',async()=>begin()):begin();
 }
 markCloud(uid,run){const current=this.read();if(current?.owner==='guest')throw Error('guest-used');const all=markers(current),previous=all.get(uid);return this.write(activate(all,{day:run.day,owner:uid,state:'confirmed',token:previous?.token??crypto.randomUUID(),revision:(previous?.revision??0)+1,run:null}));}
 async releaseUnclaimed(uid,token){
  // The caller must first establish absence with a server-only read. Never clear confirmed runs.
  const release=()=>{
   const current=this.read(),all=markers(current),entry=all.get(uid);
   if(!pendingAccount(entry)||entry.token!==token)return false;
   all.delete(uid);
   if(!all.size){this.storage.removeItem(KEY);return !this.read();}
   // Releasing one failed account must preserve every other account's consumed / unknown attempt.
   const next=all.get(current.owner)??[...all.values()].find(item=>!pendingAccount(item))??all.values().next().value;
   this.write(activate(all,next));return true;
  };
  return globalThis.window&&globalThis.navigator?.locks?navigator.locks.request('hk-millionaire-daily',async()=>release()):release();
 }
 async action(action,token){const change=()=>{const current=this.read();if(!current||current.owner!=='guest'||current.token!==token||!SUPPORTED_BANK_VERSIONS.includes(current.run?.bankVersion))throw Error('other-tab');return this.write({...current,revision:current.revision+1,run:act(current.run,action,this.now())});};return globalThis.window&&globalThis.navigator?.locks?navigator.locks.request('hk-millionaire-daily',async()=>change()):change();}
}
export const LEDGER_KEY=KEY;
