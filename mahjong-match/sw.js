// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ef375df57612.js');self.addEventListener('install',()=>self.skipWaiting());