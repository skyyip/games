// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e1234785024c.js');self.addEventListener('install',()=>self.skipWaiting());