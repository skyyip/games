// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d578edc75bdb.js');self.addEventListener('install',()=>self.skipWaiting());