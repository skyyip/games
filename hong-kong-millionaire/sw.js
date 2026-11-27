// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e429fd4fbf2.js');self.addEventListener('install',()=>self.skipWaiting());