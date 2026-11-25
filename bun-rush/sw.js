// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0198cf034f33.js');self.addEventListener('install',()=>self.skipWaiting());