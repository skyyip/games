// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3048365f29d9.js');self.addEventListener('install',()=>self.skipWaiting());