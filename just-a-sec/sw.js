// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1ca5a7e20f6e.js');self.addEventListener('install',()=>self.skipWaiting());