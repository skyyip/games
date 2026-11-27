// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18f11f0c8356.js');self.addEventListener('install',()=>self.skipWaiting());