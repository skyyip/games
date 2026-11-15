// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-07d9349ebb4b.js');self.addEventListener('install',()=>self.skipWaiting());