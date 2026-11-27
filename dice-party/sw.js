// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-000d1bf94b7a.js');self.addEventListener('install',()=>self.skipWaiting());