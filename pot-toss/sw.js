// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b65d07d827c.js');self.addEventListener('install',()=>self.skipWaiting());