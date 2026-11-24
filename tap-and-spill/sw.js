// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a0c4519b3c9b.js');self.addEventListener('install',()=>self.skipWaiting());