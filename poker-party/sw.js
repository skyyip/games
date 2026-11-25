// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c790bebe0d8.js');self.addEventListener('install',()=>self.skipWaiting());