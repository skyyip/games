// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9ba102c93e22.js');self.addEventListener('install',()=>self.skipWaiting());