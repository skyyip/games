// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e31558a68a1e.js');self.addEventListener('install',()=>self.skipWaiting());