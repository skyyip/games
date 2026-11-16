// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-31f21bfc4260.js');self.addEventListener('install',()=>self.skipWaiting());