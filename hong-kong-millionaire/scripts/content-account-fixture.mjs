// Authenticated content QA only. Never imported by the shipped application.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const CONTENT_KEY='qa.hkm.content-run';
export async function installContentAccount(context,base){
 const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
 const manifest=JSON.parse(await readFile(process.env.HKM_BUILD_DIR+'/build-manifest.json','utf8'));
 const art=Object.fromEntries(Object.entries(manifest.assets).filter(([name])=>name.startsWith('hong-kong-millionaire/assets/')).map(([name,url])=>[name.split('/').at(-1).replace('.svg',''),new URL('../'+url,base).href]));
 const game=fileURLToPath(new URL('../src/game.js',import.meta.url));
 const adapter=`import {newRun,act,hkDay} from ${JSON.stringify(game)};
 const key=${JSON.stringify(CONTENT_KEY)},uid='content-player';
 const read=()=>{const entry=JSON.parse(localStorage.getItem(key));return entry?.run?{...entry.run,uid}:null;};
 const save=run=>{localStorage.setItem(key,JSON.stringify({owner:uid,run}));return run;};
 export const configured=true;export async function prepareAuth(){}export async function observeAuth(cb){await cb({uid,email:'content@example.test'});return ()=>{};}
 export async function account(){return {uid,displayName:'測試街坊',total:0,bestPrize:0,games:0,titles:[],unlocked:[],wrong:[],favourites:[]};}
 export async function resumeAccount(){return {profile:await account(),run:read()};}export async function currentRun(){return read();}
 export async function claimDaily(){return save(newRun(hkDay(),Date.now(),uid));}
 export async function move(day,action){return save(act(read(),action));}
 export async function settle(day,reason){const run=read();return run.phase==='finished'?run:save(act(run,{type:reason==='walk'?'walk':'finish'}));}
 export async function leaderboard(){return [];}export async function history(){return [];}export const favourite=account,saveName=account;
 export async function resetPassword(){}export async function logout(){}export async function emailLogin(){}export function googleLogin(){}
 export function errorText(e){return e.message;}`;
 const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/app.js',import.meta.url))],bundle:true,write:false,format:'esm',logLevel:'silent',plugins:[{name:'authenticated-content',setup(b){
  b.onResolve({filter:/^\.\/cloud\.js$/},args=>args.importer.endsWith('/src/app.js')?{path:'content-account',namespace:'content-qa'}:undefined);
  b.onLoad({filter:/.*/,namespace:'content-qa'},()=>({contents:adapter,loader:'js',resolveDir:fileURLToPath(new URL('../src/',import.meta.url))}));
  b.onLoad({filter:/\/src\/art\.js$/},()=>({contents:'export const ART='+JSON.stringify(art),loader:'js'}));
 }}]});
 const harness=new URL('content-account-qa.js',base).href;
 await context.route(harness,r=>r.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0].text}));
 await context.route(base,async r=>{const response=await r.fetch();const html=(await response.text()).replace(/<script\b[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi,'');await r.fulfill({response,body:html.replace('</body>',`<script type="module" src="${harness}"></script></body>`)});});
}
