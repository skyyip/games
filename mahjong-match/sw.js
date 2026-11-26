// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-76f8406b8c2e.js');self.addEventListener('install',()=>self.skipWaiting());