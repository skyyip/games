// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-503c51b7e68b.js');self.addEventListener('install',()=>self.skipWaiting());