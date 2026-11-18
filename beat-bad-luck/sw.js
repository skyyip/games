// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9a3ed2e8e28c.js');self.addEventListener('install',()=>self.skipWaiting());