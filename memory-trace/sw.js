// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6e35e1f6fe9c.js');self.addEventListener('install',()=>self.skipWaiting());