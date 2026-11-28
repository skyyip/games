// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4deec0cedb8a.js');self.addEventListener('install',()=>self.skipWaiting());