// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d5f5baf143da.js');self.addEventListener('install',()=>self.skipWaiting());