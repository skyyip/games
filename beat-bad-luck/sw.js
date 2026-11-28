// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d9e8913de21.js');self.addEventListener('install',()=>self.skipWaiting());