// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55d9e20c2d4a.js');self.addEventListener('install',()=>self.skipWaiting());