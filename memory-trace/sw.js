// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74a1d7d2881e.js');self.addEventListener('install',()=>self.skipWaiting());