// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92c1162e2468.js');self.addEventListener('install',()=>self.skipWaiting());