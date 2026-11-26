const CACHE='you-really-get-them-v64';
const FILES=[
  './','./index.html','./styles.css','./manifest.webmanifest',
  './src/app.js','./src/progression.js','./src/wallet-model.js','./src/story-events.js','./src/banter.js','./src/companions.js','./src/gacha.js','./src/settlement.js','./src/comedy.js','./src/picture-questions.js','./src/firebase/cloud.js','./src/firebase/wallet-transaction.js','./src/firebase/config.js','./src/questions.js','./src/audio.js','./src/storage.js','./src/poster/poster.js',
  './assets/illustrations/woman.webp','./assets/illustrations/man.webp',
  './assets/illustrations/dog.webp','./assets/illustrations/cat.webp',
  './assets/illustrations/duo.webp',
  './assets/illustrations/question-polaroids.webp',
  './assets/illustrations/collection-polaroids.webp','./assets/illustrations/gacha-polaroids.webp','./assets/illustrations/pet-breeds.webp','./assets/illustrations/everyday-polaroids.webp','./assets/illustrations/festival-polaroids.webp','./assets/illustrations/weekend-polaroids.webp','./assets/illustrations/bonus-polaroids.webp','./assets/illustrations/metro-polaroids.webp','./assets/illustrations/night-polaroids.webp','./assets/illustrations/commute-polaroids.webp','./assets/illustrations/normal-color-0.webp','./assets/illustrations/normal-color-1.webp','./assets/illustrations/normal-color-2.webp','./assets/illustrations/outing-polaroids.webp','./assets/illustrations/homecoming-polaroids.webp','./assets/illustrations/picture-stories.webp',
  './assets/icons/cards.png','./assets/icons/cat.png','./assets/icons/dog.png',
  './assets/icons/duo.png','./assets/icons/heart.png','./assets/icons/lightning.png',
  './assets/icons/man.png','./assets/icons/paw-cup.png','./assets/icons/pig.png',
  './assets/icons/press.png','./assets/icons/sneaker.png','./assets/icons/sound.png',
  './assets/icons/spark.png','./assets/icons/treat.png',
  './assets/icons/woman.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const requestUrl=new URL(event.request.url);
  // Firebase SDK and OAuth endpoints must always use the network, never SW cache.
  if(requestUrl.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }catch(error){
      if(event.request.mode==='navigate'){
        return (await caches.match('./index.html'))||Response.error();
      }
      return Response.error();
    }
  })());
});
