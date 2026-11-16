const VERSION="b35abdad1409ca3c",SCOPE="career-365/",HTML='pg-html-'+SCOPE+'-'+VERSION,ASSETS='pg-assets-'+VERSION,FILES=["/games/career-365/","/games/career-365/index.html","/games/assets/website-logo-64-25ee71e48e78.png","/games/built/comic-chinese-5SEFFFUM.css","/games/assets/Iansui-7677d611f1fb.woff2","/games/built/app-MPU56ED4.js","/games/built/chunk-53FYYILE.js","/games/built/chunk-IQOJ73HP.js","/games/built/chunk-KYHCACUM.js","/games/built/chunk-NQG42SLV.js","/games/built/chunk-ZR2R6XIP.js","/games/built/chunk-G7XMJZLX.js","/games/built/chunk-IB3YTW2H.js","/games/built/chunk-FXGKQTRG.js","/games/built/chunk-FYJABB5V.js","/games/built/chunk-ADO2CLF7.js","/games/built/chunk-G2MO5J6P.js","/games/built/chunk-CXALTQMA.js","/games/built/chunk-DDMKLPIW.js","/games/built/chunk-LG5TEVBP.js","/games/built/chunk-S4MATOWM.js","/games/built/site-updates-7RMGFTIX.js","/games/built/chunk-OQ3D3VW4.js","/games/built/chunk-IQS7CIAE.js","/games/built/inline-style-8204cd74f9d2.css","/games/assets/apple-touch-icon-89a88abcfed6.png","/games/assets/favicon-b8d749971090.png","/games/assets/icon-192-367907d68d11.png","/games/assets/icon-512-8515cdffc05b.png","/games/assets/icon-maskable-512-8515cdffc05b.png","/games/assets/playground-source-ef0805bddb25.png"],HOME="/games/career-365/index.html";
const immutable=url=>/\/[^/]+-[a-zA-Z0-9]{8,}\.[a-z0-9]+$/.test(new URL(url,self.location.href).pathname);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const html=await caches.open(HTML),assets=await caches.open(ASSETS);
 const response=await fetch(HOME,{cache:'reload'});if(!response.ok)throw Error('precache '+HOME);
 await html.put(HOME,response.clone());for(const url of FILES)if(url.endsWith('/'))await html.put(url,response.clone());
 const pending=FILES.filter(url=>url!==HOME&&!url.endsWith('/'));let next=0;
 async function copy(){while(next<pending.length){const url=pending[next++];if(await assets.match(url))continue;
  const previous=immutable(url)?await caches.match(url):null;
  if(previous){await assets.put(url,previous);continue;}
  const fresh=await fetch(url,{cache:immutable(url)?'default':'reload'});if(!fresh.ok)throw Error('precache '+url);await assets.put(url,fresh);
 }}
 await Promise.all(Array.from({length:Math.min(4,pending.length)},copy));
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('pg-html-'+SCOPE+'-')&&key!==HTML)await caches.delete(key);await self.clients.claim();})()));
function documentResponse(response){const headers=new Headers(response.headers);headers.set('Cache-Control','no-cache, no-store, must-revalidate');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate')event.respondWith((async()=>{const cache=await caches.open(HTML);try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok){await cache.put(url.pathname,response.clone());return documentResponse(response);}}catch{}const cached=await cache.match(url.pathname)||await cache.match(HOME);return cached?documentResponse(cached):Response.error();})());
 else if(immutable(url.href))event.respondWith((async()=>{const cache=await caches.open(ASSETS),cached=await cache.match(event.request)||await caches.match(event.request);if(cached)return cached;const fresh=await fetch(event.request);if(fresh.ok)await cache.put(event.request,fresh.clone());return fresh;})());
});