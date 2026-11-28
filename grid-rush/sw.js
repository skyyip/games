// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f67d0f3cd8db.js');self.addEventListener('install',()=>self.skipWaiting());