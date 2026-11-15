// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-79a5f7dda0e2.js');self.addEventListener('install',()=>self.skipWaiting());