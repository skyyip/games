// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f8aeb437e2c6.js');self.addEventListener('install',()=>self.skipWaiting());