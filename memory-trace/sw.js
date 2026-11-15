// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee101628b2c1.js');self.addEventListener('install',()=>self.skipWaiting());