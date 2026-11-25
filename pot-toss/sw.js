// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e73b7e2d0e30.js');self.addEventListener('install',()=>self.skipWaiting());