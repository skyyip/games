// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-313e008777db.js');self.addEventListener('install',()=>self.skipWaiting());