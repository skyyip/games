// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e0d2832557a.js');self.addEventListener('install',()=>self.skipWaiting());