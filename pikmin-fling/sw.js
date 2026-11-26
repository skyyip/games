// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eee992ff3c22.js');self.addEventListener('install',()=>self.skipWaiting());