// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-234953fc56d0.js');self.addEventListener('install',()=>self.skipWaiting());