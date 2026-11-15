// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9122d0231cd3.js');self.addEventListener('install',()=>self.skipWaiting());