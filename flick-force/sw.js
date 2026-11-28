// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-126e48557f68.js');self.addEventListener('install',()=>self.skipWaiting());