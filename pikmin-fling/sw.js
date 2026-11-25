// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-13e84db3b622.js');self.addEventListener('install',()=>self.skipWaiting());