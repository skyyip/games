import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,readProgress} from '../src/progress.js';
import {preserveTransferredItems} from '../src/backup-restore.js';
import {createBackup,parseBackupFile} from '../src/backup.js';
const at=100000,stamp=t=>({toMillis:()=>t});
test('backup parsing exposes its authenticated export time without changing legacy progress parsing',async()=>{
 const source={...fresh(at),coins:987},raw=await createBackup(source,at),parsed=await parseBackupFile(raw,at+1);
 assert.equal(parsed.exportedAt,at);assert.equal(parsed.state.coins,987);
});
test('restoring progress preserves live counts and expiry of transferred paper, kits and decorations',()=>{
 const backup=fresh(at),current=fresh(at+1000);backup.coins=9000;backup.merit=888;
 backup.owned.push('paper');backup.weaponUses.paper=5;backup.equipped='paper';
 backup.ownedSkins.push('paper');backup.skinUses.paper=4;backup.selectedSkin='paper';
 backup.decor.tiger=3;backup.decorExpires.tiger=at+50000;
 current.owned.push('paper');current.weaponUses.paper=2;current.decor.tiger=1;current.decorExpires.tiger=at+10000;
 const gifts=['w_paper','s_paper','d_tiger'].map(token=>({token,updatedAt:stamp(at+1)}));
 const result=preserveTransferredItems(backup,current,gifts,at,at+1000);
 assert.equal(result.protectedItems,3);assert.equal(result.state.coins,9000);assert.equal(result.state.merit,888);
 assert.equal(result.state.weaponUses.paper,2);assert(!result.state.ownedSkins.includes('paper'));assert.equal(result.state.selectedSkin,'plain');
 assert.equal(result.state.decor.tiger,1);assert.equal(result.state.decorExpires.tiger,current.decorExpires.tiger);
 assert.equal(backup.weaponUses.paper,5);assert.equal(backup.decor.tiger,3);
});
test('unaffected inventory restores fully and repeated imports never re-add transferred quantities',()=>{
 const backup=fresh(at),current=fresh(at+1000);backup.owned.push('paper');backup.weaponUses.paper=5;
 const old=preserveTransferredItems(backup,current,[{token:'w_paper',updatedAt:stamp(at-1)}],at,at+1000);
 assert.equal(old.protectedItems,0);assert.equal(old.state.weaponUses.paper,5);
 const gifts=[{token:'w_paper',updatedAt:stamp(at+1)},{token:'w_paper',updatedAt:stamp(at+2)}];
 const first=preserveTransferredItems(backup,current,gifts,at,at+1000),second=preserveTransferredItems(backup,first.state,gifts,at,at+1000);
 assert(!first.state.owned.includes('paper'));assert.equal(first.protectedItems,1);assert.deepEqual(first.state,second.state);
 assert.deepEqual(preserveTransferredItems(backup,current,[],at,at+1000).state,readProgress(JSON.stringify(backup),at+1000));
});
