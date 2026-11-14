import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {FIREBASE_CONFIG} from '../src/firebase-settings.js';
if(FIREBASE_CONFIG?.projectId!=='sky-playground-millionaire')throw Error('Unexpected project: deployment stopped');
const args=['deploy','--only','firestore:rules,firestore:indexes','--project',FIREBASE_CONFIG.projectId,'--config',fileURLToPath(new URL('../firebase.json',import.meta.url))];
if(process.argv.includes('--dry-run'))console.log(JSON.stringify({cwd:fileURLToPath(new URL('../',import.meta.url)),command:'firebase',args}));else{const result=spawnSync('firebase',args,{cwd:fileURLToPath(new URL('../',import.meta.url)),stdio:'inherit'});if(result.error)console.error('請先安裝 Firebase CLI 並登入正確帳戶。');process.exit(result.status??1);}
