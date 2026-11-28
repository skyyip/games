// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-23b0e1520161.js');self.addEventListener('install',()=>self.skipWaiting());