// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-206349152500.js');self.addEventListener('install',()=>self.skipWaiting());