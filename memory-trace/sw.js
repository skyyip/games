// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78f00c1d7b2c.js');self.addEventListener('install',()=>self.skipWaiting());