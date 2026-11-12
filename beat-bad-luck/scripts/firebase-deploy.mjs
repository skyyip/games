import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {FIREBASE_CONFIG} from '../src/firebase-settings.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const required=['apiKey','authDomain','projectId','appId'];
if(!FIREBASE_CONFIG||!required.every(k=>typeof FIREBASE_CONFIG[k]==='string'&&FIREBASE_CONFIG[k].trim()&&!/YOUR_|REPLACE_/i.test(FIREBASE_CONFIG[k]))){console.error('此遊戲尚未填妥獨立 Firebase Web App 設定；請先編輯本資料夾的 src/firebase-settings.js。未執行部署。');process.exit(1);}
const args=['deploy','--only','firestore:rules,firestore:indexes','--project',FIREBASE_CONFIG.projectId,'--config',fileURLToPath(new URL('../firebase.json',import.meta.url))];
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({cwd:root,command:'firebase',args}));}else{const result=spawnSync('firebase',args,{cwd:root,stdio:'inherit'});if(result.error){console.error('未能執行 Firebase CLI，請先安裝 firebase-tools 並登入正確帳戶。');process.exit(1);}process.exit(result.status??1);}
