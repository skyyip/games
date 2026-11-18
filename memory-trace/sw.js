// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-45f67fcac1e0.js');self.addEventListener('install',()=>self.skipWaiting());