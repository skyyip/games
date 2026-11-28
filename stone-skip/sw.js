// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9915e5950840.js');self.addEventListener('install',()=>self.skipWaiting());