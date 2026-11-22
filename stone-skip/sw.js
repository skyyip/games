// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b534af2d47b.js');self.addEventListener('install',()=>self.skipWaiting());