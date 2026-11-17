// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fb5dda3dfc6a.js');self.addEventListener('install',()=>self.skipWaiting());