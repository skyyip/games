// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f7b00164e4eb.js');self.addEventListener('install',()=>self.skipWaiting());