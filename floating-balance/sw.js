// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7a15e02999c9.js');self.addEventListener('install',()=>self.skipWaiting());