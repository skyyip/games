// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7e6b147120bd.js');self.addEventListener('install',()=>self.skipWaiting());