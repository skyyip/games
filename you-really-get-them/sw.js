// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd5f1834d64b.js');self.addEventListener('install',()=>self.skipWaiting());