// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-984ed5e2edd6.js');self.addEventListener('install',()=>self.skipWaiting());