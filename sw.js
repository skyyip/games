// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-612cd998d68c.js');self.addEventListener('install',()=>self.skipWaiting());