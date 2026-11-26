// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-83a5309e9dde.js');self.addEventListener('install',()=>self.skipWaiting());