// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6b1c949d6bea.js');self.addEventListener('install',()=>self.skipWaiting());