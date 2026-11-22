const CACHE='you-really-get-them-v4';
const FILES=[
  './','./index.html','./styles.css','./manifest.webmanifest',
  './src/app.js','./src/questions.js','./src/audio.js','./src/storage.js','./src/poster/poster.js',
  './assets/illustrations/woman.webp','./assets/illustrations/man.webp',
  './assets/illustrations/dog.webp','./assets/illustrations/cat.webp',
  './assets/illustrations/duo.webp','./assets/illustrations/scratch.webp'
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
