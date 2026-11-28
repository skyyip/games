// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e604d52ee9b9.js');self.addEventListener('install',()=>self.skipWaiting());