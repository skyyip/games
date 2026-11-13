import assert from 'node:assert/strict';
import {readdir,lstat,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';

const root=resolve(process.argv[2]??'_site');
let files=0,directories=0;
async function check(path){
 const info=await lstat(path),label=relative(root,path)||'.';
 assert(!info.isSymbolicLink(),`${label}: release must not contain symlinks`);
 const directory=info.isDirectory(),expected=directory?0o755:0o644;
 assert.equal(info.mode&0o7777,expected,`${label}: expected ${expected.toString(8)}, got ${(info.mode&0o7777).toString(8)}`);
 if(directory){directories++;for(const entry of await readdir(path))await check(resolve(path,entry));}else files++;
}
await check(root);
await access(resolve(root,'index.html'));
await access(resolve(root,'.htaccess'));
console.log(`Release permissions passed: ${directories} directories at 755 and ${files} files at 644.`);
