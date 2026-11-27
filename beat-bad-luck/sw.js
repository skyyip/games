// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-075d5d2a1701.js');self.addEventListener('install',()=>self.skipWaiting());