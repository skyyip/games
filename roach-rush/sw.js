// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30ab91c3d655.js');self.addEventListener('install',()=>self.skipWaiting());