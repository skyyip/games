import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
test('social deployment uploads a prebuilt Node22 backend and supplies all callable query indexes',async()=>{
 const read=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8')),[pkg,config,indexes]=await Promise.all([read('functions/package.json'),read('firebase.json'),read('firestore.indexes.json')]);
 assert.equal(pkg.main,'dist/index.mjs');assert.equal(pkg.engines.node,'22');assert.equal(pkg.scripts['gcp-build'],'');assert(pkg.scripts.build.includes('build-social-functions.mjs'));assert.equal(config.functions.source,'functions');assert.equal(config.functions.codebase,'career-social');assert(config.functions.predeploy.some(s=>s.includes('run build')));assert(!config.functions.ignore.includes('dist'));
 for(const collection of ['career365_invites','career365_notes','career365_companies','career365_tasks'])assert(indexes.indexes.some(i=>i.collectionGroup===collection));assert(pkg.dependencies['firebase-admin']);assert(pkg.dependencies['firebase-functions']);
});
