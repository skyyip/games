// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1fe04426e256.js');self.addEventListener('install',()=>self.skipWaiting());