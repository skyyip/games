// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4bf6d0944705.js');self.addEventListener('install',()=>self.skipWaiting());