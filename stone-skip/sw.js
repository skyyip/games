// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4d50d5d9d4ec.js');self.addEventListener('install',()=>self.skipWaiting());