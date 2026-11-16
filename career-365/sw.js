// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5201e7dee299.js');self.addEventListener('install',()=>self.skipWaiting());