// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-808b9245bff2.js');self.addEventListener('install',()=>self.skipWaiting());