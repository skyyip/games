// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fc40def46938.js');self.addEventListener('install',()=>self.skipWaiting());