// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb26f7686c9c.js');self.addEventListener('install',()=>self.skipWaiting());