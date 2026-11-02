import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createBackup,parseBackup} from '../src/backup.js';import {validateBackupProgress} from '../src/backup-sanity.js';
import {fresh,readProgress,MAX_WEAPON_USES} from '../src/progress.js';import {SKIN_USES} from '../src/skins.js';import {MAX_DECOR_LEVEL} from '../src/catalog.js';
test('signature edits, signature swapping, missing signatures and downgrade attempts cannot load a new file',async()=>{
 const raw=await createBackup(fresh(0),0),one=JSON.parse(raw),two=JSON.parse(await createBackup(fresh(0),0)),signature=Buffer.from(one.signature,'base64');signature[0]^=1;
 for(const bad of [{...one,signature:signature.toString('base64')},{...one,signature:two.signature},{...one,signature:''},{...one,signatureAlgorithm:'SHA-256'}])await assert.rejects(()=>parseBackup(JSON.stringify(bad),0));
 const {signature:ignored,signatureAlgorithm:ignored2,...downgrade}=one;await assert.rejects(()=>parseBackup(JSON.stringify({...downgrade,format:2}),0),/backup-integrity/);
 // Serialisation whitespace/order does not alter authenticated content.
 assert.deepEqual(await parseBackup(JSON.stringify({...one},null,2),0),fresh(0));
});
test('previous v2 encrypted exports still import and can be re-exported with a signature',async()=>{
 const old=await readFile(new URL('./fixtures/backup-v2.bblsave',import.meta.url),'utf8'),state=await parseBackup(old,0);assert.equal(state.coins,4321);assert.equal(state.merit,8765);assert.equal(state.weaponUses.paper,3);
 const upgraded=await createBackup(state,0);assert.equal(JSON.parse(upgraded).format,3);assert.deepEqual(await parseBackup(upgraded,0),state);
});
test('a correctly encrypted legacy file with invalid money fails sanity checks after decryption',async()=>{
 const invalid=await readFile(new URL('./fixtures/backup-v2-invalid.bblsave',import.meta.url),'utf8');await assert.rejects(()=>parseBackup(invalid,0),/backup-sanity/);
});
test('numeric checks reject negative, fractional, non-finite and over-cap balances before export',async()=>{
 for(const field of ['coins','merit','rituals'])for(const value of [-1,1.5,Infinity,NaN,1000001,'500']){const state={...fresh(0),[field]:value};await assert.rejects(()=>createBackup(state,0),/backup-sanity/);assert(Object.is(state[field],value));}
});
test('live catalog bounds reject forged inventory, levels, coupons and ownership combinations',()=>{
 const bad=[{owned:['bare-hand','unknown']},{equipped:'paper'},{weaponUses:{paper:1}},{ownedSkins:['plain','duck'],skinUses:{duck:SKIN_USES+1}},{decor:{cat:MAX_DECOR_LEVEL+1}},{decor:{unknown:1}},{coupons:[{patron:'star-master',discount:.99,uses:1}]},{favoriteWeapons:['paper','paper']},{altarDecor:['cat']},{idleCarry:1},{records:[{score:1000001,hits:1,weapon:'bare-hand',date:0}]},{neighbourhood:{chapters:{'bridge-appeal':999}}}];
 for(const changes of bad)assert.throws(()=>validateBackupProgress({...fresh(0),...changes}),/backup-sanity/);
 const valid={...fresh(0),coins:1e6,merit:1e6,owned:['bare-hand','paper'],weaponUses:{paper:MAX_WEAPON_USES},equipped:'paper',ownedSkins:['plain','duck'],skinUses:{duck:SKIN_USES},selectedSkin:'duck',decor:{cat:MAX_DECOR_LEVEL},decorExpires:{cat:1},coupons:[{patron:'star-master',discount:.15,uses:1}]};assert.equal(validateBackupProgress(valid),true);
});
test('an asynchronous export is a private snapshot and cannot change when the caller edits its input',async()=>{
 const state={...fresh(0),coins:123,merit:456},pending=createBackup(state,0);state.coins=999;state.merit=1000;const raw=await pending,a=await parseBackup(raw,0);assert.equal(a.coins,123);assert.equal(a.merit,456);a.coins=222;assert.equal((await parseBackup(raw,0)).coins,123);
});
test('key handles are non-extractable and mutable key/plaintext buffers are cleared after use',async()=>{
 const subtle=crypto.subtle,methods=Object.fromEntries(['importKey','encrypt','decrypt'].map(name=>[name,subtle[name]])),keyBuffers=[],plainBuffers=[],handles=[];
 subtle.importKey=async function(...args){keyBuffers.push(args[1]);assert.equal(args[3],false);const key=await methods.importKey.apply(this,args);handles.push(key);return key;};
 subtle.encrypt=function(...args){plainBuffers.push(args[2]);return methods.encrypt.apply(this,args);};
 subtle.decrypt=async function(...args){const output=await methods.decrypt.apply(this,args);plainBuffers.push(new Uint8Array(output));return output;};
 try{const isolated=await import('../src/backup.js?memory-check=1'),raw=await isolated.createBackup(fresh(0),0);assert.deepEqual(await isolated.parseBackup(raw,0),readProgress(JSON.stringify(fresh(0)),0));assert.equal(keyBuffers.length,2);assert(handles.every(key=>!key.extractable));assert(keyBuffers.every(bytes=>bytes.every(b=>b===0)));assert(plainBuffers.every(bytes=>bytes.every(b=>b===0)));}
 finally{for(const [name,method]of Object.entries(methods))subtle[name]=method;}
});
