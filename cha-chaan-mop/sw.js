// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f084c68bc46b.js');self.addEventListener('install',()=>self.skipWaiting());