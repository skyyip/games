// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1f7484fc9c2b.js');self.addEventListener('install',()=>self.skipWaiting());