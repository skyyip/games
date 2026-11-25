// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a6b1a4dcb30.js');self.addEventListener('install',()=>self.skipWaiting());