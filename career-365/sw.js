// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f61b9a1fb96b.js');self.addEventListener('install',()=>self.skipWaiting());