// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd6cfcd3253a.js');self.addEventListener('install',()=>self.skipWaiting());