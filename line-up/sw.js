// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3fda6cd9acd8.js');self.addEventListener('install',()=>self.skipWaiting());