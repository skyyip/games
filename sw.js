// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7cf6426903a1.js');self.addEventListener('install',()=>self.skipWaiting());