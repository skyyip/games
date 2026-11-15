// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a2121d08009b.js');self.addEventListener('install',()=>self.skipWaiting());