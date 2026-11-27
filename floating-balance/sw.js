// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48cb223b0730.js');self.addEventListener('install',()=>self.skipWaiting());