// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a8516c1417c.js');self.addEventListener('install',()=>self.skipWaiting());