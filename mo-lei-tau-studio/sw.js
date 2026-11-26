// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c6ed600546c.js');self.addEventListener('install',()=>self.skipWaiting());