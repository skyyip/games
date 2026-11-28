// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1249e1b7df4e.js');self.addEventListener('install',()=>self.skipWaiting());