// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb0eeda61f65.js');self.addEventListener('install',()=>self.skipWaiting());