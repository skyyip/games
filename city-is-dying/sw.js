// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5838891af49e.js');self.addEventListener('install',()=>self.skipWaiting());