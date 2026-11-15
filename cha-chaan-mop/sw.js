// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4d2ca4947d4c.js');self.addEventListener('install',()=>self.skipWaiting());