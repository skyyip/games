// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2138f3ad0f7b.js');self.addEventListener('install',()=>self.skipWaiting());