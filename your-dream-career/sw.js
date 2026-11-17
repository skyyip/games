// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-31d6ef628916.js');self.addEventListener('install',()=>self.skipWaiting());