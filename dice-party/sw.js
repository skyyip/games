// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-84b1b8e17500.js');self.addEventListener('install',()=>self.skipWaiting());