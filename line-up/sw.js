// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9386131c1b9e.js');self.addEventListener('install',()=>self.skipWaiting());