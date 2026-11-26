// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e5c2cee2d2af.js');self.addEventListener('install',()=>self.skipWaiting());