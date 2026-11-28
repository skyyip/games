// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e11dd553f21.js');self.addEventListener('install',()=>self.skipWaiting());