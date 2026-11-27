// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2dc4d2e2088f.js');self.addEventListener('install',()=>self.skipWaiting());