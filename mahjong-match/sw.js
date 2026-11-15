// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4f29998b2c1d.js');self.addEventListener('install',()=>self.skipWaiting());