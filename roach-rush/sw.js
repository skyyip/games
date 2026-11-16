// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd36005a9e8c.js');self.addEventListener('install',()=>self.skipWaiting());