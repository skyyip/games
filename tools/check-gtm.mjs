import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const repo=resolve(import.meta.dirname,'..'),root=resolve(process.argv[2]||repo);
const pages=execFileSync('git',['ls-files','*.html'],{cwd:repo,encoding:'utf8'}).trim().split('\n').filter(name=>name==='index.html'||/^[^/]+\/index\.html$/.test(name));
const container='GTM-K72CNJRN',origin='https://www.googletagmanager.com';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext(),fallbackContext=await browser.newContext({javaScriptEnabled:false});
 let loads=0,fallbackLoads=0;
 await context.route(origin+'/**',route=>{loads++;return route.fulfill({contentType:'application/javascript',body:''});});
 await fallbackContext.route(origin+'/**',route=>{fallbackLoads++;return route.fulfill({contentType:'text/html',body:''});});
 const parser=await context.newPage();
 for(const name of pages){
  const source=await readFile(resolve(root,name),'utf8');
  const embed=await parser.evaluate(({source,container,origin})=>{
   const document=new DOMParser().parseFromString(source,'text/html');
   const scripts=[...document.querySelectorAll('script')].filter(node=>node.textContent.includes(origin+'/gtm.js')&&node.textContent.includes(container));
   const external=[...document.querySelectorAll('script[src]')].filter(node=>{const url=new URL(node.getAttribute('src'),'https://sky-playground.com/');return url.origin===origin&&url.pathname==='/gtm.js';});
   const frames=[...document.querySelectorAll('noscript iframe')].filter(node=>node.getAttribute('src')===origin+'/ns.html?id='+container);
   const loader=scripts[0],frame=frames[0],headScripts=[...document.head.querySelectorAll('script')];
   const earlier=loader?headScripts.slice(0,headScripts.indexOf(loader)).filter(node=>!node.type||/javascript|module/.test(node.type)).filter(node=>!node.textContent.trim().startsWith('window.PLAYGROUND_RELEASE=')):[];
   return {scripts:scripts.length,external:external.length,frames:frames.length,inHead:loader?.parentElement===document.head,early:earlier.length===0,firstBody:document.body.firstElementChild===frame?.parentElement,hidden:frame?.getAttribute('height')==='0'&&frame?.getAttribute('width')==='0'&&/display\s*:\s*none/.test(frame?.getAttribute('style')??''),loader:loader?.outerHTML,fallback:frame?.parentElement.outerHTML};
  },{source,container,origin});
  assert.equal(embed.scripts,1,name+': exactly one inline GTM loader');
  assert.equal(embed.external,0,name+': no extra external GTM script');
  assert.equal(embed.frames,1,name+': exactly one noscript fallback');
  assert.equal(embed.inHead,true,name+': loader is in the head');
  assert.equal(embed.early,true,name+': loader precedes application scripts');
  assert.equal(embed.firstBody,true,name+': fallback is first in the body');
  assert.equal(embed.hidden,true,name+': fallback is visually hidden');
  const page=await context.newPage(),fallbackPage=await fallbackContext.newPage(),before=loads;
  await page.setContent('<!doctype html><html><head>'+embed.loader+'</head><body></body></html>',{waitUntil:'load'});
  assert.equal(loads-before,1,name+': loader requests the container once');
  const runtime=await page.evaluate(()=>({events:window.dataLayer.filter(event=>event.event==='gtm.js').length,source:document.querySelector('script[src]').src}));
  assert.equal(runtime.events,1,name+': one GTM start event');
  assert.equal(runtime.source,origin+'/gtm.js?id='+container,name+': correct container URL');
  const fallbackBefore=fallbackLoads;
  await fallbackPage.setContent('<!doctype html><html><head></head><body>'+embed.fallback+'</body></html>',{waitUntil:'load'});
  assert.equal(fallbackLoads-fallbackBefore,1,name+': no-JavaScript fallback loads once');
  await page.close();await fallbackPage.close();
 }
 console.log(`GTM checks passed for ${pages.length} pages: one early inline loader, one hidden body fallback, correct container, and isolated JavaScript/no-JavaScript loads.`);
}finally{await browser.close();}