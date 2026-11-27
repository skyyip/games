// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fcc946487b31.js');self.addEventListener('install',()=>self.skipWaiting());