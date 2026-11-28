// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f55c239b48f0.js');self.addEventListener('install',()=>self.skipWaiting());