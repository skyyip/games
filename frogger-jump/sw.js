// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d74f7e03e5c.js');self.addEventListener('install',()=>self.skipWaiting());