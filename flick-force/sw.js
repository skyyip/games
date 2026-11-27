// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-77a0fb4c4d2b.js');self.addEventListener('install',()=>self.skipWaiting());