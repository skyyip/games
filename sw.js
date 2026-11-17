// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f1e46ca31e68.js');self.addEventListener('install',()=>self.skipWaiting());