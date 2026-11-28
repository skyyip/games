// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-824ecbaf7012.js');self.addEventListener('install',()=>self.skipWaiting());