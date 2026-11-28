// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e72de546520c.js');self.addEventListener('install',()=>self.skipWaiting());