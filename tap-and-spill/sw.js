// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15970d9b37e1.js');self.addEventListener('install',()=>self.skipWaiting());