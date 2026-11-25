// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d97e71b2e7b.js');self.addEventListener('install',()=>self.skipWaiting());