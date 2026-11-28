// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6906c879aebb.js');self.addEventListener('install',()=>self.skipWaiting());