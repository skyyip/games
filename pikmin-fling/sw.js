// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-062f1717dae1.js');self.addEventListener('install',()=>self.skipWaiting());