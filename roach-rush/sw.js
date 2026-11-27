// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-97f09a4c49a8.js');self.addEventListener('install',()=>self.skipWaiting());