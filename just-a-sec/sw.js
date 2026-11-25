// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-475c24230e5c.js');self.addEventListener('install',()=>self.skipWaiting());