// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f2a2d67aeac5.js');self.addEventListener('install',()=>self.skipWaiting());