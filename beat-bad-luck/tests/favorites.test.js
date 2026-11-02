import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,toggleFavorite,readProgress} from '../src/progress.js';
import {createBackup,parseBackup} from '../src/backup.js';
import {postcardSvg} from '../src/postcard.js';
import {finishNeighbourhood} from '../src/neighbourhood.js';
import {paperWearStyle} from '../src/art.js';
test('favorites toggle owned or wishlisted items without spending, equipping or changing inventory',()=>{
 const state={...fresh(0),coins:5000,merit:7000,owned:['bare-hand','paper'],equipped:'paper',weaponUses:{paper:7}};
 for(const [kind,id,key]of [['weapon','film-magic-brush','favoriteWeapons'],['skin','duck','favoriteSkins']]){const saved=toggleFavorite(state,kind,id);assert.deepEqual(saved[key],[id]);assert.deepEqual(toggleFavorite(saved,kind,id)[key],[]);for(const field of ['coins','merit','owned','equipped','weaponUses','ownedSkins','selectedSkin'])assert.deepEqual(saved[field],state[field]);assert.deepEqual(state[key],[]);}assert.equal(toggleFavorite(state,'unknown','paper'),null);assert.equal(toggleFavorite(state,'weapon','fake'),null);
});
test('legacy saves gain empty favorites; valid favorites survive reload and backup while malformed IDs are rejected',async()=>{
 const old={...fresh(0),coins:1234};delete old.favoriteWeapons;delete old.favoriteSkins;const restored=readProgress(JSON.stringify(old),0);assert.deepEqual(restored.favoriteWeapons,[]);assert.deepEqual(restored.favoriteSkins,[]);
 const saved=toggleFavorite(toggleFavorite(restored,'weapon','secret-loudspeaker'),'skin','film-landlady');for(const copy of [readProgress(JSON.stringify(saved),0),(await parseBackup((await createBackup(saved,0)),0))]){assert.deepEqual(copy.favoriteWeapons,['secret-loudspeaker']);assert.deepEqual(copy.favoriteSkins,['film-landlady']);assert.equal(copy.coins,1234);}
 const dirty=readProgress(JSON.stringify({...saved,favoriteWeapons:['paper','fake','paper'],favoriteSkins:{duck:true}}),0);assert.deepEqual(dirty.favoriteWeapons,['paper']);assert.deepEqual(dirty.favoriteSkins,[]);
});
test('fortune previews preserve the saved paper and progressive wear without embedding controls',()=>{
 const entry={id:'saved',skin:'film-landlady',kind:'work',weapon:'paper',score:400,at:1000,wear:.6};const svg=postcardSvg(entry);assert.match(svg,/skin-film-landlady/);assert.match(svg,/paper-worn-skin/);assert.ok(svg.includes(paperWearStyle(.6)));assert.ok(!svg.includes('item-favorite'));assert.ok(!/undefined|NaN/.test(paperWearStyle(NaN)));assert.match(postcardSvg({...entry,skin:'duck'}),/skin-duck/);
});

test('plain-paper fortune photos preserve the ritual appearance variant',async()=>{const entry={kind:'work',skin:'plain',weapon:'bare-hand',score:30,at:1000,wear:.1};assert.ok(postcardSvg({...entry,look:1}).includes('m112 8 3 6'));assert.ok(!postcardSvg({...entry,look:0}).includes('m112 8 3 6'));const state=fresh(0),journey=finishNeighbourhood(state.neighbourhood,{...entry,look:1,hits:1},{id:'look-record',now:1}),saved={...state,neighbourhood:journey.state};assert.equal(readProgress(JSON.stringify(saved),1).neighbourhood.album[0].look,1);assert.equal((await parseBackup((await createBackup(saved,1)),1)).neighbourhood.album[0].look,1);});
