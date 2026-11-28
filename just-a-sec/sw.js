// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b9f74e7d18f.js');self.addEventListener('install',()=>self.skipWaiting());