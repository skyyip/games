// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-850e2f982fd5.js');self.addEventListener('install',()=>self.skipWaiting());