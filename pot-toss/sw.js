// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80cc7a0c5818.js');self.addEventListener('install',()=>self.skipWaiting());