// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e4bbefc0850.js');self.addEventListener('install',()=>self.skipWaiting());