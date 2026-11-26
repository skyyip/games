// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ac37ddd95db.js');self.addEventListener('install',()=>self.skipWaiting());