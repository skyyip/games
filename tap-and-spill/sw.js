// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-102218c0be20.js');self.addEventListener('install',()=>self.skipWaiting());