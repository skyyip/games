// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12e9cd502619.js');self.addEventListener('install',()=>self.skipWaiting());