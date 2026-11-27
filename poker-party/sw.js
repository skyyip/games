// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6f9fb2e4de1d.js');self.addEventListener('install',()=>self.skipWaiting());