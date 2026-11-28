// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2e4c62d65a90.js');self.addEventListener('install',()=>self.skipWaiting());