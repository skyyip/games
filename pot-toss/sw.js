// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8dea13a26ac9.js');self.addEventListener('install',()=>self.skipWaiting());