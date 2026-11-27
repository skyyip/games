// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-346dea379a30.js');self.addEventListener('install',()=>self.skipWaiting());