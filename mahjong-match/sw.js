// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e082cca88f1.js');self.addEventListener('install',()=>self.skipWaiting());