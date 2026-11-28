// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-067b963a6a2c.js');self.addEventListener('install',()=>self.skipWaiting());