// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8f2ddd8a1b0c.js');self.addEventListener('install',()=>self.skipWaiting());