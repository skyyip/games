// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-45c793a6452c.js');self.addEventListener('install',()=>self.skipWaiting());