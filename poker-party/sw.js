// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e685875b266.js');self.addEventListener('install',()=>self.skipWaiting());