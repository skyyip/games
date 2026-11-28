// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4513c36b2686.js');self.addEventListener('install',()=>self.skipWaiting());