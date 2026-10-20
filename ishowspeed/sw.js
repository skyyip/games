// Bump the version whenever an app asset changes. An update waits until existing
// app windows close, so it cannot replace a player's game during a round.
const CACHE_NAME = 'grid-rush-app-v1';
const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './favicon.svg',
  './manifest.webmanifest',
  './src/app.js',
  './src/game.js',
  './src/leaderboard.js',
  './src/pwa.js',
  './assets/fonts/DMSans.ttf',
  './assets/fonts/SpaceGrotesk.ttf',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
].map(path => new URL(path, self.location.href).href);
const HOME = new URL('./index.html', self.location.href).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('grid-rush-app-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  url.search = '';
  if (event.request.mode !== 'navigate' && !APP_FILES.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request.mode === 'navigate' ? HOME : url.href);
    return cached || fetch(event.request);
  })());
});
