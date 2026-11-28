// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3133344a876c.js');self.addEventListener('install',()=>self.skipWaiting());