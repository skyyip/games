// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95f5cd2a0e92.js');self.addEventListener('install',()=>self.skipWaiting());