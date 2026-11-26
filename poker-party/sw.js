// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-01cbd0be81e4.js');self.addEventListener('install',()=>self.skipWaiting());