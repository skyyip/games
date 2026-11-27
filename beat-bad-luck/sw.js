// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e32f22520deb.js');self.addEventListener('install',()=>self.skipWaiting());