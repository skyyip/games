// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-05c150bb4a65.js');self.addEventListener('install',()=>self.skipWaiting());