// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9ba0e2bad229.js');self.addEventListener('install',()=>self.skipWaiting());