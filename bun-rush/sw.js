// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-24af01fa892c.js');self.addEventListener('install',()=>self.skipWaiting());