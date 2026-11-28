// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7c8e27ad6f6.js');self.addEventListener('install',()=>self.skipWaiting());