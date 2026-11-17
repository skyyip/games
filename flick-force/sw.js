// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-873d4a920df7.js');self.addEventListener('install',()=>self.skipWaiting());