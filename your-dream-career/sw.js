// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d25fe80ad9ba.js');self.addEventListener('install',()=>self.skipWaiting());