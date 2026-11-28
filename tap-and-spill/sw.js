// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d51e04ed785a.js');self.addEventListener('install',()=>self.skipWaiting());