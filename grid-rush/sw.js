// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2d50a1ac8562.js');self.addEventListener('install',()=>self.skipWaiting());