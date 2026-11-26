// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b9815bfca17.js');self.addEventListener('install',()=>self.skipWaiting());