// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b4ff9f3ef10c.js');self.addEventListener('install',()=>self.skipWaiting());