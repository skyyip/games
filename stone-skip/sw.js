// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-176c87c32942.js');self.addEventListener('install',()=>self.skipWaiting());