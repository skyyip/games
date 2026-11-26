// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1593be01e6d0.js');self.addEventListener('install',()=>self.skipWaiting());