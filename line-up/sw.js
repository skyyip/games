// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd50d556362b.js');self.addEventListener('install',()=>self.skipWaiting());