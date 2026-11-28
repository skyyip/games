// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e2e500e9f8f8.js');self.addEventListener('install',()=>self.skipWaiting());