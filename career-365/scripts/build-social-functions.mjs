import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../tools/package.json',import.meta.url));
const {build}=require('esbuild');
await build({entryPoints:[fileURLToPath(new URL('../functions/src/index.js',import.meta.url))],outfile:fileURLToPath(new URL('../functions/dist/index.mjs',import.meta.url)),bundle:true,platform:'node',format:'esm',target:'node22',packages:'external',legalComments:'none'});
console.log('Built Career365 social callables and cleanup; Firebase Admin stays on the server.');
