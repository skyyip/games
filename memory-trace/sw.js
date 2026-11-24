// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74599f8b1e8f.js');self.addEventListener('install',()=>self.skipWaiting());