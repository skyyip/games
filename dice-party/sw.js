// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-031948df9ac2.js');self.addEventListener('install',()=>self.skipWaiting());