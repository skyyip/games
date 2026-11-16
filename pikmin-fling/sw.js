// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b810ed940b4.js');self.addEventListener('install',()=>self.skipWaiting());