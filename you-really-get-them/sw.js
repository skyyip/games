// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3a86e419e00c.js');self.addEventListener('install',()=>self.skipWaiting());