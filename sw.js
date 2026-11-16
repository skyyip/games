// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d68eb87a1c2b.js');self.addEventListener('install',()=>self.skipWaiting());