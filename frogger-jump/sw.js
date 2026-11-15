// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-17740897009b.js');self.addEventListener('install',()=>self.skipWaiting());