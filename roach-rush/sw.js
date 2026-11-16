// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e24311f0b2c0.js');self.addEventListener('install',()=>self.skipWaiting());