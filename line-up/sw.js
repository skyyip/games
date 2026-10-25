// Updates activate after existing Line Up windows close, preserving active rounds.
const CACHE_NAME='line-up-app-v32';
const BASE=new URL('./',self.location.href).href;
const HOME=new URL('./index.html',self.location.href).href;
const APP_FILES=['../grid-rush/victory.css','../grid-rush/src/victory.js','./','./index.html','./styles.css','./manifest.webmanifest','./src/app.js','./src/game.js','./src/geometry.js','../grid-rush/playground-ui.css','../grid-rush/src/playground-ui.js','../grid-rush/src/navigation.js','../grid-rush/src/motion.js','../grid-rush/src/language.js','../grid-rush/src/translations.js','../grid-rush/assets/fonts/DMSans.ttf','../grid-rush/assets/fonts/SpaceGrotesk.ttf','../grid-rush/assets/icons/icon-192.png','../grid-rush/assets/icons/icon-512.png','../grid-rush/assets/icons/apple-touch-icon.png'].map(path=>new URL(path,self.location.href).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('line-up-app-')&&name!==CACHE_NAME).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  url.search='';
  const navigation=event.request.mode==='navigate';
  if(navigation && url.href!==BASE && url.href!==HOME)return;
  if(!navigation && !APP_FILES.includes(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    return await cache.match(navigation?HOME:url.href)||fetch(event.request);
  })());
});
