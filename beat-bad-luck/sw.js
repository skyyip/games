// Existing windows finish their ritual before an update activates.
const CACHE_NAME='beat-bad-luck-app-v34';
const BASE=new URL('./',self.location.href).href,HOME=new URL('./index.html',self.location.href).href;
const APP_FILES=["./", "./index.html", "./styles.css", "./neighbourhood.css", "./src/ritual-flavour.js", "./src/neighbourhood.js", "./src/fortune-catalog.js", "./src/comic-art.js", "./src/neighbourhood-ui.js", "./src/postcard.js", "./src/master-logo.js", "./manifest.webmanifest", "./src/app.js", "./src/game.js", "./src/gestures.js", "./src/catalog.js", "./src/progress.js", "./src/art.js", "./src/expansion-art.js", "./src/audio.js", "./assets/stall-cover.svg", "../grid-rush/victory.css", "../grid-rush/src/victory.js", "../grid-rush/src/party-ui.js", "../grid-rush/playground-ui.css", "../grid-rush/src/playground-ui.js", "../grid-rush/src/navigation.js", "../grid-rush/src/motion.js", "../grid-rush/src/language.js", "../grid-rush/src/translations.js", "../grid-rush/assets/fonts/DMSans.ttf", "../grid-rush/assets/fonts/Fredoka.ttf", "../grid-rush/assets/icons/icon-192.png", "../grid-rush/assets/icons/icon-512.png", "../grid-rush/assets/icons/apple-touch-icon.png"].map(path=>new URL(path,self.location.href).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('beat-bad-luck-app-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;url.search='';
  const navigation=event.request.mode==='navigate';if(navigation&&url.href!==BASE&&url.href!==HOME)return;if(!navigation&&!APP_FILES.includes(url.href))return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);return await cache.match(navigation?HOME:url.href)||fetch(event.request);})());
});
