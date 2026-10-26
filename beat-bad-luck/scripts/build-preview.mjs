import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),repo=resolve(root,'..');
const output=resolve(process.argv[2]||join(tmpdir(),'playground-previews'));
const esbuild=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const build=esbuild.build||esbuild.default.build;
const types={'.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
async function data(path){return `data:${types[extname(path)]||'application/octet-stream'};base64,${(await readFile(path)).toString('base64')}`;}
async function replaceAsync(source,pattern,fn){const matches=[...source.matchAll(pattern)];let result='',last=0;for(const match of matches){result+=source.slice(last,match.index)+await fn(match);last=match.index+match[0].length;}return result+source.slice(last);}
const document=await readFile(join(root,'index.html'),'utf8');
let html=await replaceAsync(document,/<link rel="stylesheet" href="(\.\.?\/[^"]+)">/g,async match=>{const path=resolve(root,match[1]);const css=await replaceAsync(await readFile(path,'utf8'),/url\(['"]?(\.\.?\/[^)'"\s]+)['"]?\)/g,async m=>`url("${await data(resolve(dirname(path),m[1]))}")`);return `<style>${css}</style>`;});
html=html.replace(/<script\b[^>]*type="module"[^>]*src="[^"]+"[^>]*><\/script>/g,'');
html=await replaceAsync(html,/<script\b[^>]*src="(\.\.?\/[^"]+)"[^>]*><\/script>/g,async m=>`<script>${(await readFile(resolve(root,m[1]),'utf8')).replace(/<\/script/gi,'<\\/script')}</script>`);
html=await replaceAsync(html,/<img\b[^>]*>/g,async m=>replaceAsync(m[0],/src="(\.\.?\/[^"]+)"/g,async src=>`src="${await data(resolve(root,src[1].split('?')[0]))}"`));
html=await replaceAsync(html,/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g,async m=>replaceAsync(m[0],/href="(\.\.?\/[^"]+)"/g,async href=>`href="${await data(resolve(root,href[1]))}"`));
html=html.replace(/<link rel="manifest"[^>]*>/g,'').replace('href="../"','href="https://skyyip.github.io/games/"').replace('href="./"','href="https://skyyip.github.io/games/beat-bad-luck/"');
const initialState="try{storage=localStorage;state=readProgress(storage.getItem(STORAGE_KEY));}catch{state=readProgress(null);persistent=false;}";
const seed={version:1,coins:99999,merit:99999,owned:['bare-hand','flying-dagger','plunger-nunchucks','beauty-fist','solar-torch','immunity-token','flipflop'],equipped:'flipflop',decor:{},records:[]};
await mkdir(output,{recursive:true});
for(const demo of [false,true]){
 const bundled=await build({stdin:{contents:`import ${JSON.stringify(join(repo,'grid-rush/src/playground-ui.js'))};import ${JSON.stringify(join(root,'src/app.js'))};`,resolveDir:root,loader:'js'},bundle:true,write:false,format:'iife',platform:'browser',target:'es2020',charset:'utf8',minify:true,legalComments:'none',plugins:demo?[{name:'visit-only-kit-preview',setup(api){api.onLoad({filter:/app\.js$/},async args=>{if(args.path!==join(root,'src/app.js'))return;const source=await readFile(args.path,'utf8');if(!source.includes(initialState))throw new Error('Preview state initialization no longer matches app.js');return {contents:source.replace(initialState,`state=readProgress(JSON.stringify({...${JSON.stringify(seed)},lastSeen:Date.now()}));persistent=false;storage=null;`),loader:'js'};});}}]:[]});
 let page=html.replace('</body>',()=>`<script data-preview-bundle>${bundled.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script></body>`);
 if(demo)page=page.replace('<main id="app">','<main id="app"><p translate="no" style="padding:12px 15px;border:1px dashed #edc77e;border-radius:12px;background:#29463e;color:#f2dfad;font-size:13px;line-height:1.6">六款法寶試玩：可用「更改除厄法寶」切換，先打 12 下便可發動招牌技。這個預覽的進度只保留至關閉或重新整理。</p>');
 if(page.includes('data:text/javascript')||page.includes('Object.defineProperty(window,\'localStorage\''))throw new Error('Preview still depends on nested modules or global storage replacement');
 const name=demo?'beat-bad-luck-skills-demo.html':'beat-bad-luck.html';await writeFile(join(output,name),page);
 if(demo)await writeFile(join(output,'beat-bad-luck-six-kits.html'),page);
 console.log(`${name}: ${Buffer.byteLength(page)} bytes, single inline bundle, ${demo?'visit-only six-kit state':'normal game state'}`);
}
