// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-25ab2d535a8c.js');self.addEventListener('install',()=>self.skipWaiting());