// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4ad6010221cb.js');self.addEventListener('install',()=>self.skipWaiting());