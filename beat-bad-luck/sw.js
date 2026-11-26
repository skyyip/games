// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f8dc2408e8c8.js');self.addEventListener('install',()=>self.skipWaiting());