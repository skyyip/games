import test from 'node:test';import assert from 'node:assert/strict';import {runInNewContext} from 'node:vm';
import {serviceWorkerSource} from '../service-worker-source.mjs';
const origin='https://example.test';
function fixture(){
 const stores=new Map(),calls=[];let active=0,peak=0,offline=false;
 const normalize=value=>new URL(typeof value==='string'?value:value.url,origin).href;
 const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {async match(key){return map.get(normalize(key))?.clone();},async put(key,value){map.set(normalize(key),value.clone());}};},async match(key){for(const map of stores.values()){const response=map.get(normalize(key));if(response)return response.clone();}},async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);}};
 async function fetch(input,options){const url=normalize(input);calls.push({url,options});if(offline)throw Error('offline');active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,2));active--;return new Response('fresh:'+url,{status:url.includes('missing')?404:200});}
 function worker(version,route,assets){const events={};runInNewContext(serviceWorkerSource({version,route,home:'/'+route+'index.html',urls:['/'+route,'/'+route+'index.html',...assets]}),{self:{location:new URL(origin+'/'+route+'sw.js'),clients:{claim:async()=>{}},addEventListener:(type,handler)=>events[type]=handler,skipWaiting(){}},caches,fetch,Response,Headers,URL,Promise,Array,Error});return {async event(type,event={}){let promise;events[type]({...event,waitUntil:p=>promise=p,respondWith:p=>promise=p});return promise;}};}
 return {stores,caches,calls,worker,get peak(){return peak;},set offline(value){offline=value;}};
}
test('install reuses immutable assets, refreshes HTML once, caps parallel fetches and supports offline navigation',async()=>{
 const f=fixture(),old=await f.caches.open('pg-assets-old');await old.put('/assets/logo-a123456789.png',new Response('old immutable'));
 const assets=['/assets/logo-a123456789.png',...Array.from({length:9},(_,i)=>`/built/chunk-a12345678${i}.js`)];const w=f.worker('one','game/',assets);await w.event('install');
 assert.equal(f.calls.filter(r=>r.url.endsWith('/game/index.html')).length,1);assert.equal(f.calls.some(r=>r.url.endsWith('/game/')),false);assert.equal(f.calls.some(r=>r.url.endsWith('logo-a123456789.png')),false);assert(f.peak>1&&f.peak<=4);
 const count=f.calls.length,second=f.worker('one','another/',assets);await second.event('install');assert.equal(f.calls.length-count,1,'a second game only downloads its HTML shell');
 f.offline=true;const response=await w.event('fetch',{request:{url:origin+'/game/?lang=en',mode:'navigate',method:'GET'}});assert.match(await response.text(),/fresh:.*game\/index.html/);assert.equal(response.headers.get('Cache-Control'),'no-cache, no-store, must-revalidate');
 const asset=await w.event('fetch',{request:new Request(origin+assets[0])});assert.equal(await asset.text(),'old immutable');
});
test('a new release fetches changed hashes, reuses unchanged hashes and retains other game caches',async()=>{
 const f=fixture(),shared='/assets/font-a123456789.woff2';await f.worker('one','game/',[shared]).event('install');await f.worker('one','other/',[shared]).event('install');const before=f.calls.length;const next=f.worker('two','game/',[shared,'/built/new-b123456789.js']);await next.event('install');assert.equal(f.calls.length-before,2);await next.event('activate');assert(!f.stores.has('pg-html-game/-one'));assert(f.stores.has('pg-html-other/-one'));assert(f.stores.has('pg-assets-one'),'running old tabs retain immutable assets');
});
test('missing precache assets reject installation rather than claiming offline readiness',async()=>{const f=fixture();await assert.rejects(f.worker('bad','game/',['/assets/missing-a123456789.png']).event('install'),/precache/);});
