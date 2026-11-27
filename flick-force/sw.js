// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb65467c28d0.js');self.addEventListener('install',()=>self.skipWaiting());