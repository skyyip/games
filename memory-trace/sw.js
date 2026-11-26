// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40351106b5c2.js');self.addEventListener('install',()=>self.skipWaiting());