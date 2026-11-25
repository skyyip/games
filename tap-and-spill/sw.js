// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4eb31ac86137.js');self.addEventListener('install',()=>self.skipWaiting());