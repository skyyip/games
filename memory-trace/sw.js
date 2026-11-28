// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55c7462d393c.js');self.addEventListener('install',()=>self.skipWaiting());