// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3845b350d9a6.js');self.addEventListener('install',()=>self.skipWaiting());