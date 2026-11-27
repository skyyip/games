// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b27bec0ed27d.js');self.addEventListener('install',()=>self.skipWaiting());