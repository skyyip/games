// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e9d7f1c2c36.js');self.addEventListener('install',()=>self.skipWaiting());