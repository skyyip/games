// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ccbe77347fcd.js');self.addEventListener('install',()=>self.skipWaiting());