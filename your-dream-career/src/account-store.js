import {FIREBASE_CONFIG} from './firebase-settings.js';
import {SAVE_KEY,LifeGame} from './game.js';
export const accountScope=(uid,projectId=FIREBASE_CONFIG?.projectId)=>uid?(projectId?`${projectId}:${uid}`:uid):null;
export const identityStorageKey=(projectId=FIREBASE_CONFIG?.projectId)=>projectId?`your-dream-career.identity.v1.${encodeURIComponent(projectId)}`:'your-dream-career.identity.v1';
export const accountSaveKey=(uid,projectId=FIREBASE_CONFIG?.projectId)=>uid?`${SAVE_KEY}.account.${projectId?encodeURIComponent(projectId)+'.':''}${encodeURIComponent(uid)}`:SAVE_KEY;
export class AccountStore{
 constructor(storage=null){this.storage=storage;this.memory=new Map();this.persistent=!!storage;}
 read(key){try{const value=this.storage?.getItem(key);if(value!==null&&value!==undefined){this.memory.set(key,value);return value;}}catch{this.persistent=false;}return this.memory.get(key)??null;}
 write(key,value){this.memory.set(key,value);try{if(this.storage)this.storage.setItem(key,value);else this.persistent=false;}catch{this.persistent=false;}return this.persistent;}
 load(uid){const raw=this.read(accountSaveKey(uid));return raw?LifeGame.restore(raw):null;}
 save(uid,state){return this.write(accountSaveKey(uid),JSON.stringify(state));}
}
