// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e8b786f6ac8c.js');self.addEventListener('install',()=>self.skipWaiting());