// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-dbfc0ed58faf.js');self.addEventListener('install',()=>self.skipWaiting());