// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fc6f04137b1f.js');self.addEventListener('install',()=>self.skipWaiting());