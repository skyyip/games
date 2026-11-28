// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-16b8dcd16ce5.js');self.addEventListener('install',()=>self.skipWaiting());