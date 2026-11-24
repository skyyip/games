// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ebff7e7d09b.js');self.addEventListener('install',()=>self.skipWaiting());