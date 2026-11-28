// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a693fa9f68c.js');self.addEventListener('install',()=>self.skipWaiting());