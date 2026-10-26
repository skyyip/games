import {WEAPONS} from '../src/catalog.js';
import {messages} from '../../grid-rush/src/translations.js';
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
const seed={version:1,coins:999999,merit:999999,owned:WEAPONS.map(w=>w.id),equipped:'flipflop',decor:{},records:[]};

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const previewOrder=WEAPONS.filter(w=>!w.starter&&w.id!=='rebirth-paper').sort((a,b)=>a.cost-b.cost||a.merit-b.merit);previewOrder.splice(-1,0,WEAPONS.find(w=>w.id==='rebirth-paper'));previewOrder.unshift(WEAPONS.find(w=>w.starter));
const options=previewOrder.map(w=>`<option value="${w.id}" data-zh="${escape(w.nameZh||messages[w.name]||w.name)}" data-en="${escape(w.name)}"${w.id==='flipflop'?' selected':''}>${escape(w.nameZh||messages[w.name]||w.name)}</option>`).join('');
const previewBanner=`<aside id="preview-kit-picker" translate="no" style="display:grid;gap:8px;padding:14px 16px;margin-bottom:18px;border:1px dashed #edc77e;border-radius:12px;background:#29463e;color:#f2dfad;font-size:13px;line-height:1.6"><strong id="preview-kit-title">45 款法寶自由試玩</strong><label id="preview-kit-label" for="preview-kit-select">切換試玩法寶</label><select id="preview-kit-select" style="width:100%;min-height:44px;padding:9px 30px 9px 10px;border:1px solid #cbb579;border-radius:9px;background:#203e37;color:#fff0c7;font:inherit">${options}</select><small id="preview-kit-note">打 12 下即可發動招牌技。試玩進度不會儲存；重新整理後還原。</small></aside>`;
const previewControls=`;(()=>{const menu=document.querySelector('#preview-kit-select'),picker=document.querySelector('#preview-kit-picker');if(!menu)return;const sync=()=>{const playing=document.body.classList.contains('is-playing'),zh=document.documentElement.lang==='zh-Hant';menu.disabled=playing;picker.inert=playing;document.querySelector('#preview-kit-title').textContent=zh?'45 款法寶自由試玩':'Try all 45 ritual kits';document.querySelector('#preview-kit-label').textContent=zh?'切換試玩法寶':'Choose a kit to try';document.querySelector('#preview-kit-note').textContent=zh?'打 12 下即可發動招牌技。試玩進度不會儲存；重新整理後還原。':'Charge a signature with 12 hits. Demo progress resets on reload.';for(const option of menu.options)option.textContent=option.dataset[zh?'zh':'en'];const selected=document.querySelector('#weapon-list [data-weapon]:disabled');menu.value=document.querySelector('#use-hands').disabled?'bare-hand':selected?.dataset.weapon||menu.value;};menu.addEventListener('change',()=>{const button=menu.value==='bare-hand'?document.querySelector('#use-hands'):document.querySelector('[data-weapon="'+menu.value+'"]');button?.click();document.querySelector('.selected-kit')?.scrollIntoView({block:'center',behavior:'instant'});});document.addEventListener('languagechange',sync);document.addEventListener('click',event=>{if(event.target.closest('[data-weapon],#use-hands'))queueMicrotask(sync);});new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();})();`;
await mkdir(output,{recursive:true});
for(const demo of [false,true]){
 const bundled=await build({stdin:{contents:`import ${JSON.stringify(join(repo,'grid-rush/src/playground-ui.js'))};import ${JSON.stringify(join(root,'src/app.js'))};`,resolveDir:root,loader:'js'},bundle:true,write:false,format:'iife',platform:'browser',target:'es2020',charset:'utf8',minify:true,legalComments:'none',plugins:demo?[{name:'visit-only-kit-preview',setup(api){api.onLoad({filter:/app\.js$/},async args=>{if(args.path!==join(root,'src/app.js'))return;const source=await readFile(args.path,'utf8');if(!source.includes(initialState))throw new Error('Preview state initialization no longer matches app.js');return {contents:source.replace(initialState,`state=readProgress(JSON.stringify({...${JSON.stringify(seed)},lastSeen:Date.now()}));persistent=false;storage=null;`),loader:'js'};});}}]:[]});
 let page=html.replace('</body>',()=>`<script data-preview-bundle>${(bundled.outputFiles[0].text+(demo?previewControls:'')).replace(/<\/script/gi,'<\\/script')}</script></body>`);
 if(demo)page=page.replace('<main id="app">',()=>'<main id="app">'+previewBanner);
 if(page.includes('data:text/javascript')||page.includes('Object.defineProperty(window,\'localStorage\''))throw new Error('Preview still depends on nested modules or global storage replacement');
 const name=demo?'beat-bad-luck-skills-demo.html':'beat-bad-luck.html';await writeFile(join(output,name),page);
 if(demo)for(const alias of ['beat-bad-luck-six-kits.html','beat-bad-luck-all-kits.html'])await writeFile(join(output,alias),page);
 console.log(`${name}: ${Buffer.byteLength(page)} bytes, single inline bundle, ${demo?'visit-only all-kit state':'normal game state'}`);
}
