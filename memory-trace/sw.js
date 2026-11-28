// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-14bb0c9e2a5e.js');self.addEventListener('install',()=>self.skipWaiting());