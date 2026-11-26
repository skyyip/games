// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-52d9f30dc4af.js');self.addEventListener('install',()=>self.skipWaiting());