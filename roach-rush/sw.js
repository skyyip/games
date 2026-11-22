// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9a86cb383b99.js');self.addEventListener('install',()=>self.skipWaiting());