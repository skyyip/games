import test from 'node:test';import assert from 'node:assert/strict';
import {createBackup,parseBackup} from '../src/backup.js';
import {fresh,buyWeapon,consumeWeapon,readProgress,reward} from '../src/progress.js';
import {PATRONS} from '../src/ritual-rewards.js';
test('exports use fresh AES-GCM nonces and hide progress, with passwordless portable round trips',async()=>{
 const state={...fresh(100),coins:4567,merit:8910},one=await createBackup(state,200),two=await createBackup(state,200),a=JSON.parse(one),b=JSON.parse(two);
 assert.equal(a.format,3);assert.equal(a.signatureAlgorithm,'HMAC-SHA-256');assert.equal(Buffer.from(a.signature,'base64').length,32);assert.equal(a.algorithm,'AES-256-GCM');assert.equal(a.progress,undefined);assert.equal(one.includes('"coins"'),false);assert.equal(one.includes('"merit"'),false);assert.notEqual(a.iv,b.iv);assert.notEqual(a.data,b.data);assert.equal(Buffer.from(a.iv,'base64').length,12);
 assert.deepEqual(await parseBackup(one,200),readProgress(JSON.stringify(state),200));assert.deepEqual(await parseBackup(two,200),readProgress(JSON.stringify(state),200));
});
test('editing ciphertext, its authentication tag or IV is rejected; valid plain JSON cannot bypass encryption',async()=>{
 const raw=await createBackup(fresh(0),0),original=JSON.parse(raw);
 for(const [key,index]of [['iv',0],['data',0],['data',-1]]){
  const bytes=Buffer.from(original[key],'base64');bytes[index<0?bytes.length-1:index]^=1;
  await assert.rejects(()=>parseBackup(JSON.stringify({...original,[key]:bytes.toString('base64')}),0),/backup-integrity/);
 }
 for(const changed of [{...original,format:1},{...original,algorithm:'AES-CBC'},{...original,progress:{...fresh(0),coins:999999}},{game:'beat-bad-luck',format:1,progress:fresh(0)},fresh(0)])await assert.rejects(()=>parseBackup(JSON.stringify(changed),0),/backup-format/);
 for(const iv of ['!', 'AAAA', original.iv+'='])await assert.rejects(()=>parseBackup(JSON.stringify({...original,iv}),0),/backup-format/);
});
test('portable backup round-trips balances, remaining uses, records, stall expiry and collections',async()=>{
 let state=buyWeapon({...fresh(100),coins:10000,merit:9000},'paper');state=consumeWeapon(state,'paper');state.decor.cat=2;state.decorExpires.cat=100000;state.records=[{score:999,hits:10,weapon:'paper',date:1}];state.neighbourhood.title='rhythm';
 const exported=(await createBackup(state,200));assert.deepEqual((await parseBackup(exported,200)),readProgress(JSON.stringify(state),200));assert.equal((await parseBackup(exported,200)).weaponUses.paper,7);assert.equal((await parseBackup(exported,200)).decorExpires.cat,100000);
});
test('invalid, unrelated, oversized or unsupported files are rejected instead of resetting progress',async()=>{
 for(const raw of ['', 'null','{}','not json','[]',JSON.stringify({game:'another',format:1,progress:fresh(0)}),JSON.stringify({game:'beat-bad-luck',format:2,progress:fresh(0)}),JSON.stringify({game:'beat-bad-luck',format:1,progress:{version:1}}),' '.repeat(262145)])await assert.rejects(()=>parseBackup(raw,0));
});
test('legacy kits receive three uses; empty or invalid counters cannot revive spent inventory',()=>{
 const legacy=readProgress(JSON.stringify({version:1,owned:['paper'],equipped:'paper'}),0);assert.equal(legacy.weaponUses.paper,3);
 const spent=readProgress(JSON.stringify({...legacy,weaponUses:{paper:0,unknown:100}}),0);assert.ok(!spent.owned.includes('paper'));assert.equal(spent.equipped,'bare-hand');assert.deepEqual(spent.weaponUses,{});
 assert.equal(readProgress(JSON.stringify({...legacy,weaponUses:{paper:100}}),0).weaponUses.paper,100);
 assert.equal(readProgress(JSON.stringify({...legacy,weaponUses:{paper:1e9}}),0).weaponUses.paper,999999);
});
test('legacy version-one saves retain balances, old stock, patrons, chapters, collections and expiry through reload and backup',async()=>{
 const legacy={...fresh(1000),coins:12345,merit:117612,rituals:27,owned:['bare-hand','immunity-token','paper'],equipped:'immunity-token',weaponUses:{'immunity-token':7,paper:2},ownedSkins:['plain','retriever'],selectedSkin:'retriever',skinUses:{retriever:6},friends:['waiter','star-master'],coupons:[{patron:'star-master',discount:.15,uses:1}],discovered:['secret-loudspeaker'],records:[{score:900,hits:21,weapon:'paper',date:999}],decor:{...fresh(1000).decor,cat:3},decorExpires:{cat:100000},idleCarry:.125,lastReceipt:'old-receipt',lastDaily:'2026-10-28'};
 Object.assign(legacy.neighbourhood,{active:'bridge-appeal',challenges:['rhythm'],title:'rhythm',look:'gold',scenes:['snack'],layout:['cat'],companions:['lassie'],endingSeen:['palm:requirement'],album:[{id:'old-card',skin:'retriever',kind:'work',weapon:'paper',score:900,hits:21,perfect:3,wear:.4,move:'tap',stamp:'rhythm',endingId:'palm:requirement',at:999}]});legacy.neighbourhood.chapters['bridge-appeal']=2;delete legacy.neighbourhood.chapters['night-market'];delete legacy.neighbourhood.chapters['rooftop-parcel'];
 for(const restored of [readProgress(JSON.stringify(legacy),1000),(await parseBackup((await createBackup(legacy,1000)),1000))]){for(const key of ['version','coins','merit','rituals','owned','equipped','weaponUses','ownedSkins','selectedSkin','skinUses','friends','coupons','discovered','records','decor','decorExpires','idleCarry','lastReceipt','lastDaily'])assert.deepEqual(restored[key],legacy[key],key);for(const key of ['active','challenges','title','look','scenes','layout','companions','endingSeen','album','totals'])assert.deepEqual(restored.neighbourhood[key],legacy.neighbourhood[key],key);for(const [id,chapter]of Object.entries(legacy.neighbourhood.chapters))assert.equal(restored.neighbourhood.chapters[id],chapter);assert.equal(restored.neighbourhood.chapters['night-market'],0);assert.equal(restored.neighbourhood.chapters['rooftop-parcel'],0);}
});
test('all earned patron coupons survive reload and backup, including new legendary welcome gifts',async()=>{let state=fresh(0);for(let index=0;index<PATRONS.length;index++)state=reward(state,{score:100,hits:1,weapon:'bare-hand',fed:true,blessed:true},{id:'coupon-'+index,now:1000,random:()=>0}).state;assert.ok(state.coupons.length>=PATRONS.filter(patron=>patron.discount>0).length);for(const patron of PATRONS.filter(p=>p.discount>0))assert.ok(state.coupons.some(c=>c.patron===patron.id&&c.discount===patron.discount));for(const restored of [readProgress(JSON.stringify(state),1000),(await parseBackup((await createBackup(state,1000)),1000))]){assert.deepEqual(restored.coupons,state.coupons);assert.deepEqual(restored.friends,state.friends);}});
