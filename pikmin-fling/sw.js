// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46797e7a2ec6.js');self.addEventListener('install',()=>self.skipWaiting());