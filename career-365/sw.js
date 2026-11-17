// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b9b018ecb87.js');self.addEventListener('install',()=>self.skipWaiting());