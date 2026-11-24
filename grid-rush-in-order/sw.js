// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e06abbb91795.js');self.addEventListener('install',()=>self.skipWaiting());