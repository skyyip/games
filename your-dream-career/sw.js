// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e617431d53c.js');self.addEventListener('install',()=>self.skipWaiting());