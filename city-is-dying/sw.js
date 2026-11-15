// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-956cbd5aad76.js');self.addEventListener('install',()=>self.skipWaiting());