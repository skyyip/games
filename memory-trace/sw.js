// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4564b2ce0600.js');self.addEventListener('install',()=>self.skipWaiting());