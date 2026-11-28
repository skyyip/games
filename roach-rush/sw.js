// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15a4a28d2df8.js');self.addEventListener('install',()=>self.skipWaiting());