// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-881e5447ef3b.js');self.addEventListener('install',()=>self.skipWaiting());