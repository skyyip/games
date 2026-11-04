import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
test('Spark social deploys only rules and indexes and has no Cloud Functions configuration',async()=>{
 const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8')),[config,indexes,pkg]=await Promise.all([read('firebase.json'),read('firestore.indexes.json'),read('package.json')]);
 assert.equal(config.functions,undefined);assert.equal(config.emulators.functions,undefined);assert.equal(pkg.scripts['social:build'],undefined);
 assert.equal(indexes.indexes.length,3);assert(indexes.indexes.every(i=>i.collectionGroup.startsWith('career365_spark_')));
 const r=spawnSync(process.execPath,['scripts/firebase-deploy.mjs','--social','--dry-run'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.equal(r.status,0);const d=JSON.parse(r.stdout);assert(!d.args.join(' ').includes('functions'));assert(d.args.includes('firestore:rules,firestore:indexes'));assert(d.args.includes('sky-playground-career-365'));
 const api=await readFile(new URL('../src/social-api.js',import.meta.url),'utf8');assert(api.includes('loadFirestoreSDK'));assert(!api.includes('httpsCallable'));assert(!api.includes('loadFunctionsSDK'));
});
