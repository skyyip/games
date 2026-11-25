// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-08635748fe8c.js');self.addEventListener('install',()=>self.skipWaiting());