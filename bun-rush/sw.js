// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f932b23d9bbe.js');self.addEventListener('install',()=>self.skipWaiting());