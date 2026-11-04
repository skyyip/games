import {SAVE_KEY,LifeGame} from './game.js';
export const accountSaveKey=uid=>uid?`${SAVE_KEY}.account.${encodeURIComponent(uid)}`:SAVE_KEY;
export class AccountStore{
 constructor(storage=null){this.storage=storage;this.memory=new Map();this.persistent=!!storage;}
 read(key){try{const value=this.storage?.getItem(key);if(value!==null&&value!==undefined){this.memory.set(key,value);return value;}}catch{this.persistent=false;}return this.memory.get(key)??null;}
 write(key,value){this.memory.set(key,value);try{if(this.storage)this.storage.setItem(key,value);else this.persistent=false;}catch{this.persistent=false;}return this.persistent;}
 load(uid){const raw=this.read(accountSaveKey(uid));return raw?LifeGame.restore(raw):null;}
 save(uid,state){return this.write(accountSaveKey(uid),JSON.stringify(state));}
}
