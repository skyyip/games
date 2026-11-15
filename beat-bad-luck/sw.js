// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15541f8326f5.js');self.addEventListener('install',()=>self.skipWaiting());