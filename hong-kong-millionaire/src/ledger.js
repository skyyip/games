import {hkDay,newRun,act,BANK_VERSION} from './game.js';
const KEY='sky.hk-millionaire.today.v1';
export class DailyLedger{
 constructor({storage=localStorage,now=()=>Date.now()}={}){this.storage=storage;this.now=now;this.available=true;try{const key=KEY+'.probe';storage.setItem(key,'1');if(storage.getItem(key)!=='1')throw Error();storage.removeItem(key);}catch{this.available=false;}}
 read(){try{const p=JSON.parse(this.storage.getItem(KEY));return p?.day===hkDay(this.now())?p:null;}catch{return null;}}
 write(value){if(!this.available)throw Error('storage-required');this.storage.setItem(KEY,JSON.stringify(value));if(this.read()?.token!==value.token)throw Error('other-tab');return value;}
 async start(uid='guest'){
  const begin=()=>{const current=this.read();if(current){if(current.owner!==uid)throw Error(current.owner==='guest'?'guest-used':'account-used');return current;}return this.write({day:hkDay(this.now()),owner:uid,token:crypto.randomUUID(),revision:0,run:uid==='guest'?newRun(hkDay(this.now()),this.now()):null});};
  return globalThis.window&&globalThis.navigator?.locks?navigator.locks.request('hk-millionaire-daily',async()=>begin()):begin();
 }
 markCloud(uid,run){const current=this.read();if(current?.owner==='guest')throw Error('guest-used');return this.write({day:run.day,owner:uid,token:current?.owner===uid?current.token:crypto.randomUUID(),revision:(current?.revision??0)+1,run:null});}
 async action(action,token){const change=()=>{const current=this.read();if(!current||current.owner!=='guest'||current.token!==token||current.run?.bankVersion!==BANK_VERSION)throw Error('other-tab');return this.write({...current,revision:current.revision+1,run:act(current.run,action,this.now())});};return globalThis.window&&globalThis.navigator?.locks?navigator.locks.request('hk-millionaire-daily',async()=>change()):change();}
}
export const LEDGER_KEY=KEY;
