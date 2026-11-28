// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-29903ec761dc.js');self.addEventListener('install',()=>self.skipWaiting());