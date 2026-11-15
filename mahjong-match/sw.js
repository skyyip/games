// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3db1b0564929.js');self.addEventListener('install',()=>self.skipWaiting());