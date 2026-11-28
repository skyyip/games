// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b8d8a359c22.js');self.addEventListener('install',()=>self.skipWaiting());