// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e6d8926e4af3.js');self.addEventListener('install',()=>self.skipWaiting());