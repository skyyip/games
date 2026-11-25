// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81646efd24c2.js');self.addEventListener('install',()=>self.skipWaiting());