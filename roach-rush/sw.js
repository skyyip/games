// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-735417f4136b.js');self.addEventListener('install',()=>self.skipWaiting());