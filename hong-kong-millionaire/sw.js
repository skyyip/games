// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3db04b1ed82e.js');self.addEventListener('install',()=>self.skipWaiting());