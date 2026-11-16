// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e55385c756e7.js');self.addEventListener('install',()=>self.skipWaiting());