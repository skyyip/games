// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9dbd301c0bee.js');self.addEventListener('install',()=>self.skipWaiting());