// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e332e0e256b.js');self.addEventListener('install',()=>self.skipWaiting());