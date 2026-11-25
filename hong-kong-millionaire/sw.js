// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e9497d4ec1d.js');self.addEventListener('install',()=>self.skipWaiting());