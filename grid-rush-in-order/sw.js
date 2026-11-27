// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d37ef8bc08d1.js');self.addEventListener('install',()=>self.skipWaiting());