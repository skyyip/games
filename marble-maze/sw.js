// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c816c05b1e2.js');self.addEventListener('install',()=>self.skipWaiting());