// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-477d59936d96.js');self.addEventListener('install',()=>self.skipWaiting());