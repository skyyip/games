const VERSION="3921bb199dd1fcb0",SCOPE="just-a-sec/",HTML='pg-html-'+SCOPE+'-'+VERSION,ASSETS='pg-assets-'+VERSION,FILES=["/games/just-a-sec/","/games/just-a-sec/index.html","/games/assets/website-logo-64-25ee71e48e78.png","/games/assets/website-logo-180-81135a437255.png","/games/built/styles-3Z46GVM2.css","/games/assets/DMSans-104ce0bffb9c.woff2","/games/assets/SpaceGrotesk-a4041ad0273a.woff2","/games/built/playground-ui-XJEEA2R6.css","/games/built/navigation-WEUSWSER.js","/games/built/playground-ui-4CNLWQ67.js","/games/built/chunk-ZR5TLNN3.js","/games/built/chunk-RDQYHX4T.js","/games/built/chunk-3K66BQTH.js","/games/built/chunk-76IJRKOE.js","/games/built/app-BZOQKH3V.js","/games/built/victory-QFEP26YR.css","/games/built/comic-chinese-5SEFFFUM.css","/games/assets/Iansui-7677d611f1fb.woff2","/games/built/site-updates-JVDOIE6B.js","/games/built/chunk-4BOP7ERZ.js","/games/built/inline-style-fd60b29b20ac.css","/games/assets/apple-touch-icon-89a88abcfed6.png","/games/assets/favicon-b8d749971090.png","/games/assets/icon-192-367907d68d11.png","/games/assets/icon-512-8515cdffc05b.png","/games/assets/icon-maskable-512-8515cdffc05b.png","/games/assets/playground-source-ef0805bddb25.png"],HOME="/games/just-a-sec/index.html";
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