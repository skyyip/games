// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-31a240c77ecb.js');self.addEventListener('install',()=>self.skipWaiting());