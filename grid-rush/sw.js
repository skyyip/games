// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4cb416a5f1a6.js');self.addEventListener('install',()=>self.skipWaiting());