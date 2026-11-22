// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d091aa7d20b.js');self.addEventListener('install',()=>self.skipWaiting());