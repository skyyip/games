// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8b31e8003150.js');self.addEventListener('install',()=>self.skipWaiting());