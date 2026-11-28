// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f1b0fca78a22.js');self.addEventListener('install',()=>self.skipWaiting());