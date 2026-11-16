// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-089c21f9e120.js');self.addEventListener('install',()=>self.skipWaiting());