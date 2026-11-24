// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-758f414e9f9b.js');self.addEventListener('install',()=>self.skipWaiting());