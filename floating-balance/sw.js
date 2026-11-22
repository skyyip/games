// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bda03833a3ba.js');self.addEventListener('install',()=>self.skipWaiting());