// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6fe4a1d6ccfb.js');self.addEventListener('install',()=>self.skipWaiting());