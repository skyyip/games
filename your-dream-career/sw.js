// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a3181aa15f3.js');self.addEventListener('install',()=>self.skipWaiting());