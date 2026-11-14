const CACHE='hk-millionaire-v1';
// The production builder replaces this source worker with a complete hashed release worker.
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./index.html','./styles.css','./src/app.js','./src/game.js','./src/questions.js','./src/art.js','./src/ledger.js','./src/cloud.js','./src/firebase-settings.js','../beat-bad-luck/src/google-popup.js','../grid-rush/src/site-updates.js','../grid-rush/src/language.js','../grid-rush/src/translations.js']))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request)));});
