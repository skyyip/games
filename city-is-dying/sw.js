// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98ede1eb28b5.js');self.addEventListener('install',()=>self.skipWaiting());