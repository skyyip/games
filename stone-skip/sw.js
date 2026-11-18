// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-72cb5d09966b.js');self.addEventListener('install',()=>self.skipWaiting());