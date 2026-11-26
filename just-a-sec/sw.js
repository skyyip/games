// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-497c5d32f3f6.js');self.addEventListener('install',()=>self.skipWaiting());