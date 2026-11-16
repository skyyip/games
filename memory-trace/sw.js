// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba745bdea09e.js');self.addEventListener('install',()=>self.skipWaiting());