// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3c3707862d9c.js');self.addEventListener('install',()=>self.skipWaiting());