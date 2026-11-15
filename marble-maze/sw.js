// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9383126dd337.js');self.addEventListener('install',()=>self.skipWaiting());