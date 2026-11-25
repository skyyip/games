// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b57d96ec638.js');self.addEventListener('install',()=>self.skipWaiting());