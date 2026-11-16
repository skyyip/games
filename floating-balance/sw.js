// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d4fcbcdca67b.js');self.addEventListener('install',()=>self.skipWaiting());