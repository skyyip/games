// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-87f87ee64a2c.js');self.addEventListener('install',()=>self.skipWaiting());