// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-43d6ef7e0151.js');self.addEventListener('install',()=>self.skipWaiting());