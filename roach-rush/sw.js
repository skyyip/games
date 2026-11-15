// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d6b404b1e83.js');self.addEventListener('install',()=>self.skipWaiting());