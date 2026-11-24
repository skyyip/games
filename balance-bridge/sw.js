// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-07da8101937c.js');self.addEventListener('install',()=>self.skipWaiting());