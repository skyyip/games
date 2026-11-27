// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-219c9351315c.js');self.addEventListener('install',()=>self.skipWaiting());