// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-412331c68f42.js');self.addEventListener('install',()=>self.skipWaiting());