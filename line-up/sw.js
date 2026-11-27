// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-17854cc34592.js');self.addEventListener('install',()=>self.skipWaiting());