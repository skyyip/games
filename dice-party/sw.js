// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-269de53427c9.js');self.addEventListener('install',()=>self.skipWaiting());