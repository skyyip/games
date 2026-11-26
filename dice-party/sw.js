// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12325dda6976.js');self.addEventListener('install',()=>self.skipWaiting());