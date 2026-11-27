// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e48cd75a1ac.js');self.addEventListener('install',()=>self.skipWaiting());