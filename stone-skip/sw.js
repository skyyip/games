// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a1ac65563c8.js');self.addEventListener('install',()=>self.skipWaiting());