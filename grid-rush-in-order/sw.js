// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-88229b192894.js');self.addEventListener('install',()=>self.skipWaiting());