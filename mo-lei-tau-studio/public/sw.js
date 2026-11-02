// Source/Vite previews do not cache unhashed development modules. The shared
// production builder replaces this with a versioned, offline-ready worker.
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
