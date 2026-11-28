// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eca133375880.js');self.addEventListener('install',()=>self.skipWaiting());