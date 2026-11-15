// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-003fc15c538c.js');self.addEventListener('install',()=>self.skipWaiting());