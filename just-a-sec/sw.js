// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b99c8831b46b.js');self.addEventListener('install',()=>self.skipWaiting());