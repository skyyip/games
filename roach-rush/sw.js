// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fa3cdc330f1c.js');self.addEventListener('install',()=>self.skipWaiting());